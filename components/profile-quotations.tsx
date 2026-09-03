"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { QuotationApiError, quotationsApi, type Quotation } from "@/lib/quotations-api"

const withdrawable = new Set(["pending", "reviewing", "countered"])
const statusStyle: Record<string, string> = { pending: "bg-amber-50 text-amber-800", reviewing: "bg-blue-50 text-blue-700", countered: "bg-violet-50 text-violet-700", accepted: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700", withdrawn: "bg-neutral-100 text-neutral-600", expired: "bg-neutral-100 text-neutral-600" }
const price = (amount: number | null, currency = "TZS") => amount == null ? "—" : `${amount.toLocaleString("en-US")} ${currency}`

export function ProfileQuotations() {
  const router = useRouter()
  const { clearAuthenticatedUser } = useAuth()
  const [items, setItems] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  const handleError = useCallback((cause: unknown) => {
    if (cause instanceof QuotationApiError) {
      if (cause.status === 401) { clearAuthenticatedUser(); router.replace("/signin?next=/profile"); return }
      setError(`${cause.message}${cause.requestId ? ` Support reference: ${cause.requestId}` : ""}`)
    } else setError("Unable to load your quotations. Please try again.")
  }, [clearAuthenticatedUser, router])

  useEffect(() => {
    quotationsApi.list().then((result) => setItems(result.data)).catch(handleError).finally(() => setLoading(false))
  }, [handleError])

  async function withdraw(item: Quotation) {
    setPendingId(item.id); setError("")
    try {
      const result = await quotationsApi.withdraw(item.id)
      setItems((current) => current.map((value) => value.id === item.id ? result.quotation : value))
    } catch (cause) { handleError(cause) } finally { setPendingId(null) }
  }

  if (loading) return <div className="min-h-72 animate-pulse rounded-lg border bg-muted/40" aria-label="Loading quotations" />
  if (!items.length) return <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border px-6 py-12 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full border text-primary"><FileText className="h-7 w-7" /></div><h2 className="mt-5 text-xl font-bold">No quotations yet</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Your vehicle price requests and their review status will appear here.</p></div>

  return <div className="space-y-4">{error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{items.map((item) => {
    const vehicle = item.vehicleSnapshot ?? item.vehicle
    const title = vehicle?.title ?? vehicle?.name ?? `Vehicle #${item.carId}`
    const image = vehicle?.image ?? vehicle?.images?.[0]
    return <article key={item.id} className="grid gap-5 rounded-xl border bg-card p-4 sm:grid-cols-[180px_1fr] sm:p-5">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted sm:aspect-[4/3]">{image ? <Image src={image} alt={title} fill className="object-cover" unoptimized={image.startsWith("http")} /> : <FileText className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />}</div>
      <div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{item.reference}</p><h3 className="mt-1 text-lg font-bold">{vehicle?.year ? `${vehicle.year} ` : ""}{title}</h3><p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[item.status] ?? "bg-muted"}`}>{item.status}</span></div>
        <div className="mt-4 grid gap-3 border-y py-3 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Your offer</p><p className="font-semibold">{price(item.proposedPrice, item.currency)}</p></div><div><p className="text-xs text-muted-foreground">Counter-offer</p><p className="font-semibold">{price(item.counterPrice, item.currency)}</p></div>{vehicle?.listedPrice != null && <div><p className="text-xs text-muted-foreground">Listed price at request</p><p className="font-semibold">{typeof vehicle.listedPrice === "number" ? price(vehicle.listedPrice) : vehicle.listedPrice}</p></div>}</div>
        <div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><a href={quotationsApi.localPreviewUrl(item.id)} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />Open PDF</a></Button>{withdrawable.has(item.status) && <Button size="sm" variant="ghost" disabled={pendingId === item.id} onClick={() => withdraw(item)}>{pendingId === item.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Withdraw request</Button>}</div>
      </div>
    </article>
  })}</div>
}
