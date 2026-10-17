'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowLeft, Moon, Sun, Monitor, Globe, Shield, Save, LogOut, Sparkles, Phone, Send } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          language: locale,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.common.back}</span>
          </Link>
          <h1 className="text-xl font-bold text-text-primary">{t.settings.title}</h1>
        </div>

        <div className="space-y-6 rounded-2xl border border-border-default bg-surface-secondary/40 p-6">
          {/* User Profile Card */}
          {session?.user && (
            <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-primary p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={session.user.name || 'Foydalanuvchi'}
                  image={session.user.image}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-text-primary text-sm sm:text-base">
                    {session.user.name || 'Foydalanuvchi'}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {session.user.email}
                  </p>
                  <span className="mt-1 inline-block rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:text-brand-400">
                    SEE AI PRO Foydalanuvchisi
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-text-secondary hover:border-error/40 hover:bg-error/10 hover:text-error transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Chiqish</span>
              </button>
            </div>
          )}

          {/* Theme Section */}
          <div className={session?.user ? "border-t border-border-default/60 pt-6" : ""}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Sun className="h-4 w-4 text-brand-500" />
              <span>{t.settings.theme}</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    theme === mode
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-border-default bg-surface-primary text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {mode === 'light' && <Sun className="h-4 w-4" />}
                  {mode === 'dark' && <Moon className="h-4 w-4" />}
                  {mode === 'system' && <Monitor className="h-4 w-4" />}
                  <span className="capitalize">
                    {mode === 'light'
                      ? t.settings.light
                      : mode === 'dark'
                      ? t.settings.dark
                      : t.settings.system}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Section */}
          <div className="border-t border-border-default/60 pt-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Globe className="h-4 w-4 text-brand-500" />
              <span>{t.settings.language}</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'uz', label: "O'zbekcha" },
                { code: 'en', label: 'English' },
                { code: 'ru', label: 'Русский' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLocale(lang.code as 'uz' | 'en' | 'ru')}
                  className={`rounded-xl border p-3 text-xs font-medium transition-all ${
                    locale === lang.code
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-border-default bg-surface-primary text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="border-t border-border-default/60 pt-6">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Shield className="h-4 w-4 text-brand-500" />
              <span>Xavfsizlik va Maxfiylik</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              SEE AI sizning so‘rovlaringizni xavfsiz kanallar orqali faqat sozlangan AI modellari bilan almashadi. Hech qanday maxfiy ma‘lumotlar yoki parollar begona tomonlarga uzatilmaydi.
            </p>
          </div>

          {/* Author & Creator Information Card */}
          <div className="border-t border-border-default/60 pt-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <span>SEE AI Muallifi va Asoschisi</span>
            </h2>
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-surface-primary to-blue-500/10 p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 pb-3 border-b border-border-default/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-md shadow-cyan-500/25">
                  MR
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-text-primary text-base">Muhammadislom Rustambekov</h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">14 yoshli Full-Stack Dasturchi & AI Innovator</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">7 dan ortiq jiddiy va innovatsion loyihalar muallifi</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="https://islomb.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface-secondary/70 p-2 text-xs font-semibold text-text-primary hover:border-cyan-500/50 hover:bg-surface-hover transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Portfolio</span>
                </a>
                <a
                  href="https://t.me/Muhammadislom10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface-secondary/70 p-2 text-xs font-semibold text-text-primary hover:border-blue-500/50 hover:bg-surface-hover transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-blue-500" />
                  <span>@Muhammadislom10</span>
                </a>
                <a
                  href="tel:+998503016347"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface-secondary/70 p-2 text-xs font-semibold text-text-primary hover:border-emerald-500/50 hover:bg-surface-hover transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  <span>50 301 63 47</span>
                </a>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-border-default/60 pt-6 flex justify-end gap-3">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              <span>{saveSuccess ? 'Saqlandi!' : t.common.save}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
