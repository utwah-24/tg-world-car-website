import { NextRequest, NextResponse } from "next/server"

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
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/*,*/*" },
      next: { revalidate: 3600 },
    })
    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 })
    }
    const buf = await upstream.arrayBuffer()
    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json({ error: "Fetch error" }, { status: 502 })
  }
}
