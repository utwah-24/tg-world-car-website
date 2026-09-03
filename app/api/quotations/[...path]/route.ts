import { NextRequest } from "next/server"
import { proxyQuotationRequest } from "../proxy"

export const dynamic = "force-dynamic"
type Context = { params: Promise<{ path: string[] }> }
const suffix = (path: string[]) => `/${path.map(encodeURIComponent).join("/")}`
export async function GET(request: NextRequest, context: Context) { return proxyQuotationRequest(request, suffix((await context.params).path)) }
export async function POST(request: NextRequest, context: Context) { return proxyQuotationRequest(request, suffix((await context.params).path)) }
