import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — IMPORTANT: do not add any logic between
  // createServerClient and getUser() or the session may not refresh.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApiRoute         = pathname.startsWith('/api');
  const isLoginRoute       = pathname === '/login';
  const isRegisterRoute    = pathname === '/register';
  const isTrackerAuthRoute = pathname.startsWith('/tracker/login') || pathname.startsWith('/tracker/register');
  const isTrackerAppRoute  = pathname.startsWith('/tracker') && !isTrackerAuthRoute;
  const isAdminRoute       = pathname.startsWith('/admin');
  const isMembersRoute     = pathname.startsWith('/members');
  const isAuthPage         = isLoginRoute || isRegisterRoute;
  const isProtectedRoute   = isTrackerAppRoute || isAdminRoute || isMembersRoute;

  // API and all public/marketing routes are always allowed
  if (isApiRoute || (!isAuthPage && !isTrackerAuthRoute && !isProtectedRoute)) return supabaseResponse;

  // Unauthenticated user trying to access a protected route → platform login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user on tracker login/register → tracker dashboard
  if (user && isTrackerAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/tracker/dashboard';
    return NextResponse.redirect(url);
  }

  // Authenticated user on /login or /register → route them to the right place
  // (actual per-user routing done client-side; proxy just prevents double-login)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = user.email === process.env.PLATFORM_ADMIN_EMAIL
      ? '/admin'
      : '/members';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
