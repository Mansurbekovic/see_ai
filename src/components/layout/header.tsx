import { useState, type FC } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, Sparkles, ChevronDown, UserCheck, LogIn } from 'lucide-react';
import type { ModelInfo } from '@/lib/ai/types';
import { AuthorModal } from '@/components/layout/author-modal';
import { PwaInstallButton } from '@/components/layout/pwa-install-button';

interface HeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenMobileNav: () => void;
}

export const Header: FC<HeaderProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onOpenMobileNav,
}) => {
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default/60 bg-surface-primary/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Mobile Nav Button */}
          <button
            onClick={onOpenMobileNav}
            className="rounded-xl p-2 text-text-secondary hover:bg-surface-secondary md:hidden"
            aria-label="Menyu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model Selector Dropdown */}
          <div className="relative inline-block text-left">
            <div className="flex items-center gap-1.5 rounded-xl border border-border-default/80 bg-surface-secondary/50 px-3 py-1.5 text-xs font-medium text-text-primary">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-4 font-semibold text-text-primary focus:outline-none"
              >
                {models.filter((m) => (m as { available?: boolean }).available !== false).length > 0 ? (
                  models
                    .filter((m) => (m as { available?: boolean }).available !== false)
                    .map((m) => (
                      <option key={m.id} value={m.id} className="bg-surface-primary text-text-primary">
                        {m.name} ({m.provider})
                      </option>
                    ))
                ) : (
                  <option value="gemini-2.5-flash" className="bg-surface-primary text-text-primary">
                    Gemini 2.5 Flash (Google)
                  </option>
                )}
              </select>
              <ChevronDown className="pointer-events-none -ml-3 h-3 w-3 text-text-tertiary" />
            </div>
          </div>
        </div>

        {/* Author Button & Product Info */}
        <div className="flex items-center gap-2">
          <PwaInstallButton compact />

          {!session?.user && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Kirish</span>
            </Link>
          )}

          <button
            onClick={() => setAuthorModalOpen(true)}
            className="group flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:border-cyan-500/60 hover:from-cyan-500/20 hover:to-blue-500/20 shadow-sm transition-all active:scale-95"
            title="SEE AI Yaratuvchisi: Muhammadislom Rustambekov"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Muallif:</span>
            <span className="text-white font-bold">Muhammadislom R.</span>
          </button>

          <div className="hidden text-xs text-text-tertiary lg:block border-l border-border-default/60 pl-3">
            <span className="font-medium text-text-secondary">SEE AI</span>
          </div>
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
