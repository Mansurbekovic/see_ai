'use client';

import { useRef, useEffect, useState, useCallback, type FC } from 'react';
import { Message } from './message';
import type { ChatMessage } from '@/hooks/use-chat';
import { Copy, Check, Download, FileText } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  onRegenerate?: () => void;
}

export const MessageList: FC<MessageListProps> = ({ messages, onRegenerate }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyAll = useCallback(async () => {
    if (messages.length === 0) return;
    const text = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => `${m.role === 'user' ? 'Foydalanuvchi' : 'SEE AI'}:\n${m.content}\n`)
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Nusxalashda xatolik:', err);
    }
  }, [messages]);

  const handleExport = useCallback((format: 'md' | 'txt') => {
    if (messages.length === 0) return;
    const dateStr = new Date().toLocaleString('uz-UZ');
    let content = '';

    if (format === 'md') {
      content = `# SEE AI — Suhbat tarixi\n**Sana:** ${dateStr}\n\n---\n\n` +
        messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => `### ${m.role === 'user' ? '👤 Siz' : '🤖 SEE AI'}\n\n${m.content}\n\n---\n`)
          .join('\n');
    } else {
      content = `SEE AI — Suhbat tarixi\nSana: ${dateStr}\n========================================\n\n` +
        messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => `[${m.role === 'user' ? 'Siz' : 'SEE AI'}]:\n${m.content}\n\n----------------------------------------\n`)
          .join('\n');
    }

    const mime = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `see-ai-chat-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {messages.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default/40 bg-surface-primary/80 px-4 py-1.5 backdrop-blur-md text-xs text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-text-secondary">{messages.length} ta xabar</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
              title="Barcha xabarlarni nusxalash"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedAll ? 'Nusxalandi!' : 'Nusxalash'}</span>
            </button>
            <button
              onClick={() => handleExport('md')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
              title="Markdown formatida yuklab olish"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.md</span>
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
              title="Matn formatida yuklab olish"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>.txt</span>
            </button>
          </div>
        </div>
      )}
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
