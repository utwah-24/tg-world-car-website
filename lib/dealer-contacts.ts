export const DEALER_CONTACTS = [
  {
    name: "Sharif Issa",
    image: "/Team /Sharif/sharif.jpeg",
    phone: "0748364714",
    whatsapp: "0748364714",
  },
  {
    name: "Deogratious Temba",
    image: "/Team /Deo/deo.jpeg",
    phone: "0754444146",
    whatsapp: "0754441146",
  },
  {
    name: "Calvin Temba",
    image: "/Team /Calvin/Calvin.jpeg",
    phone: "0768425380",
    whatsapp: "0768425380",
  },
] as const

export function tzPhoneHref(local: string) {
  const digits = local.replace(/\D/g, "")
  const intl = digits.startsWith("255") ? digits : `255${digits.replace(/^0/, "")}`
  return `tel:+${intl}`
}

export function tzWhatsAppHref(local: string, message?: string) {
  const digits = local.replace(/\D/g, "")
  const intl = digits.startsWith("255") ? digits : `255${digits.replace(/^0/, "")}`
  const base = `https://wa.me/${intl}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
