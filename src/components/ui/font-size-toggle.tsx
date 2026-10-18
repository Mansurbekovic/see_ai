'use client';

import { useTheme } from '@/hooks/use-theme';
import { Type } from 'lucide-react';

interface FontSizeToggleProps {
  compact?: boolean;
}

export function FontSizeToggle({ compact = false }: FontSizeToggleProps) {
  const { fontSize, toggleFontSize } = useTheme();
  const isLarge = fontSize === 'large';

  if (compact) {
    return (
      <button
        onClick={toggleFontSize}
        className={`flex h-9 items-center justify-center gap-1 rounded-xl px-2 text-xs font-semibold transition-all active:scale-90 ${
          isLarge
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
        }`}
        title={isLarge ? "Shrift: Katta (Oddiyga o'tish)" : "Shrift: Oddiy (Kattaga o'tish)"}
        aria-label="Shrift o'lchamini almashtirish"
      >
        <Type className="h-3.5 w-3.5" />
        <span className="text-[11px] font-bold">{isLarge ? 'A+' : 'A'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFontSize}
      className="flex h-10 w-full items-center justify-between rounded-xl border border-border-default/80 bg-surface-secondary/50 px-3 text-xs font-medium text-text-primary hover:bg-surface-secondary active:scale-[0.98] transition-all"
      title="Matn o'lchamini kattalashtirish / normallashtirish"
    >
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-cyan-400" />
        <span>Shrift o&apos;lchami</span>
      </div>
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
          isLarge
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'bg-surface-tertiary text-text-secondary'
        }`}
      >
        {isLarge ? 'Katta (A+)' : 'Oddiy (A)'}
      </span>
    </button>
  );
}
