'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'normal' | 'large';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  toggleFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function subscribeSystemTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSystemThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getSystemThemeServerSnapshot(): 'light' | 'dark' {
  return 'dark';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    return (localStorage.getItem('see-ai-theme') as Theme) || 'dark';
  } catch {
    return 'dark';
  }
}

function getStoredFontSize(): FontSize {
  if (typeof window === 'undefined') return 'normal';
  try {
    return (localStorage.getItem('see-ai-font-size') as FontSize) || 'normal';
  } catch {
    return 'normal';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [fontSize, setFontSizeState] = useState<FontSize>(getStoredFontSize);

  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot
  );

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('font-large', fontSize === 'large');
  }, [fontSize]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('see-ai-theme', t);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setFontSize = useCallback((s: FontSize) => {
    setFontSizeState(s);
    try {
      localStorage.setItem('see-ai-font-size', s);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleFontSize = useCallback(() => {
    setFontSizeState((prev) => {
      const next = prev === 'normal' ? 'large' : 'normal';
      try {
        localStorage.setItem('see-ai-font-size', next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        fontSize,
        setFontSize,
        toggleFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
