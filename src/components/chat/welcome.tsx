'use client';

import { useState, type FC } from 'react';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  FileCheck,
  FileSignature,
  Languages,
  HelpCircle,
  ArrowUpRight,
  Wand2,
} from 'lucide-react';
import { QuickToolsModal } from '@/components/chat/quick-tools-modal';

interface WelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export const Welcome: FC<WelcomeProps> = ({ onSelectPrompt }) => {
  const { data: session } = useSession();
  const [quickToolsOpen, setQuickToolsOpen] = useState(false);
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : '';

  const suggestedCards = [
    {
      title: "Imlo va Grammatika Tekshirish",
      desc: "Matndagi xatolarni to'g'rilab, toza va adabiy o'zbek tiliga keltirish",
      prompt: "Quyidagi matnni imlo va tinish belgilarini to'g'rilab, toza va chiroyli o'zbek tilida yozib ber: [Matningizni bu yerga qo'ying]",
      icon: FileCheck,
      accent: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Rasmiy Ariza va Xat Yozish",
      desc: "Ishga kirish, mehnat ta'tili yoki davlat idoralariga namunaviy ariza tayyorlash",
      prompt: "Men uchun ish yuritish standartlariga to'liq mos keladigan namunaviy rasmiy ariza tayyorlab ber. Bosh qismi (shapka), sababi va imzo joyi bo'lsin.",
      icon: FileSignature,
      accent: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Sodda Tilda Tushuntir (Kattalar uchun)",
      desc: "Murakkab qonunlar, tibbiyot, bank va texnologiyalarni oddiy tilda izohlash",
      prompt: "Murakkab tushunchani har qanday inson, hatto keksalar ham oson tushunadigan juda sodda va hayotiy misollar orqali tushuntirib ber.",
      icon: HelpCircle,
      accent: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Professional 3 Tilli Tarjimon",
      desc: "O'zbekcha ⇄ Ruscha ⇄ Inglizcha ma'no va uslubni saqlagan sifatli tarjima",
      prompt: "Quyidagi matnni O'zbekcha, Ruscha va Inglizcha tillariga so'zma-so'z emas, balki chuqur ma'nosini saqlagan holda sifatli tarjima qilib ber: [Matn]",
      icon: Languages,
      accent: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    },
  ];

  return (
    <>
      <div className="relative flex flex-1 flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-8 text-center selection:bg-cyan-500 selection:text-black">
        {/* Background ambient light */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />

        {/* Brand Icon Badge */}
        <div className="relative mb-3 sm:mb-5 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
        </div>

        {/* Main Headline */}
        <h1
          suppressHydrationWarning
          className="max-w-xl text-2xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
        >
          {firstName ? `Salom, ${firstName}!` : 'Bugun nima ustida ishlaymiz?'}
        </h1>
        <p
          suppressHydrationWarning
          className="mt-2 sm:mt-3 max-w-md text-xs sm:text-sm text-text-secondary leading-relaxed px-2"
        >
          {firstName
            ? 'Bugun qanday yangi vazifa, ariza, tarjima yoki tahlil kerak?'
            : 'Imlo tekshirish, rasmiy arizalar, tarjimalar va savollarga aniq javob beruvchi qulay AI.'}
        </p>

        {/* Quick Tools Launch Button */}
        <div className="mt-4 sm:mt-5">
          <button
            onClick={() => setQuickToolsOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 px-4 py-2 text-xs sm:text-sm font-bold text-cyan-400 shadow-sm transition-all hover:border-cyan-500/70 hover:from-cyan-500/25 hover:to-blue-500/25 active:scale-95"
          >
            <Wand2 className="h-4 w-4 animate-bounce" />
            <span>Tezkor AI Vositalari (Imlo, Ariza, Tarjima, Xulosa)</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="mt-5 sm:mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2">
          {suggestedCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(card.prompt)}
                className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border-default/80 bg-surface-secondary/40 p-3 sm:p-4 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-surface-secondary active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-1.5 sm:mb-2">
                  <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border bg-gradient-to-br ${card.accent}`}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-cyan-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-text-secondary leading-snug">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Tools Modal */}
      <QuickToolsModal
        isOpen={quickToolsOpen}
        onClose={() => setQuickToolsOpen(false)}
        onApplyPrompt={onSelectPrompt}
      />
    </>
  );
};
