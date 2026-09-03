import { NextRequest } from "next/server"
import { proxyQuotationRequest } from "./proxy"

export const dynamic = "force-dynamic"
export async function GET(request: NextRequest) { return proxyQuotationRequest(request) }
export async function POST(request: NextRequest) { return proxyQuotationRequest(request) }
