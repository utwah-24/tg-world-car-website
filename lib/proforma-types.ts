export const PROFORMA_STORAGE_KEY = "tgworld-proforma-invoice-v1"

export interface ProformaBuyer {
  fullName: string
  email: string
  phone: string
}

export interface ProformaDelivery {
  address: string
  city: string
  region: string
  postalCode: string
}

export interface ProformaCarSnapshot {
  id: string
  name: string
  year?: number
  price: string
  /** Main photo URL (absolute or site-relative) for the proforma */
  image?: string
  color?: string
  chassis?: string
  description?: string
}

export interface ProformaInvoicePayload {
  buyer: ProformaBuyer
  delivery: ProformaDelivery
  /** Optional notes from checkout (may be empty) */
  additionalInfo?: string
  car: ProformaCarSnapshot
  chassis: string
  invoiceNo: string
  invoiceDate: string
  /** Payment breakdown — all stored as formatted strings e.g. "SH 10,000,000" */
  amountPaid?: string
  amountDue?: string
}
