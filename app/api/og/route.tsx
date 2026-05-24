import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

const SITE_URL = "https://tgworldtz.com"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tgworld.e-saloon.online"

/** Fetch logo bytes and convert to a base64 data-URI so ImageResponse can embed it */
async function logoToDataUri(logoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(logoUrl, { headers: { Accept: "image/*" } })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get("content-type") || "image/png"
    // For SVG, keep as image/svg+xml — satori (ImageResponse) handles it fine
    const b64 = Buffer.from(buf).toString("base64")
    return `data:${mime};base64,${b64}`
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const company = searchParams.get("company") || "TG World"
  const logoParam = searchParams.get("logo") // raw logo URL from API
  const count = parseInt(searchParams.get("count") || "0", 10)

  // Resolve logo URL
  let rawLogoUrl = logoParam || ""
  if (rawLogoUrl && !rawLogoUrl.startsWith("http")) {
    rawLogoUrl = `${API_BASE}/public/${rawLogoUrl.replace(/^\//, "")}`
  }

  const logoDataUri = rawLogoUrl ? await logoToDataUri(rawLogoUrl) : null

  const countText =
    count > 0
      ? `${count} ${count === 1 ? "vehicle" : "vehicles"} available`
      : "Browse our inventory"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #111 100%)",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #D4AF37, #F5DFA0, #D4AF37)",
          }}
        />

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            padding: "60px 80px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          {logoDataUri ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.95)",
                borderRadius: "24px",
                padding: "24px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDataUri}
                alt={company}
                style={{ maxWidth: "152px", maxHeight: "152px", objectFit: "contain" }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "200px",
                height: "200px",
                background: "rgba(212,175,55,0.15)",
                borderRadius: "24px",
                border: "2px solid rgba(212,175,55,0.4)",
                fontSize: "72px",
              }}
            >
              🚗
            </div>
          )}

          {/* Company name */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            {company}
          </div>

          {/* Car count pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(212,175,55,0.18)",
              border: "1.5px solid rgba(212,175,55,0.5)",
              borderRadius: "100px",
              padding: "12px 28px",
              color: "#D4AF37",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            {countText}
          </div>

          {/* Site name */}
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "22px", letterSpacing: "2px" }}>
            tgworldtz.com
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #D4AF37, #F5DFA0, #D4AF37)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
