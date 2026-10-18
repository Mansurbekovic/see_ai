import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/hooks/use-theme';
import { I18nProvider } from '@/lib/i18n/context';
import { SessionProvider } from '@/components/providers/session-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SEE AI — Think Deeper. See Further.',
  description:
    'Advanced AI assistant, research platform, coding assistant, and productivity workspace. Muallif: Muhammadislom Rustambekov.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SEE AI',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('see-ai-theme');
                  var isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches) || !t;
                  if (t === 'light') isDark = false;
                  var doc = document.documentElement;
                  if (isDark) {
                    doc.classList.add('dark');
                    doc.setAttribute('data-theme', 'dark');
                    doc.style.colorScheme = 'dark';
                  } else {
                    doc.classList.remove('dark');
                    doc.setAttribute('data-theme', 'light');
                    doc.style.colorScheme = 'light';
                  }
                  var fs = localStorage.getItem('see-ai-font-size');
                  if (fs === 'large') {
                    doc.classList.add('font-large');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface-primary text-text-primary">
        <SessionProvider>
          <ThemeProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
