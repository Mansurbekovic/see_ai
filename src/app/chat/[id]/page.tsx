'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageList } from '@/components/chat/message-list';
import { Composer, type ComposerAttachment } from '@/components/chat/composer';
import { GuestAuthModal } from '@/components/chat/guest-auth-modal';
import { useChat, type ChatMessage } from '@/hooks/use-chat';
import { Spinner } from '@/components/ui/spinner';
import { useModel } from '@/context/model-context';

export default function ConversationPage() {
  const params = useParams();
  const id = params?.id as string;
  const { selectedModel } = useModel();

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/conversations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Yuklab bo‘lmadi');
        return res.json();
      })
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setInitialMessages(
            data.messages.map((m: { id: string; role: 'user' | 'assistant' | 'tool'; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              status: 'complete',
              createdAt: m.createdAt,
            }))
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const {
    messages,
    isStreaming,
    sendMessage,
    stop,
    guestCount,
    guestLimitReached,
    showAuthModal,
    setShowAuthModal,
  } = useChat({
    conversationId: id,
    initialMessages,
  });

  const handleSend = (
    text: string,
    attachments: ComposerAttachment[],
    enableSearch: boolean
  ) => {
    sendMessage(text, attachments, enableSearch, selectedModel);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        onRegenerate={() => {
          const lastUserMsg = messages
            .slice()
            .reverse()
            .find((m) => m.role === 'user');
          if (lastUserMsg) sendMessage(lastUserMsg.content, [], false);
        }}
      />

      <div className="mx-auto w-full max-w-3xl p-4 md:pb-6">
        <Composer
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
          guestCount={guestCount}
          guestLimitReached={guestLimitReached}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      </div>

      <GuestAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        guestCount={guestCount}
      />
    </div>
  );
}
