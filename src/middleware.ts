import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function middleware(req: NextRequest) {
  // Edge-light session check without bundling Prisma/Bcrypt into Edge Function (< 10 KB)
  const hasSession =
    SESSION_COOKIE_NAMES.some((name) => {
      const cookie = req.cookies.get(name);
      return cookie && cookie.value.length > 0;
    }) ||
    req.cookies.getAll().some((c) =>
      SESSION_COOKIE_NAMES.some((name) => c.name.startsWith(name))
    );

  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isRootPage = req.nextUrl.pathname === '/';
  const isSettingsPage = req.nextUrl.pathname.startsWith('/settings');

  // Bosh sahifaga kirganda barchani /chat ga o'tkazish (mehmonlar ham to'g'ridan-to'g'ri foydalana oladi)
  if (isRootPage) {
    return NextResponse.redirect(new URL('/chat', req.nextUrl.origin));
  }

  // Agar tizimga kirgan bo'lsa va /login ga kelsa -> to'g'ri /chat ga yo'naltirish
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/chat', req.nextUrl.origin));
  }

  // Faqat shaxsiy sozlamalar sahifasi majburiy login talab qiladi
  if (!hasSession && isSettingsPage) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*', '/settings/:path*', '/login'],
};

