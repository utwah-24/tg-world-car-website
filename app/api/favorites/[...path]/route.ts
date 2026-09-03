import { NextRequest, NextResponse } from "next/server"
import { proxyFavoritesRequest } from "../proxy"

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const endpoint = (await context.params).path.join("/")
  if (!/^\d+(?:\/remove)?$/.test(endpoint)) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Favorites endpoint not found.", fields: {} } }, { status: 404 })
  }
  return proxyFavoritesRequest(request, `/${endpoint}`)
}

export const POST = handle
export const DELETE = handle
