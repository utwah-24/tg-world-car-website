"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, Loader2, Send, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ProformaInvoiceView } from "@/components/proforma-invoice-view"
import {
  PROFORMA_STORAGE_KEY,
  type ProformaInvoicePayload,
} from "@/lib/proforma-types"
import { cn } from "@/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tgworld.e-saloon.online"

interface OrderResult {
  id: number
  order_date: string
  car_name: string
  year: string
  invoice: string
  receipt: string
  created_at: string
}

// ---------------------------------------------------------------------------
// PDF helpers
// ---------------------------------------------------------------------------

function waitForImagesIn(container: HTMLElement): Promise<void> {
  const imgs = [...container.querySelectorAll("img")]
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.addEventListener("load", done, { once: true })
          img.addEventListener("error", done, { once: true })
          window.setTimeout(done, 10_000)
        }),
    ),
  ).then(() => undefined)
}

/** Convert any image File into a single-page A4 PDF Blob. */
async function imageToPdfBlob(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error("Could not load image"))
    el.src = dataUrl
  })

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 8
  const maxW = pageW - 2 * margin
  const maxH = pageH - 2 * margin
  const sc = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight)
  const drawW = img.naturalWidth * sc
  const drawH = img.naturalHeight * sc
  const x = margin + (maxW - drawW) / 2
  const y = margin + (maxH - drawH) / 2
  pdf.addImage(dataUrl, "PNG", x, y, drawW, drawH, undefined, "FAST")
  return pdf.output("blob")
}

async function renderProformaToPdfBlob(el: HTMLElement): Promise<Blob> {
  await waitForImagesIn(el)
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    imageTimeout: 15_000,
  })
  const imgData = canvas.toDataURL("image/png", 1.0)
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgPdfW = pageW
  const imgPdfH = (canvas.height * imgPdfW) / canvas.width
  if (imgPdfH <= pageH) {
    pdf.addImage(imgData, "PNG", 0, 0, imgPdfW, imgPdfH, undefined, "FAST")
  } else {
    const sc = pageH / imgPdfH
    pdf.addImage(imgData, "PNG", (pageW - imgPdfW * sc) / 2, 0, imgPdfW * sc, pageH, undefined, "FAST")
  }
  return pdf.output("blob")
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProformaInvoiceClient() {
  const [data, setData] = useState<ProformaInvoicePayload | null>(null)
  const [bad, setBad] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [converting, setConverting] = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const proformaBlobCache = useRef<Blob | null>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  // Load invoice data from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PROFORMA_STORAGE_KEY)
      if (!raw) { setBad(true); return }
      const parsed = JSON.parse(raw) as ProformaInvoicePayload
      if (!parsed?.buyer?.fullName || !parsed?.invoiceNo || !parsed?.car?.name) { setBad(true); return }
      setData(parsed)
    } catch {
      setBad(true)
    }
  }, [])

  // Receipt preview URL
  useEffect(() => {
    if (!receiptFile) { setReceiptPreviewUrl(null); return }
    if (receiptFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(receiptFile)
      setReceiptPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setReceiptPreviewUrl(null)
    return undefined
  }, [receiptFile])

  // Pre-render proforma PDF in the background for faster download / submit
  useEffect(() => {
    proformaBlobCache.current = null
    if (!data) return
    const t = window.setTimeout(() => {
      const el = printRef.current
      if (!el) return
      void renderProformaToPdfBlob(el)
        .then((blob) => { proformaBlobCache.current = blob })
        .catch(() => { proformaBlobCache.current = null })
    }, 400)
    return () => window.clearTimeout(t)
  }, [data])

  function onReceiptChosen(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const isImage = file.type.startsWith("image/")
    const isPdf = file.type === "application/pdf"
    if (!isImage && !isPdf) { alert("Please upload an image (JPG, PNG, WebP, HEIC…) or a PDF."); return }
    if (file.size > 20 * 1024 * 1024) { alert("File is too large. Please use a file under 20 MB."); return }
    setSubmitError(null)
    setOrderResult(null)

    if (isPdf) {
      setReceiptFile(file)
      return
    }

    // Image — convert to PDF immediately so the backend always receives a PDF
    setConverting(true)
    void imageToPdfBlob(file)
      .then((blob) => {
        const pdfName = file.name.replace(/\.[^.]+$/, "") + ".pdf"
        setReceiptFile(new File([blob], pdfName, { type: "application/pdf" }))
      })
      .catch(() => {
        // Conversion failed — fall back to sending the original image
        setReceiptFile(file)
      })
      .finally(() => setConverting(false))
  }

  function clearReceipt() {
    setReceiptFile(null)
    setReceiptPreviewUrl(null)
    setSubmitError(null)
    if (receiptInputRef.current) receiptInputRef.current.value = ""
  }

  async function downloadPdf() {
    if (!data) return
    setDownloading(true)
    try {
      const el = printRef.current
      const blob = proformaBlobCache.current ?? (el ? await renderProformaToPdfBlob(el) : null)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Proforma-Invoice-${data.invoiceNo}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function submitOrder() {
    if (!data || !receiptFile) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const el = printRef.current
      if (!el) throw new Error("Invoice element not ready")

      const invoiceBlob = proformaBlobCache.current ?? await renderProformaToPdfBlob(el)
      // Cache for download after submit
      if (!proformaBlobCache.current) proformaBlobCache.current = invoiceBlob

      const invoiceFile = new File(
        [invoiceBlob],
        `Proforma-Invoice-${data.invoiceNo}.pdf`,
        { type: "application/pdf" },
      )

      const form = new FormData()
      form.append("invoice", invoiceFile, invoiceFile.name)
      form.append("receipt", receiptFile, receiptFile.name)
      form.append("car_name", data.car.name)
      form.append("year", data.car.year ? String(data.car.year) : "")
      form.append("invoice_no", data.invoiceNo)
      form.append("buyer_name", data.buyer.fullName)
      form.append("email", data.buyer.email)
      form.append("buyer_email", data.buyer.email)
      form.append("buyer_phone", data.buyer.phone)

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        let msg = `Server error (${res.status})`
        try {
          const json = await res.json()
          if (typeof json?.message === "string") msg = json.message
        } catch { /* ignore */ }
        throw new Error(msg)
      }

      const json = await res.json()
      const result: OrderResult = json?.data ?? json
      setOrderResult(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (bad) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-semibold text-foreground">No invoice data found.</p>
        <p className="mt-2 text-muted-foreground">
          Complete checkout and tap <strong>Request Proforma Invoice</strong> to open this page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse vehicles</Link>
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="pb-12 pt-8">
      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-4 print:hidden sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/checkout/${data.car.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to checkout
            </Link>
          </Button>
          <Button type="button" onClick={downloadPdf} disabled={downloading} className="gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">

          {/* Invoice preview */}
          <div
            ref={printRef}
            className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-10"
          >
            <ProformaInvoiceView data={data} />
          </div>

          {/* Sidebar */}
          <aside
            className={cn(
              "print:hidden rounded-lg border border-neutral-200 bg-card p-6 shadow-sm",
              "lg:sticky lg:top-24",
            )}
          >
            {/* Success state */}
            {orderResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h2 className="text-base font-semibold">Order submitted!</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your proforma invoice and payment receipt have been received. TG WORLD will review
                  and contact you shortly.
                </p>

                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm space-y-1.5">
                  {orderResult.id && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-medium">#{orderResult.id}</span>
                    </div>
                  )}
                  {orderResult.order_date && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{orderResult.order_date}</span>
                    </div>
                  )}
                  {orderResult.car_name && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-medium text-right">{orderResult.car_name}{orderResult.year ? ` (${orderResult.year})` : ""}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {orderResult.invoice && (
                    <a
                      href={orderResult.invoice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      View invoice on server
                    </a>
                  )}
                  {orderResult.receipt && (
                    <a
                      href={orderResult.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      View receipt on server
                    </a>
                  )}
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/shop">Browse more vehicles</Link>
                </Button>
              </div>
            ) : (
              /* Upload + submit state */
              <>
                <h2 className="text-base font-semibold text-foreground">Submit your order</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  After you pay, upload your payment receipt and click <strong>Submit Order</strong>.
                  Your proforma invoice and receipt will be sent directly to TG WORLD.
                </p>

                <div className="mt-4 space-y-3">
                  <Label htmlFor="proforma-receipt" className="sr-only">
                    Upload receipt
                  </Label>
                  <input
                    id="proforma-receipt"
                    ref={receiptInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    onChange={(e) => onReceiptChosen(e.target.files)}
                  />

                  {/* File picker */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={converting}
                      onClick={() => receiptInputRef.current?.click()}
                    >
                      {converting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Upload className="h-4 w-4" />}
                      {converting ? "Converting…" : receiptFile ? "Replace file" : "Upload payment receipt"}
                    </Button>
                    {receiptFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                        onClick={clearReceipt}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Receipt preview */}
                  {receiptFile && (
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      {receiptPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={receiptPreviewUrl}
                          alt="Receipt preview"
                          className="mx-auto max-h-48 w-full rounded object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-3 text-sm text-foreground">
                          <FileText className="h-10 w-10 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 break-all font-medium">{receiptFile.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {submitError && (
                    <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {submitError}
                    </p>
                  )}

                  {/* Submit button */}
                  {receiptFile && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={submitOrder}
                        disabled={submitting || converting}
                        className="w-full gap-2 disabled:opacity-70"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 shrink-0" />
                        )}
                        {submitting ? "Submitting…" : "Submit Order"}
                      </Button>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Receipt images are converted to PDF automatically before sending.
                      </p>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/shop">Browse more vehicles</Link>
                  </Button>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
