'use client';

import { useState, useCallback, useRef } from 'react';
import type { ComposerAttachment } from '@/components/chat/composer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  status?: 'complete' | 'streaming' | 'error' | 'cancelled';
  createdAt?: string;
  citations?: Array<{ title: string; url: string; snippet?: string }>;
  tokensUsed?: number;
}

interface UseChatOptions {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  onFinish?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useChat({
  conversationId: initialConvId,
  initialMessages,
  onFinish,
  onError,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [prevInitialMessages, setPrevInitialMessages] = useState(initialMessages);
  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages ?? []);
  }

  const [prevConvId, setPrevConvId] = useState(initialConvId);
  if (initialConvId !== prevConvId) {
    setPrevConvId(initialConvId);
    setConversationId(initialConvId);
  }

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      attachments: ComposerAttachment[] = [],
      enableSearch: boolean = false,
      model?: string
    ) => {
      if (!content.trim() && attachments.length === 0) return;
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `asst-${Date.now()}`;

      // Append user message immediately
      const newUserMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content,
        status: 'complete',
        createdAt: new Date().toISOString(),
      };

      // Prepare placeholder assistant message
      const placeholderAssistant: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newUserMsg, placeholderAssistant]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: content,
            enableSearch,
            model,
            attachments: attachments.map((a) => ({
              type: a.type,
              mimeType: a.mimeType,
              data: a.data,
              name: a.name,
            })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server xatosi: ${res.status}`);
        }

        if (!res.body) {
          throw new Error('Javob oqimi mavjud emas');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        let citations: Array<{ title: string; url: string; snippet?: string }> = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);

            try {
              const event = JSON.parse(dataStr);

              if (event.type === 'meta') {
                if (event.conversationId && !conversationId) {
                  setConversationId(event.conversationId);
                }
              } else if (event.type === 'text') {
                accumulatedText += event.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              } else if (event.type === 'citations') {
                citations = event.citations || [];
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, citations } : msg
                  )
                );
              } else if (event.type === 'done') {
                const finalMsg: ChatMessage = {
                  id: event.messageId || assistantMsgId,
                  role: 'assistant',
                  content: accumulatedText,
                  status: 'complete',
                  citations,
                };
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? finalMsg : msg
                  )
                );
                onFinish?.(finalMsg);
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch {
              // Ignore line parse warnings
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, status: 'cancelled' }
                : msg
            )
          );
        } else {
          const errMsg =
            err instanceof Error ? err.message : 'Kutilmagan xatolik yuz berdi';
          const contactNote = '\n\n---\n💬 **Muallif bilan bog‘lanish (xatolik yoki takliflar uchun):** Telegram: [@Muhammadislom10](https://t.me/Muhammadislom10) | Tel: +998 (50) 301-63-47';
          setError(errMsg);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: `⚠️ Xatolik: ${errMsg}${contactNote}`, status: 'error' }
                : msg
            )
          );
          onError?.(err instanceof Error ? err : new Error(errMsg));
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId, isStreaming, onFinish, onError]
  );

  return {
    messages,
    isStreaming,
    conversationId,
    error,
    sendMessage,
    stop,
    setMessages,
  };
}
