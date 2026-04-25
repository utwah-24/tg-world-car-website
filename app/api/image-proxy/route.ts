import { NextRequest, NextResponse } from "next/server"

// Never let Next.js (or any CDN in front of it) cache this route at the path level.
// Each unique car-image URL must always flow through as a distinct cache entry in the browser.
export const dynamic = "force-dynamic"

const DEFAULT_API = "https://tgworld.e-saloon.online"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url?.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(url.trim())
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API
  let allowedOrigin: string
  try {
    allowedOrigin = new URL(base).origin
  } catch {
    allowedOrigin = new URL(DEFAULT_API).origin
  }

  if (target.origin !== allowedOrigin) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 })
  }

  try {
    // `cache: 'no-store'` bypasses Next.js server-side data cache so the upstream
    // image is always fetched fresh — prevents one car's photo being served for another.
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/*,*/*" },
      cache: "no-store",
    })
    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 })
    }
    const buf = await upstream.arrayBuffer()
    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        // `private` — browser may cache per unique URL (safe: each car image is a UUID path),
        // but NO shared/CDN cache can store this. This is the key fix for the wrong-image glitch.
        "Cache-Control": "private, max-age=86400, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Fetch error" }, { status: 502 })
  }
}
