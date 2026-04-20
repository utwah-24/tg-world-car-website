"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { ArrowLeft, Download, FileText, Loader2, MessageCircle, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ProformaInvoiceView } from "@/components/proforma-invoice-view"
import {
  PROFORMA_STORAGE_KEY,
  type ProformaInvoicePayload,
} from "@/lib/proforma-types"
import { cn } from "@/lib/utils"

const TG_WORLD_WHATSAPP_E164 = "255748364714"

function vehicleSummaryLine(car: ProformaInvoicePayload["car"]): string {
  const y = car.year ? `${car.year} ` : ""
  return `${y}${car.name}`
}

function buildWhatsAppReceiptUrl(data: ProformaInvoicePayload): string {
  const vehicle = vehicleSummaryLine(data.car)
  const text = [
    "Hello TG WORLD International,",
    "",
    "I am sharing my purchase receipt for the following proforma invoice:",
    "",
    `Invoice: ${data.invoiceNo}`,
    `Vehicle: ${vehicle}`,
    `Name: ${data.buyer.fullName}`,
    "",
    "Please find my receipt attached in this chat.",
  ].join("\n")
  return `https://wa.me/${TG_WORLD_WHATSAPP_E164}?text=${encodeURIComponent(text)}`
}

export function ProformaInvoiceClient() {
  const [data, setData] = useState<ProformaInvoicePayload | null>(null)
  const [bad, setBad] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PROFORMA_STORAGE_KEY)
      if (!raw) {
        setBad(true)
        return
      }
      const parsed = JSON.parse(raw) as ProformaInvoicePayload
      if (!parsed?.buyer?.fullName || !parsed?.invoiceNo || !parsed?.car?.name) {
        setBad(true)
        return
      }
      setData(parsed)
    } catch {
      setBad(true)
    }
  }, [])

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreviewUrl(null)
      return
    }
    if (receiptFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(receiptFile)
      setReceiptPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setReceiptPreviewUrl(null)
    return undefined
  }, [receiptFile])

  function onReceiptChosen(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const okType =
      file.type.startsWith("image/") || file.type === "application/pdf"
    if (!okType) {
      alert("Please upload an image (JPG, PNG, WebP) or a PDF.")
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      alert("File is too large. Please use a file under 12 MB.")
      return
    }
    setReceiptFile(file)
  }

  function clearReceipt() {
    setReceiptFile(null)
    setReceiptPreviewUrl(null)
    if (receiptInputRef.current) receiptInputRef.current.value = ""
  }

  function waitForImages(container: HTMLElement): Promise<void> {
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

  async function downloadPdf() {
    const el = printRef.current
    if (!el || !data) return
    setDownloading(true)
    try {
      await waitForImages(el)
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
        const scale = pageH / imgPdfH
        const finalW = imgPdfW * scale
        const finalH = pageH
        pdf.addImage(imgData, "PNG", (pageW - finalW) / 2, 0, finalW, finalH, undefined, "FAST")
      }
      pdf.save(`Proforma-Invoice-${data.invoiceNo}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

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

  const whatsappHref = data ? buildWhatsAppReceiptUrl(data) : "#"

  return (
    <div className="pb-12 pt-8">
      <div className="mx-auto max-w-6xl px-4 print:hidden sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/checkout/${data.car.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to checkout
            </Link>
          </Button>
          <Button type="button" onClick={downloadPdf} disabled={downloading} className="gap-2">
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
          <div
            ref={printRef}
            className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-10"
          >
            <ProformaInvoiceView data={data} />
          </div>

          <aside
            className={cn(
              "print:hidden rounded-lg border border-neutral-200 bg-card p-6 shadow-sm",
              "lg:sticky lg:top-24",
            )}
          >
            <h2 className="text-base font-semibold text-foreground">Purchase receipt</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              After you pay, upload your receipt here. Then open WhatsApp to send it to TG WORLD
              (attach the file in the chat).
            </p>

            <div className="mt-4 space-y-3">
              <Label htmlFor="proforma-receipt" className="sr-only">
                Upload receipt
              </Label>
              <input
                id="proforma-receipt"
                ref={receiptInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(e) => onReceiptChosen(e.target.files)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => receiptInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {receiptFile ? "Replace file" : "Upload receipt"}
                </Button>
                {receiptFile ? (
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
                ) : null}
              </div>

              {receiptFile ? (
                <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
                  {receiptPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded blob preview
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
              ) : null}

              {receiptFile ? (
                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
                  >
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Send to TG WORLD on WhatsApp
                    </a>
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    +255 748 364 714 — attach your receipt after the chat opens.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
