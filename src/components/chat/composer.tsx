'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import {
  Send,
  Square,
  Globe,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export interface ComposerAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  mimeType: string;
  size: number;
  data: string; // base64
  previewUrl?: string;
}

interface ComposerProps {
  onSend: (message: string, attachments: ComposerAttachment[], enableSearch: boolean) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  guestCount?: number;
  guestLimitReached?: boolean;
  onOpenAuthModal?: () => void;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: Array<Array<{ transcript: string }> & { isFinal?: boolean }>;
  }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function Composer({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder,
  guestCount,
  guestLimitReached = false,
  onOpenAuthModal,
}: ComposerProps) {
  const { t, locale } = useI18n();
  const [content, setContent] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Ushbu brauzerda ovozli kiritish qo'llab-quvvatlanmaydi. Google Chrome yoki Microsoft Edge brauzeridan foydalanish tavsiya etiladi.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale === 'uz' ? 'uz-UZ' : (locale === 'ru' ? 'ru-RU' : 'en-US');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript.trim()) {
          setContent((prev) => (prev ? `${prev} ${currentTranscript.trim()}` : currentTranscript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening, locale]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStop?.();
      return;
    }

    if (guestLimitReached) {
      onOpenAuthModal?.();
      return;
    }

    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;
    if (disabled || isUploading) return;

    onSend(trimmed, attachments, searchEnabled);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAttachments: ComposerAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`"${file.name}" faylining hajmi 5 MB dan oshadi. Iltimos, 5 MB dan kichik hajmdagi fayl yuklang.`);
          continue;
        }

        const isImage = file.type.startsWith('image/');
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            // Extract pure base64 without prefix if needed
            const base64Data = res.split(',')[1] || res;
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: isImage ? 'image' : 'document',
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          data: base64,
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  return (
    <div className="relative w-full rounded-2xl border border-border-default bg-surface-primary p-3 shadow-sm transition-all focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative flex items-center gap-2 rounded-xl border border-border-default bg-surface-secondary px-3 py-1.5 text-xs text-text-primary"
            >
              {att.type === 'image' ? (
                <ImageIcon className="h-3.5 w-3.5 text-brand-500" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-text-secondary" />
              )}
              <span className="max-w-[150px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="ml-1 rounded-full p-0.5 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
                aria-label="Biriktirmani o'chirish"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Guest Trial Limit Banner */}
      {guestLimitReached && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">{"Sinov so'rovlari tugadi (3/3)."}</span>
            <span className="hidden sm:inline text-amber-200/80">{"Davom ettirish uchun ro'yxatdan o'ting!"}</span>
          </div>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:from-cyan-400 hover:to-blue-500"
          >
            {"Ro'yxatdan o'tish"}
          </button>
        </div>
      )}

      {/* Voice Listening Bar */}
      {isListening && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs text-red-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-medium animate-pulse">Tinglayapman... Gapiring</span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="font-semibold underline hover:text-red-600"
          >
            {"To'xtatish"}
          </button>
        </div>
      )}

      {/* Main Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (isListening ? "Tinglayapman..." : t.chat.typeMessage)}
        disabled={disabled}
        rows={1}
        className="w-full resize-none bg-transparent text-sm md:text-base text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:opacity-50"
      />

      {/* Controls & Actions Bar */}
      <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
        <div className="flex items-center gap-1.5">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.docx,.json,.js,.ts,.py"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading || attachments.length >= 5}
            className="flex items-center justify-center rounded-xl p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40"
            title="Fayl biriktirish"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center justify-center rounded-xl p-2 transition-all ${
              isListening
                ? 'bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
            title={isListening ? "Ovozli kiritishni to'xtatish" : "Ovoz orqali gapirish"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Web Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchEnabled(!searchEnabled)}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
              searchEnabled
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
            title="Internetdan qidirish"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Qidiruv</span>
          </button>

          {/* Guest Count Badge */}
          {guestCount !== undefined && guestCount > 0 && !guestLimitReached && (
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
              Sinov: {guestCount}/3
            </span>
          )}
        </div>

        {/* Send / Stop Button */}
        <div>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-text-primary text-text-inverse transition-transform hover:scale-105 active:scale-95"
              aria-label={t.chat.stopGenerating}
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || (!content.trim() && attachments.length === 0)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition-all hover:bg-brand-700 active:scale-95 disabled:bg-surface-tertiary disabled:text-text-tertiary disabled:hover:scale-100"
              aria-label={t.chat.sendMessage}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
