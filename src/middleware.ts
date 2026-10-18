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
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/chat') ||
    req.nextUrl.pathname.startsWith('/settings');

  // Agar login qilmagan bo'lsa va himoyalangan sahifaga yoki asosiy sahifaga kirmoqchi bo'lsa -> majburiy /login
  if (!hasSession && (isProtectedPage || isRootPage)) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    if (!isRootPage) {
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Agar tizimga kirgan bo'lsa va /login yoki / ga kelsa -> to'g'ri /chat ga yo'naltirish
  if (hasSession && (isAuthPage || isRootPage)) {
    return NextResponse.redirect(new URL('/chat', req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*', '/settings/:path*', '/login'],
};

