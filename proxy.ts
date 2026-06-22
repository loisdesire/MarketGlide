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
  const isTrackerAuthRoute = pathname.startsWith('/tracker/login') || pathname.startsWith('/tracker/register');
  const isTrackerAppRoute  = pathname.startsWith('/tracker') && !isTrackerAuthRoute;
  const isAdminRoute       = pathname.startsWith('/admin');

  // API routes and all marketing/public routes are always allowed
  if (isApiRoute || (!isTrackerAuthRoute && !isTrackerAppRoute && !isAdminRoute)) return supabaseResponse;

  // Unauthenticated user trying to access the tracker app
  if (!user && isTrackerAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/tracker/login';
    return NextResponse.redirect(url);
  }

  // Unauthenticated user trying to access the admin
  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/tracker/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to visit tracker login/register
  if (user && isTrackerAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/tracker/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
