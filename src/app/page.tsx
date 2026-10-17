import Link from 'next/link';
import { Sparkles, ArrowRight, Shield, Zap, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-primary text-text-primary">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-border-default/60 px-6 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">SEE AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Kirish
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 active:scale-95"
          >
            <span>Boshlash</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-12 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Aqlli AI Platformasi</span>
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.15]">
          Think Deeper.{' '}
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            See Further.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg leading-relaxed">
          Murakkab muammolarni hal qilish, chuqur tadqiqotlar o‘tkazish va ilg‘or Gemini hamda Claude modellari bilan mustaqil muloqot qilish uchun professional platforma.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 active:scale-95"
          >
            <span>Platformaga o‘tish</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-xl border border-border-default bg-surface-secondary px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-hover"
          >
            Ro‘yxatdan o‘tish
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-border-default bg-surface-secondary/50 p-6">
            <Zap className="h-6 w-6 text-brand-500 mb-3" />
            <h3 className="font-semibold text-text-primary">Tezkor Streaming</h3>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Kechiktirishlarsiz real vaqt rejimida javoblarni qabul qilish va to‘xtatish imkoniyati.
            </p>
          </div>

          <div className="rounded-2xl border border-border-default bg-surface-secondary/50 p-6">
            <Search className="h-6 w-6 text-brand-500 mb-3" />
            <h3 className="font-semibold text-text-primary">Haqiqiy Tadqiqot</h3>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Google va veb-qidiruv vositalari orqali ishonchli havolalar bilan tasdiqlangan faktlar.
            </p>
          </div>

          <div className="rounded-2xl border border-border-default bg-surface-secondary/50 p-6">
            <Shield className="h-6 w-6 text-brand-500 mb-3" />
            <h3 className="font-semibold text-text-primary">Xavfsiz va Maxfiy</h3>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Foydalanuvchi ma‘lumotlarining to‘liq izolyatsiyasi, shifrlangan sessiyalar va himoyalangan API.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default/60 py-6 text-center text-xs text-text-tertiary">
        &copy; {new Date().getFullYear()} SEE AI. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
