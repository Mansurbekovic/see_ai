'use client';

import { Welcome } from '@/components/chat/welcome';
import { Composer, type ComposerAttachment } from '@/components/chat/composer';
import { MessageList } from '@/components/chat/message-list';
import { useChat } from '@/hooks/use-chat';
import { useModel } from '@/context/model-context';

export default function NewChatPage() {
  const { messages, isStreaming, sendMessage, stop } = useChat();
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
      <div className="mx-auto w-full max-w-3xl p-4 md:pb-6">
        <Composer
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
