'use client';

import { useState, useCallback, useEffect, type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { Copy, Check, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { CitationCard } from '@/components/chat/citation-card';
import { CodeBlock } from '@/components/chat/code-block';
import type { ChatMessage } from '@/hooks/use-chat';

interface MessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export const Message: FC<MessageProps> = ({ message, onRegenerate, isLast }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }, [message.content]);

  const toggleSpeak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Brauzeringiz matnni ovozli o'qish imkoniyatini qo'llab-quvvatlamaydi.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = message.content.replace(/[#*`_~[\]()]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [isSpeaking, message.content]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`group relative flex w-full gap-4 px-4 py-5 md:px-6 ${
        isUser ? 'bg-transparent' : 'bg-surface-secondary/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <Avatar isAI={!isUser} size="md" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Role Name */}
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">
            {isUser ? 'Siz' : 'SEE AI'}
          </span>
          {isStreaming && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
          )}
        </div>

        {/* Message Body */}
        <div className={`prose-ai text-sm md:text-base text-text-primary ${isStreaming ? 'streaming-cursor' : ''}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSanitize]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                if (match) {
                  return <CodeBlock language={match[1]} value={codeString} />;
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Citations if available */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 border-t border-border-default/50 pt-3">
            <span className="mb-2 block text-xs font-medium text-text-secondary">
              Manbalar ({message.citations.length}):
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {message.citations.map((c, i) => (
                <CitationCard
                  key={i}
                  index={i}
                  title={c.title}
                  url={c.url}
                  snippet={c.snippet}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons (Always visible on mobile touchscreens) */}
        {!isStreaming && message.content && (
          <div className="mt-2.5 flex items-center gap-1 sm:gap-2 text-xs text-text-tertiary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex h-7 items-center gap-1 rounded-lg px-2 transition-colors hover:bg-surface-tertiary hover:text-text-primary active:scale-95 text-[11px] sm:text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-success">Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Nusxalash</span>
                </>
              )}
            </button>

            {/* Read Aloud Button */}
            {!isUser && (
              <button
                onClick={toggleSpeak}
                className={`flex h-7 items-center gap-1 rounded-lg px-2 transition-colors active:scale-95 text-[11px] sm:text-xs ${
                  isSpeaking
                    ? 'bg-brand-500/15 text-brand-500'
                    : 'hover:bg-surface-tertiary hover:text-text-primary'
                }`}
                title={isSpeaking ? "Ovozni to'xtatish" : "Ovoz chiqarib o'qish"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3 w-3 animate-pulse text-brand-500" />
                    <span className="text-brand-500">{"To'xtatish"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    <span>{"O'qish"}</span>
                  </>
                )}
              </button>
            )}

            {!isUser && onRegenerate && isLast && (
              <button
                onClick={onRegenerate}
                className="flex h-7 items-center gap-1 rounded-lg px-2 transition-colors hover:bg-surface-tertiary hover:text-text-primary active:scale-95 text-[11px] sm:text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Qayta yaratish</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
