"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, FileText, Loader2, MapPin, User, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Car } from "@/lib/cars-data"
import { checkoutDraftFromStorage, checkoutDraftStorageKey, EMPTY_CHECKOUT_FORM, type CheckoutFormData } from "@/lib/checkout-draft"
import { getDisplayPrice } from "@/lib/promotions"

function money(value: string) {
  const amount = Number(value)
  return amount > 0 ? `${amount.toLocaleString("en-US")} Tshs` : "—"
}

export function CheckoutContent({ car }: { car: Car }) {
  const { user, isAuthenticated, clearAuthenticatedUser } = useAuth()
  const [form, setForm] = useState<CheckoutFormData>({ ...EMPTY_CHECKOUT_FORM })
  const [hydrated, setHydrated] = useState(false)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [reference, setReference] = useState("")
  const skipPersist = useRef(false)
  const listedPrice = getDisplayPrice(car).current
  const gallery = Array.from(new Set([car.image, ...(car.images ?? [])].filter(Boolean))).slice(0, 4)

  useEffect(() => {
    skipPersist.current = true
    const saved = checkoutDraftFromStorage(sessionStorage.getItem(checkoutDraftStorageKey(car.id)))
    setForm({ ...saved, fullName: saved.fullName || user?.username?.toUpperCase() || "", email: saved.email || user?.email || "", phone: saved.phone || user?.phone || "" })
    setHydrated(true)
  }, [car.id, user])

  useEffect(() => {
    if (!hydrated) return
    if (skipPersist.current) { skipPersist.current = false; return }
    sessionStorage.setItem(checkoutDraftStorageKey(car.id), JSON.stringify(form))
  }, [form, car.id, hydrated])

  const set = (field: keyof CheckoutFormData, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }))

  function showPreview() {
    const missing = [!form.fullName.trim() && "full name", !form.phone.trim() && "phone number", !form.email.trim() && "email", !(Number(form.quotationPrice) > 0) && "proposed price"].filter(Boolean)
    if (missing.length) return setError(`Please enter your ${missing.join(", ")}.`)
    if (!form.agreeToTerms) return setError("Please agree to the terms before previewing your request.")
    setError("")
    setPreview(true)
  }

  async function submit() {
    if (!isAuthenticated) { window.location.href = `/signin?next=${encodeURIComponent(`/checkout/${car.id}`)}`; return }
    setSubmitting(true)
    const pdfWindow = window.open("", "_blank")
    if (pdfWindow) pdfWindow.opener = null
    try {
      const response = await fetch("/api/quotations", {
        method: "POST", credentials: "include", headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ carId: Number(car.id), proposedPrice: Number(form.quotationPrice), currency: "TZS", buyer: { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() }, delivery: { address: form.address.trim(), city: form.city.trim(), region: form.region.trim(), postalCode: form.postalCode.trim() }, notes: form.additionalInfo.trim() || null }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        const apiError = body?.error
        if (response.status === 401) {
          pdfWindow?.close()
          clearAuthenticatedUser()
          window.location.href = `/signin?next=${encodeURIComponent(`/checkout/${car.id}`)}`
          return
        }
        const fieldMessages = Object.values(apiError?.fields ?? {}).flat().filter((value): value is string => typeof value === "string")
        const message = apiError?.code === "CAR_NOT_AVAILABLE"
          ? "This vehicle is no longer available for quotation."
          : apiError?.code === "DUPLICATE_QUOTATION"
            ? "You recently submitted the same quotation request. Check the Quotes tab in your profile."
            : fieldMessages.length
              ? fieldMessages.join(" ")
              : apiError?.message ?? "The quotation request could not be sent. Please try again."
        throw new Error(`${message}${apiError?.requestId ? ` Support reference: ${apiError.requestId}` : ""}`)
      }
      const quotation = body?.quotation
      setReference(String(quotation?.reference ?? "Submitted"))
      sessionStorage.removeItem(checkoutDraftStorageKey(car.id))
      const previewUrl = quotation?.id ? `/api/quotations/${quotation.id}/preview` : quotation?.previewPdfUrl
      if (previewUrl) {
        if (pdfWindow) pdfWindow.location.href = previewUrl
        else window.open(previewUrl, "_blank", "noopener,noreferrer")
      } else pdfWindow?.close()
    } catch (cause) {
      pdfWindow?.close()
      setError(cause instanceof Error ? cause.message : "The quotation request could not be sent. Please try again.")
      setPreview(false)
    } finally { setSubmitting(false) }
  }

  return <div className="pb-12 pt-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Link href={`/car/${car.id}`} className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to car details</Link>
    <h1 className="mb-2 text-3xl font-bold">Request a quotation</h1><p className="mb-8 text-muted-foreground">Tell us your proposed price. No payment is taken on this page.</p>
    <div className="grid gap-8 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><User className="h-5 w-5" />Requester information</h2><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name *" id="fullName"><Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value.toUpperCase())} placeholder="JOHN DOE" /></Field>
        <Field label="Phone Number *" id="phone"><Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+255 123 456 789" /></Field>
        <div className="sm:col-span-2"><Field label="Email Address *" id="email"><Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" /></Field></div>
      </div></section>
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-2 text-xl font-bold">Your proposed price</h2><p className="mb-5 text-sm text-muted-foreground">Enter the amount you would like TG World to consider. This is a request, not a payment.</p><div className="relative"><Input type="number" min="1" value={form.quotationPrice} onChange={(e) => set("quotationPrice", e.target.value)} placeholder="e.g. 350000000" className="h-12 pr-16 text-lg font-semibold" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Tshs</span></div></section>
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-2 flex items-center gap-2 text-xl font-bold"><MapPin className="h-5 w-5" />Preferred delivery address</h2><p className="mb-5 text-sm text-muted-foreground">Optional — add where you would like the vehicle delivered.</p><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-3"><Field label="Street Address" id="address"><Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field></div><Field label="City" id="city"><Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} /></Field><Field label="Region" id="region"><Input id="region" value={form.region} onChange={(e) => set("region", e.target.value)} /></Field><Field label="Postal Code" id="postal"><Input id="postal" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></Field></div></section>
      <section className="rounded-2xl border bg-card p-6"><h2 className="mb-3 text-xl font-bold">Additional request details</h2><Textarea rows={4} value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)} placeholder="Colour preference, financing question, trade-in details, or anything else..." /></section>
      <section className="rounded-2xl border bg-card p-6">{error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}<div className="mb-6 flex items-start gap-3"><Checkbox id="terms" checked={form.agreeToTerms} onCheckedChange={(v) => set("agreeToTerms", v === true)} /><Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-muted-foreground">I agree that TG World may contact me about this quotation request. I understand this is not a confirmed sale or payment.</Label></div><Button onClick={showPreview} disabled={!form.agreeToTerms} className="h-14 w-full rounded-xl text-lg font-semibold disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"><FileText className="mr-2 h-5 w-5" />Preview quotation request</Button></section>
    </div><aside><div className="sticky top-24 rounded-2xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Vehicle summary</h2><CarImage src={car.image} alt={`${car.year} ${car.name}`} large /><h3 className="mt-4 text-lg font-semibold">{car.year} {car.name}</h3><p className="mt-1 text-sm text-muted-foreground">{[car.mileage, car.fuel, car.transmission].filter(Boolean).join(" • ")}</p><div className="mt-5 space-y-3 border-y py-4 text-sm"><Line label="Listed price" value={listedPrice} />{form.quotationPrice && <Line label="Your proposal" value={money(form.quotationPrice)} accent />}</div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">A sales representative will review your request and contact you. Submission does not charge you.</p></div></aside></div>
  </div>{preview && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-4 sm:p-8" role="dialog" aria-modal="true"><div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"><div className="flex items-center justify-between border-b px-6 py-4"><span className="text-sm font-semibold uppercase tracking-[.2em] text-slate-500">Quotation request preview</span><button onClick={() => setPreview(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>{reference ? <div className="px-6 py-20 text-center"><CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" /><h2 className="text-2xl font-bold">Quotation request sent</h2><p className="mt-2 text-slate-600">Reference: {reference}. TG World will contact you after reviewing your offer.</p><Button asChild className="mt-7"><Link href="/profile">View profile</Link></Button></div> : <><div className="flex flex-col justify-between gap-6 border-b px-6 py-7 sm:flex-row sm:items-start sm:px-10"><Image src="/logos/Logo%20tg2.png" alt="TG World International" width={132} height={100} className="h-auto w-28 object-contain" /><div className="sm:text-right"><p className="text-xs font-semibold uppercase tracking-[.2em] text-orange-600">Vehicle price quotation</p><h2 className="mt-2 text-2xl font-bold">Customer request</h2><p className="mt-1 text-sm text-slate-500">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p></div></div><div className="grid gap-8 px-6 py-7 sm:px-10 lg:grid-cols-[1.15fr_.85fr]"><div><CarImage src={gallery[0]} alt={car.name} large />{gallery.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{gallery.slice(1).map((src) => <CarImage key={src} src={src} alt="Vehicle view" />)}</div>}<h3 className="mt-5 text-xl font-bold">{car.year} {car.name}</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">{[car.mileage, car.fuel, car.transmission, car.color, car.chassis].filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div></div><div className="space-y-6"><div className="rounded-xl bg-slate-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Proposed price</p><p className="mt-2 text-2xl font-bold text-orange-600">{money(form.quotationPrice)}</p><p className="mt-2 text-sm text-slate-500">Listed price: {listedPrice}</p></div><div><Caption>Requested by</Caption><p className="font-bold">{form.fullName}</p><p className="text-sm text-slate-600">{form.email}</p><p className="text-sm text-slate-600">{form.phone}</p></div>{(form.address || form.city || form.region) && <div><Caption>Preferred delivery</Caption><p className="text-sm">{[form.address, form.city, form.region, form.postalCode].filter(Boolean).join(", ")}</p></div>}{form.additionalInfo && <div><Caption>Request notes</Caption><p className="whitespace-pre-wrap text-sm">{form.additionalInfo}</p></div>}</div></div><div className="flex flex-col gap-3 border-t bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-10"><Button variant="outline" onClick={() => setPreview(false)}>Edit request</Button><Button onClick={submit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isAuthenticated ? "Send quotation request" : "Sign in and send"}</Button></div></>}</div></div>}</div>
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div> }
function Line({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className={`text-right font-semibold ${accent ? "text-primary" : ""}`}>{value}</span></div> }
function Caption({ children }: { children: React.ReactNode }) { return <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</p> }
function CarImage({ src, alt, large = false }: { src: string; alt: string; large?: boolean }) { return <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${large ? "aspect-video" : "aspect-video"}`}><Image src={src} alt={alt} fill className="object-cover" unoptimized={src.startsWith("http")} /></div> }
