'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail, User as UserIcon, Globe, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Yangi hisob ro'yxatdan o'tkazish
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
        }

        // 2. Avtomatik tizimga kirish
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Hisob yaratildi, lekin avtomatik kirishda xatolik. Kirish tugmasidan foydalaning.");
        }

        router.push('/chat');
        router.refresh();
      } else {
        // Tizimga kirish
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Elektron pochta yoki parol noto'g'ri kiritildi");
        }

        router.push('/chat');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kutilmagan xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090e] px-4 py-12 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Background Aura Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[500px] rounded-full bg-cyan-900/15 blur-3xl" />

      {/* Top Controls: Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs backdrop-blur-md">
        <Globe className="h-3.5 w-3.5 text-cyan-400" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'uz' | 'en' | 'ru')}
          className="cursor-pointer bg-transparent text-slate-300 focus:outline-none"
        >
          <option value="uz" className="bg-slate-900 text-slate-200">{"O'zbekcha"}</option>
          <option value="en" className="bg-slate-900 text-slate-200">English</option>
          <option value="ru" className="bg-slate-900 text-slate-200">Русский</option>
        </select>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo and Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            SEE AI
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Think Deeper. See Further.
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-950/60 p-1.5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
              !isSignUp
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.auth.signIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
              isSignUp
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.auth.signUp}
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                {t.auth.name}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Muhammadislom"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                {t.auth.password}
              </label>
              {isSignUp && (
                <span className="text-[11px] text-slate-500">Kamida 8 belgi</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-11 text-sm text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Kutilmoqda...</span>
              </div>
            ) : (
              <>
                <span>{isSignUp ? "Hisob yaratish" : "Tizimga kirish"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
          <span>{"Shaxsiy ma'lumotlar xavfsiz himoyalangan"}</span>
        </div>
      </div>
    </div>
  );
}
