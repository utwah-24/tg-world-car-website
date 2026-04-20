const DEFAULT_API = "https://tgworld.e-saloon.online"

/**
 * Same-origin URL for car photos so html2canvas can paint them in the PDF.
 * Remote API images are loaded via `/api/image-proxy`; relative paths stay as-is.
 */
export function proformaCarImageSrcForCapture(image: string | undefined): string | undefined {
  if (!image?.trim()) return undefined
  const trimmed = image.trim()
  if (trimmed.startsWith("/")) return trimmed

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return trimmed
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API
  let allowedOrigin: string
  try {
    allowedOrigin = new URL(base).origin
  } catch {
    allowedOrigin = new URL(DEFAULT_API).origin
  }

  if (parsed.origin === allowedOrigin) {
    return `/api/image-proxy?${new URLSearchParams({ url: trimmed }).toString()}`
  }

  return trimmed
}
