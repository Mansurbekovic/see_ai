import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isRootPage = req.nextUrl.pathname === '/';
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/chat') ||
    req.nextUrl.pathname.startsWith('/settings');

  // Agar login qilmagan bo'lsa va himoyalangan sahifaga yoki asosiy sahifaga kirmoqchi bo'lsa -> majburiy /login
  if (!isLoggedIn && (isProtectedPage || isRootPage)) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    if (!isRootPage) {
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Agar tizimga kirgan bo'lsa va /login yoki / ga kelsa -> to'g'ri /chat ga yo'naltirish
  if (isLoggedIn && (isAuthPage || isRootPage)) {
    return NextResponse.redirect(new URL('/chat', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/chat/:path*', '/settings/:path*', '/login'],
};
