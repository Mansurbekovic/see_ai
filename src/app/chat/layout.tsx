'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useConversations } from '@/hooks/use-conversations';
import { ModelProvider, useModel } from '@/context/model-context';

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { models, selectedModel, setSelectedModel } = useModel();

  const {
    conversations,
    deleteConversation,
    renameConversation,
    fetchConversations,
  } = useConversations();

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-primary">
      {/* Desktop Sidebar */}
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onNewChat={handleNewChat}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onSearch={fetchConversations}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        conversations={conversations}
        currentId={currentId}
        onNewChat={handleNewChat}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onSearch={fetchConversations}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onNewChat={handleNewChat}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModelProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ModelProvider>
  );
}
