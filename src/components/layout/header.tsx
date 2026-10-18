import { useState, type FC } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, Sparkles, ChevronDown, UserCheck, LogIn, Plus } from 'lucide-react';
import type { ModelInfo } from '@/lib/ai/types';
import { AuthorModal } from '@/components/layout/author-modal';
import { PwaInstallButton } from '@/components/layout/pwa-install-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FontSizeToggle } from '@/components/ui/font-size-toggle';

interface HeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenMobileNav: () => void;
  onNewChat?: () => void;
}

export const Header: FC<HeaderProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onOpenMobileNav,
  onNewChat,
}) => {
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default/60 bg-surface-primary/90 px-2.5 sm:px-4 backdrop-blur-md">
        {/* Left Side: Burger Menu + Model Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          {/* Mobile Nav Button */}
          <button
            onClick={onOpenMobileNav}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-secondary active:scale-95 md:hidden"
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model Selector Dropdown (Responsive width) */}
          <div className="relative inline-block text-left max-w-[150px] sm:max-w-none">
            <div className="flex items-center gap-1.5 rounded-xl border border-border-default/80 bg-surface-secondary/50 px-2.5 py-1.5 text-xs font-medium text-text-primary">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-4 font-semibold text-text-primary focus:outline-none truncate text-[11px] sm:text-xs"
              >
                {models.filter((m) => (m as { available?: boolean }).available !== false).length > 0 ? (
                  models
                    .filter((m) => (m as { available?: boolean }).available !== false)
                    .map((m) => (
                      <option key={m.id} value={m.id} className="bg-surface-primary text-text-primary">
                        {m.name}
                      </option>
                    ))
                ) : (
                  <option value="gemini-2.5-flash" className="bg-surface-primary text-text-primary">
                    Gemini 2.5 Flash
                  </option>
                )}
              </select>
              <ChevronDown className="pointer-events-none -ml-3 h-3 w-3 text-text-tertiary shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Quick New Chat Button */}
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 active:scale-90 md:hidden"
              title="Yangi suhbat"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}

          <FontSizeToggle compact />
          <ThemeToggle compact />
          <PwaInstallButton compact />

          {!session?.user && (
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-xl bg-surface-secondary border border-border-default px-2 py-1 text-[11px] sm:text-xs font-semibold text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
            >
              <LogIn className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Kirish</span>
            </Link>
          )}

          <button
            onClick={() => setAuthorModalOpen(true)}
            className="group flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-cyan-400 hover:border-cyan-500/60 active:scale-95 transition-all"
            title="SEE AI Yaratuvchisi: Muhammadislom Rustambekov"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Muallif:</span>
            <span className="hidden sm:inline text-white font-bold">Muhammadislom R.</span>
            <span className="sm:hidden text-white font-bold text-[11px]">M.R</span>
          </button>
        </div>
      </header>

      {/* Author Details Modal */}
      <AuthorModal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
      />
    </>
  );
};
