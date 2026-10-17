'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Locale, Translations } from './types';
import { uz } from './translations/uz';
import { en } from './translations/en';
import { ru } from './translations/ru';

const translations: Record<Locale, Translations> = { uz, en, ru };

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'uz',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return initialLocale;
    try {
      const saved = localStorage.getItem('see-ai-locale') as Locale | null;
      if (saved && (saved === 'uz' || saved === 'en' || saved === 'ru')) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return initialLocale;
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('see-ai-locale', l);
      } catch {
        // Ignore storage access errors
      }
    }
  }, []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        t: translations[locale] || translations.uz,
        setLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
