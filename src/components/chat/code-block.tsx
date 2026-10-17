'use client';

import { useState, useCallback, type FC } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  }, [value]);

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-border-default bg-surface-secondary text-text-primary">
      <div className="flex items-center justify-between border-b border-border-default bg-surface-tertiary/50 px-4 py-2 text-xs font-mono text-text-secondary">
        <span className="uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-500"
          aria-label="Kodni nusxalash"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="text-success">Nusxalandi!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Nusxalash</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs md:text-sm font-mono leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
};
