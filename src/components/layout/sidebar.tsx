'use client';

import { useState, type FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Plus,
  MessageSquare,
  Search,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { Avatar } from '@/components/ui/avatar';
import { AuthorModal } from '@/components/layout/author-modal';
import type { ConversationItem } from '@/hooks/use-conversations';

interface SidebarProps {
  conversations: ConversationItem[];
  currentId?: string;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onSearch: (q: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
  conversations,
  currentId,
  onNewChat,
  onDelete,
  onRename,
  onSearch,
  isOpen,
  onToggle,
}) => {
  const { t } = useI18n();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorModalOpen, setAuthorModalOpen] = useState(false);

  const handleStartRename = (c: ConversationItem) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (!isOpen) {
    return (
      <>
        <div className="hidden border-r border-border-default bg-surface-secondary/40 p-3 md:flex md:flex-col md:items-center md:justify-between h-full">
          <div className="flex flex-col items-center">
            <button
              onClick={onToggle}
              className="rounded-xl p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
              title="Yon panelni ochish"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNewChat}
              className="mt-3 rounded-xl bg-brand-600 p-2 text-white shadow-sm hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
              title={t.chat.newChat}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setAuthorModalOpen(true)}
              className="rounded-xl p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="Muallif: Muhammadislom Rustambekov"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <Link
              href="/settings"
              className="rounded-xl p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
              title={t.settings.title}
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="rounded-xl p-2 text-text-secondary hover:bg-surface-secondary hover:text-error transition-colors"
              title="Chiqish"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <AuthorModal
          isOpen={authorModalOpen}
          onClose={() => setAuthorModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <aside className="relative flex h-full w-[280px] flex-col border-r border-border-default bg-surface-secondary/60">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border-default/60 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-text-primary">SEE AI</span>
            <span className="ml-1.5 rounded bg-brand-500/10 px-1 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
              PRO
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
          title="Yopish"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>{t.chat.newChat}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder={t.chat.searchConversations}
            className="w-full rounded-xl border border-border-default bg-surface-primary py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-text-tertiary">
            {t.chat.noConversations}
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((c) => {
              const isActive = currentId === c.id;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  className={`group relative flex items-center rounded-xl px-2.5 py-2 text-xs transition-colors ${
                    isActive
                      ? 'bg-surface-primary font-medium text-text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" />

                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded bg-surface-secondary px-1.5 py-0.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(c.id)}
                        className="text-success hover:opacity-80"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-text-tertiary hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/chat/${c.id}`}
                        className="flex-1 truncate"
                        title={c.title}
                      >
                        {c.title}
                      </Link>

                      {/* Item Actions */}
                      <div className="hidden items-center gap-1 group-hover:flex">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleStartRename(c);
                          }}
                          className="rounded p-1 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
                          title={t.chat.rename}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onDelete(c.id);
                          }}
                          className="rounded p-1 text-text-tertiary hover:bg-surface-tertiary hover:text-error"
                          title={t.chat.delete}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer User Profile & Actions */}
      <div suppressHydrationWarning className="border-t border-border-default/60 p-2 space-y-1">
        {/* Author / Creator Quick Card */}
        <button
          onClick={() => setAuthorModalOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-2 text-left hover:border-cyan-500/40 hover:from-cyan-500/15 hover:to-blue-500/15 transition-all group"
          title="Muallif: Muhammadislom Rustambekov haqida to'liq ma'lumot"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-[10px] font-bold text-white shadow-sm">
            MR
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-xs font-semibold text-text-primary group-hover:text-cyan-400 transition-colors">
              Muhammadislom R.
            </span>
            <span className="truncate text-[10px] text-text-tertiary">
              Asoschi & Full-Stack (14 yosh)
            </span>
          </div>
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
        </button>

        {session?.user && (
          <div className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface-hover/80 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar
                name={session.user.name || 'Foydalanuvchi'}
                image={session.user.image}
                size="sm"
              />
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-xs font-semibold text-text-primary">
                  {session.user.name || 'Foydalanuvchi'}
                </span>
                <span className="truncate text-[10px] text-text-tertiary">
                  {session.user.email || ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-error"
              title="Chiqish"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {!session?.user && (
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-2.5 text-center">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-cyan-400">Sinov rejimi</span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">3 ta bepul</span>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <span>{"Kirish / Ro'yxatdan o'tish"}</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
              pathname === '/settings'
                ? 'bg-surface-primary text-text-primary shadow-sm'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>{t.settings.title}</span>
          </Link>
        </div>
      </div>
    </aside>
    <AuthorModal
      isOpen={authorModalOpen}
      onClose={() => setAuthorModalOpen(false)}
    />
    </>
  );
};
