'use client';

import { Welcome } from '@/components/chat/welcome';
import { Composer, type ComposerAttachment } from '@/components/chat/composer';
import { MessageList } from '@/components/chat/message-list';
import { GuestAuthModal } from '@/components/chat/guest-auth-modal';
import { useChat } from '@/hooks/use-chat';
import { useModel } from '@/context/model-context';

export default function NewChatPage() {
  const {
    messages,
    isStreaming,
    sendMessage,
    stop,
    guestCount,
    guestLimitReached,
    showAuthModal,
    setShowAuthModal,
  } = useChat();
  const { selectedModel } = useModel();

  const handleSend = (
    text: string,
    attachments: ComposerAttachment[],
    enableSearch: boolean
  ) => {
    sendMessage(text, attachments, enableSearch, selectedModel);
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-1 overflow-y-auto">
          <Welcome onSelectPrompt={(p) => sendMessage(p, [], false, selectedModel)} />
        </div>
      ) : (
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
      )}

      {/* Fixed Composer Bottom Bar */}
      <div className="mx-auto w-full max-w-3xl p-2.5 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-6">
        <Composer
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
          guestCount={guestCount}
          guestLimitReached={guestLimitReached}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      </div>

      {/* Guest Trial Limit Modal */}
      <GuestAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        guestCount={guestCount}
      />
    </div>
  );
}

