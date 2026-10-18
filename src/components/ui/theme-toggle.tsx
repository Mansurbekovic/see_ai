'use client';

import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-secondary hover:text-text-primary active:scale-90 transition-all"
        title={isDark ? "Kunduzgi rejimga o'tish (Kun)" : "Tungi rejimga o'tish (Tun)"}
        aria-label="Mavzuni almashtirish"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-cyan-600 transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-full items-center justify-between rounded-xl border border-border-default/80 bg-surface-secondary/50 px-3 text-xs font-medium text-text-primary hover:bg-surface-secondary active:scale-[0.98] transition-all"
      title="Tun / Kun rejimini almashtirish"
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-cyan-600" />
        )}
        <span>{isDark ? 'Kunduzgi rejim' : 'Tungi rejim'}</span>
      </div>
      <span className="rounded bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
        {isDark ? 'Tun' : 'Kun'}
      </span>
    </button>
  );
}
