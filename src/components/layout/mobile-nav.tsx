'use client';

import { type FC } from 'react';
import { Sidebar } from './sidebar';
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
  onRename,
  onSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-[280px] flex-col bg-surface-primary shadow-xl">
        <Sidebar
          conversations={conversations}
          currentId={currentId}
          onNewChat={() => {
            onNewChat();
            onClose();
          }}
          onDelete={onDelete}
          onRename={onRename}
          onSearch={onSearch}
          isOpen={true}
          onToggle={onClose}
        />
      </div>
    </div>
  );
};
