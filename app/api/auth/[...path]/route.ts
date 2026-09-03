import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://tgworld.e-saloon.online"

const ALLOWED_PATHS = new Set([
  "register",
  "login",
  "me",
  "logout",
  "forgot-password",
  "reset-password",
])

async function proxyAuthRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  const endpoint = path.join("/")

  if (!ALLOWED_PATHS.has(endpoint)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Authentication endpoint not found.", fields: {} } },
      { status: 404 },
    )
  }

  const headers = new Headers({ Accept: "application/json" })
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")
  if (contentType) headers.set("Content-Type", contentType)
  if (cookie) headers.set("Cookie", cookie)

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    })

    const responseHeaders = new Headers()
    const upstreamContentType = upstream.headers.get("content-type")
    if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType)

    for (const cookieValue of upstream.headers.getSetCookie()) {
      responseHeaders.append("Set-Cookie", cookieValue)
    }

    return new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "The authentication service is temporarily unavailable.",
          fields: {},
        },
      },
      { status: 502 },
    )
  }
}

export const GET = proxyAuthRequest
export const POST = proxyAuthRequest
