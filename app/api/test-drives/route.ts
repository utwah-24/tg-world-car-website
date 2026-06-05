import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://tgworld.e-saloon.online"

/**
 * Server-side proxy for POST /api/test-drives.
 * Keeps the request server-to-server so the browser never hits the external
 * API directly — avoids CORS / redirect issues.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const upstream = await fetch(`${API_BASE_URL}/api/test-drives`, {
      method: "POST",
      body: formData,
      cache: "no-store",
      redirect: "follow",
    })

    let body: unknown
    const ct = upstream.headers.get("content-type") ?? ""
    if (ct.includes("application/json")) {
      body = await upstream.json()
    } else {
      body = { message: await upstream.text() }
    }

    return NextResponse.json(body, { status: upstream.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy error"
    return NextResponse.json({ message }, { status: 502 })
  }
}
