/** Fetch remote image bytes and return a base64 data-URI (edge-safe). */
export async function imageToDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get("content-type") || "image/jpeg"
    const bytes = new Uint8Array(buf)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return `data:${mime};base64,${btoa(binary)}`
  } catch {
    return null
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}…`
}
