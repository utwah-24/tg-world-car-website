export type QuotationStatus = "pending" | "reviewing" | "accepted" | "countered" | "rejected" | "withdrawn" | "expired"
export type QuotationVehicle = { name?: string; title?: string; year?: number; image?: string; images?: string[]; listedPrice?: number | string; mileage?: string; fuel?: string; transmission?: string }
export type Quotation = { id: number; reference: string; status: QuotationStatus; carId: number; proposedPrice: number; counterPrice: number | null; currency: "TZS"; previewPdfUrl: string; createdAt: string; vehicle?: QuotationVehicle; vehicleSnapshot?: QuotationVehicle }

export class QuotationApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields: Record<string, string[]> = {}, public requestId?: string) { super(message) }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`/api/quotations${path}`, { ...init, credentials: "include", cache: "no-store", headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers } })
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new QuotationApiError(response.status, body?.error?.code ?? "REQUEST_FAILED", body?.error?.message ?? "Something went wrong. Please try again.", body?.error?.fields ?? {}, body?.error?.requestId)
  return body as T
}

export const quotationsApi = {
  list(page = 1) { return request<{ data: Quotation[]; meta: { currentPage?: number; lastPage?: number; total?: number } }>(`?page=${page}`) },
  withdraw(id: number) { return request<{ quotation: Quotation }>(`/${id}/withdraw`, { method: "POST", body: JSON.stringify({}) }) },
  localPreviewUrl(id: number) { return `/api/quotations/${id}/preview` },
}
