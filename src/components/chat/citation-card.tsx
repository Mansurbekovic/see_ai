import { type FC } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface CitationCardProps {
  title: string;
  url: string;
  snippet?: string;
  index: number;
}

export const CitationCard: FC<CitationCardProps> = ({ title, url, snippet, index }) => {
  let hostname = '';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    hostname = url;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between gap-1.5 rounded-xl border border-border-default bg-surface-secondary p-3 text-xs transition-all duration-150 hover:border-brand-500/50 hover:bg-surface-hover hover:shadow-sm"
    >
      <div className="flex items-center gap-1.5 text-text-tertiary">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500/10 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
          {index + 1}
        </span>
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate font-medium">{hostname}</span>
        <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="line-clamp-2 font-medium text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400">
        {title}
      </p>
      {snippet && (
        <p className="line-clamp-2 text-[11px] text-text-secondary leading-snug">
          {snippet}
        </p>
      )}
    </a>
  );
};
