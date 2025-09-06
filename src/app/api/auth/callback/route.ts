import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs';        // <-- Edge değil, Node.js'te çalışsın
export const dynamic = 'force-dynamic'; // <-- cache kapalı

export async function GET(req: Request) {
  return NextResponse.json({ 
    message: 'Auth callback endpoint is working',
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'MISSING'
    }
  });
}

export async function POST(req: Request) {
  let payload: { event?: string; session?: { access_token?: string; refresh_token?: string } } = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const event = payload?.event;
  const session = payload?.session;

  try {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      if (session?.access_token && session?.refresh_token) {
        const supabase = createRouteHandlerClient({ cookies });
        
        const { data, error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        
        if (error) {
          return NextResponse.json({ ok: false, reason: 'setSession', error: error.message }, { status: 500 });
        }
        
        // Manuel cookie setting
        const response = NextResponse.json({ ok: true, session: data.session ? 'set' : 'not-set' });
        
        // Supabase cookie'lerini manuel olarak set et
        const cookieStore = await cookies();
        cookieStore.set('sb-access-token', session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 gün
          path: '/'
        });
        
        cookieStore.set('sb-refresh-token', session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 gün
          path: '/'
        });
        
        return response;
      } else {
        return NextResponse.json({ ok: false, reason: 'no-tokens' }, { status: 400 });
      }
    }

    if (event === 'SIGNED_OUT') {
      const supabase = createRouteHandlerClient({ cookies });
      const { error } = await supabase.auth.signOut();
      if (error) {
        return NextResponse.json({ ok: false, reason: 'signOut' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch {
    return NextResponse.json({ ok: false, reason: 'exception' }, { status: 500 });
  }
}
