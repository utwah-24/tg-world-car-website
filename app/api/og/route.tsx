import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tgworld.e-saloon.online"

/** Fetch logo bytes and return as base64 data-URI */
async function logoToDataUri(logoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(logoUrl, { headers: { Accept: "image/*" } })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get("content-type") || "image/png"
    const b64 = Buffer.from(buf).toString("base64")
    return `data:${mime};base64,${b64}`
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const company = searchParams.get("company") || ""
  let logoUrl = searchParams.get("logo") || ""

  if (logoUrl && !logoUrl.startsWith("http")) {
    logoUrl = `${API_BASE}/public/${logoUrl.replace(/^\//, "")}`
  }

  const logoDataUri = logoUrl ? await logoToDataUri(logoUrl) : null

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "630px",
          height: "630px",
          background: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {logoDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoDataUri}
            alt={company}
            style={{ width: "510px", height: "510px", objectFit: "contain" }}
          />
        ) : (
          <div style={{ fontSize: "120px" }}>🚗</div>
        )}
      </div>
    ),
    { width: 630, height: 630 },
  )
}
