'use client';

import { useState, type FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  X,
  Plus,
  MessageSquare,
  Search,
  Settings,
  Trash2,
  Sparkles,
  UserCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { AuthorModal } from '@/components/layout/author-modal';
import { PwaInstallButton } from '@/components/layout/pwa-install-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FontSizeToggle } from '@/components/ui/font-size-toggle';
import type { ConversationItem } from '@/hooks/use-conversations';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationItem[];
  currentId?: string;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onSearch: (q: string) => void;
}

export const MobileNav: FC<MobileNavProps> = ({
  isOpen,
  onClose,
  conversations,
  currentId,
  onNewChat,
  onDelete,
  onSearch,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [authorModalOpen, setAuthorModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex md:hidden">
        {/* Dark Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer Window */}
        <div className="relative z-10 flex h-full w-[85vw] max-w-[340px] flex-col bg-surface-primary shadow-2xl border-r border-border-default/80 animate-in slide-in-from-left duration-200">
          {/* 1. Header: Brand & Close Button */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-default/60 px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-text-primary">SEE AI</span>
                <span className="ml-1.5 rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  PRO
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-secondary hover:text-text-primary active:scale-90 transition-all"
              aria-label="Menyuni yopish"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 2. Primary Action: Big "Yangi Suhbat" Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-cyan-500/15 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>Yangi suhbat boshlash</span>
            </button>
          </div>

          {/* 3. Search Bar */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Suhbatlardan qidirish..."
                className="h-10 w-full rounded-xl border border-border-default/80 bg-surface-secondary/50 pl-10 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Conversations List (Thumb-Friendly) */}
          <div className="flex-1 overflow-y-auto px-3 py-1">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              Suhbatlar tarixi
            </div>

            {conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-default/80 p-5 text-center">
                <MessageSquare className="mx-auto mb-2 h-6 w-6 text-text-tertiary opacity-60" />
                <p className="text-xs font-medium text-text-secondary">
                  Hozircha suhbatlar yo‘q
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  Birinchi savolingizni berib, yangi suhbat boshlang!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === currentId;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex h-11 items-center justify-between rounded-xl px-3 transition-colors ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                          : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                      }`}
                    >
                      <button
                        onClick={() => {
                          router.push(`/chat/${conv.id}`);
                          onClose();
                        }}
                        className="flex flex-1 items-center gap-2.5 overflow-hidden text-left"
                      >
                        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-text-tertiary'}`} />
                        <span className="truncate text-xs">{conv.title || 'Yangi suhbat'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Ushbu suhbatni o‘chirib tashlamoqchimisiz?')) {
                            onDelete(conv.id);
                          }
                        }}
                        className="p-1.5 text-text-tertiary hover:text-red-400 active:scale-90"
                        title="O‘chirish"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Bottom Section: Account, Theme, PWA, Settings, Author */}
          <div className="shrink-0 border-t border-border-default/80 bg-surface-secondary/30 p-3 space-y-2">
            {/* Theme Toggle (Tun / Kun) */}
            <ThemeToggle />

            {/* Font Size Toggle (Oddiy / Katta) */}
            <FontSizeToggle />

            {/* PWA Install Button */}
            <PwaInstallButton />

            {/* Guest / Account Info */}
            {!session?.user ? (
              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-2.5 text-center">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-cyan-400">Bepul sinov rejimi</span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    3 ta so‘rov
                  </span>
                </div>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Kirish / Ro‘yxatdan o‘tish</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-surface-secondary p-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar size="sm" isAI={false} />
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-bold text-text-primary">
                      {session.user.name || 'Foydalanuvchi'}
                    </p>
                    <p className="truncate text-[10px] text-text-tertiary">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="rounded-lg p-2 text-text-tertiary hover:text-red-400 active:scale-90"
                  title="Chiqish"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Author & Settings Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setAuthorModalOpen(true)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-xs font-semibold text-cyan-400 active:scale-95"
              >
                <UserCheck className="h-4 w-4" />
                <span>Muallif</span>
              </button>

              <Link
                href="/settings"
                onClick={onClose}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface-secondary text-xs font-medium text-text-primary active:scale-95"
              >
                <Settings className="h-4 w-4 text-text-secondary" />
                <span>Sozlamalar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Author Modal */}
      <AuthorModal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
      />
    </>
  );
};
