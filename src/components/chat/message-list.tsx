'use client';

import { useRef, useEffect, type FC } from 'react';
import { Message } from './message';
import type { ChatMessage } from '@/hooks/use-chat';

interface MessageListProps {
  messages: ChatMessage[];
  onRegenerate?: () => void;
}

export const MessageList: FC<MessageListProps> = ({ messages, onRegenerate }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {messages.map((message, index) => (
        <Message
          key={message.id || index}
          message={message}
          onRegenerate={onRegenerate}
          isLast={index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
