import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://tgworld.e-saloon.online"

export async function proxyFavoritesRequest(request: NextRequest, suffix = "") {
  const requestOrigin = request.headers.get("origin")
  if (request.method !== "GET" && requestOrigin && requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "The request origin is not allowed.", fields: {} } }, { status: 403 })
  }

  const headers = new Headers({ Accept: "application/json" })
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")
  if (contentType) headers.set("Content-Type", contentType)
  if (cookie) headers.set("Cookie", cookie)

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/favorites${suffix}`, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    })
    const responseHeaders = new Headers()
    const upstreamContentType = upstream.headers.get("content-type")
    if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType)
    for (const cookieValue of upstream.headers.getSetCookie()) responseHeaders.append("Set-Cookie", cookieValue)
    return new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders })
  } catch {
    return NextResponse.json({ error: { code: "UPSTREAM_UNAVAILABLE", message: "The favorites service is temporarily unavailable.", fields: {} } }, { status: 502 })
  }
}

