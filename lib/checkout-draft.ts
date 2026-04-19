export const CHECKOUT_DRAFT_STORAGE_PREFIX = "tgworld-checkout-draft-v1"

export function checkoutDraftStorageKey(carId: string): string {
  return `${CHECKOUT_DRAFT_STORAGE_PREFIX}:${carId}`
}

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode: string
  additionalInfo: string
  agreeToTerms: boolean
}

export const EMPTY_CHECKOUT_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  additionalInfo: "",
  agreeToTerms: false,
}

/** Restore draft from sessionStorage JSON; invalid input → empty form */
export function checkoutDraftFromStorage(raw: string | null): CheckoutFormData {
  if (!raw) return { ...EMPTY_CHECKOUT_FORM }
  try {
    const p = JSON.parse(raw) as Record<string, unknown>
    return {
      fullName: typeof p.fullName === "string" ? p.fullName : "",
      email: typeof p.email === "string" ? p.email : "",
      phone: typeof p.phone === "string" ? p.phone : "",
      address: typeof p.address === "string" ? p.address : "",
      city: typeof p.city === "string" ? p.city : "",
      region: typeof p.region === "string" ? p.region : "",
      postalCode: typeof p.postalCode === "string" ? p.postalCode : "",
      additionalInfo: typeof p.additionalInfo === "string" ? p.additionalInfo : "",
      agreeToTerms: p.agreeToTerms === true,
    }
  } catch {
    return { ...EMPTY_CHECKOUT_FORM }
  }
}
