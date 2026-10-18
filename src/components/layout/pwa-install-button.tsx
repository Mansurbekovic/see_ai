'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallButton({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      );
    }
    return false;
  });
  const [isIOS] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    }
    return false;
  });
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setPromptEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setPromptEvent(null);
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      alert(
        "Ilovani o'rnatish uchun brauzeringiz menyusidan (uch nuqta ⋮) «Ilovani o'rnatish» yoki «Bosh ekranga qo'shish» tugmasini tanlang."
      );
    }
  };

  if (isInstalled) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={handleInstallClick}
        className="rounded-xl p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        title="SEE AI ilovasini o'rnatish"
      >
        <Smartphone className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-400 hover:border-cyan-500/60 hover:bg-cyan-500/20 transition-all active:scale-95"
        title="SEE AI ilovasini telefon yoki kompyuteringizga o'rnating"
      >
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span>Ilovani o‘rnatish</span>
        </div>
        <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
          PWA
        </span>
      </button>

      {/* iOS Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border-default bg-surface-primary p-5 shadow-2xl">
            <h3 className="mb-2 text-base font-bold text-text-primary">
              iPhone / iPad uchun o‘rnatish
            </h3>
            <ol className="mb-4 list-decimal space-y-2 pl-4 text-xs text-text-secondary leading-relaxed">
              <li>Safari brauzerining pastki qismidagi <strong>Ulashish (Share)</strong> tugmasini bosing.</li>
              <li>Menyuni biroz pastga surib, <strong>«Bosh ekranga qo‘shish» (Add to Home Screen)</strong> ni tanlang.</li>
              <li>Yuqori o‘ng burchakdagi <strong>«Qo‘shish» (Add)</strong> tugmasini bosing.</li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
