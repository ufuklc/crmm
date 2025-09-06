// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Supabase helper: cookie'leri okur/yeniler
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname, searchParams } = req.nextUrl

  // ====== Public/Auth routes (ALLOW) ======
  // Sign-in sayfan ve Supabase'in auth callback rotaları mutlaka public kalmalı
  const isAuthPage =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/auth') ||          // e.g. /auth/callback
    pathname.startsWith('/api/auth')         // e.g. NextAuth vb. kullanıyorsan

  if (isAuthPage) {
    // Girişliyken sign-in'e gelirse ana sayfaya it
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return res
  }

  // ====== Protected routes (REQUIRE AUTH) ======
  // Ek güvenlik: çerez var mı? (bazı edge durumlarda session geç gelebilir)
  const hasAuthCookie =
    Boolean(req.cookies.get('sb-access-token')) ||
    Boolean(req.cookies.get('sb-refresh-token'))

  // 1) Çerez de yok, session da yok -> kesinlikle girişsiz
  if (!session && !hasAuthCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set(
      'redirect',
      pathname + (searchParams.toString() ? `?${searchParams}` : '')
    )
    return NextResponse.redirect(url)
  }

  // 2) Çerez var gibi ama session null (expired/bozuk) -> yine sign-in'e
  if (!session && hasAuthCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set(
      'redirect',
      pathname + (searchParams.toString() ? `?${searchParams}` : '')
    )
    return NextResponse.redirect(url)
  }

  // 3) session mevcut -> geç
  return res
}

// /api ve statikleri hariç tut (JSON istekleri redirect'a takılmasın)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
