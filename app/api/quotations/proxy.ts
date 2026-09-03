import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://tgworld.e-saloon.online"

export async function proxyQuotationRequest(request: NextRequest, suffix = "") {
  const origin = request.headers.get("origin")
  if (request.method !== "GET" && origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "The request origin is not allowed.", fields: {} } }, { status: 403 })
  const headers = new Headers({ Accept: request.headers.get("accept") ?? "application/json" })
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")
  if (contentType) headers.set("Content-Type", contentType)
  if (cookie) headers.set("Cookie", cookie)
  try {
    const upstream = await fetch(`${API_BASE_URL}/api/quotations${suffix}${request.nextUrl.search}`, { method: request.method, headers, body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(), cache: "no-store", redirect: "manual" })
    const responseHeaders = new Headers()
    for (const name of ["content-type", "content-disposition", "content-length"]) { const value = upstream.headers.get(name); if (value) responseHeaders.set(name, value) }
    for (const value of upstream.headers.getSetCookie()) responseHeaders.append("Set-Cookie", value)
    return new NextResponse(upstream.status === 204 ? null : upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return NextResponse.json({ error: { code: "UPSTREAM_UNAVAILABLE", message: "The quotation service is temporarily unavailable.", fields: {} } }, { status: 502 })
  }
}
