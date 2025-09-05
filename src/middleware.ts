import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // API route'ları için logging yok
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
