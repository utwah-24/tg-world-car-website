import { format } from "date-fns"

/** Invoice # like TG20260413123456 */
export function generateInvoiceNo(): string {
  const d = format(new Date(), "yyyyMMdd")
  const n = Math.floor(10000 + Math.random() * 90000)
  return `TG${d}${n}`
}

export function formatInvoiceDateDisplay(iso: string): string {
  try {
    return format(new Date(iso), "MM/dd/yyyy")
  } catch {
    return format(new Date(), "MM/dd/yyyy")
  }
}

/** Pull chassis/VIN from free-text description; fallback for display */
export function extractChassisFromText(text?: string): string {
  if (!text?.trim()) return "—"
  const t = text.replace(/\s+/g, " ")
  const m1 = t.match(/(?:CHASSIS|CHASIS|VIN|FRAME)\s*[:#]?\s*([A-Z0-9][A-Z0-9\s-]{8,})/i)
  if (m1?.[1]) return m1[1].replace(/\s+/g, "").toUpperCase()
  const m2 = t.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)
  if (m2?.[1]) return m2[1]
  return "—"
}
