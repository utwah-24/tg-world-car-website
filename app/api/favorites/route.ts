import { NextRequest } from "next/server"
import { proxyFavoritesRequest } from "./proxy"

export const GET = (request: NextRequest) => proxyFavoritesRequest(request)
export const POST = (request: NextRequest) => proxyFavoritesRequest(request)

