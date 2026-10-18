'use client';

import { type FC } from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, Code2, BrainCircuit, Compass, ArrowUpRight } from 'lucide-react';

interface WelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export const Welcome: FC<WelcomeProps> = ({ onSelectPrompt }) => {
  const { data: session } = useSession();
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : '';

  const suggestedCards = [
    {
      title: "Muhammadislom Rustambekov (Muallif)",
      desc: "14 yoshli Full-Stack dasturchi va SEE AI asoschisi haqida ma'lumot",
      prompt: "Muhammadislom Rustambekov kim? U haqida to'liq ma'lumot, yoshi, portfoliolar va loyihalarini aytib ber.",
      icon: Sparkles,
      accent: "from-cyan-500/25 to-blue-500/25 text-cyan-400 border-cyan-500/40",
    },
    {
      title: "Dasturlash & Kod (Full-Stack)",
      desc: "Next.js va TypeScript'da toza, yuqori xavfsizlikka ega arxitektura tuzish",
      prompt: "Next.js 16 va TypeScript asosida yuqori xavfsizlikka ega va unumdor API arxitekturasini qanday loyihalash kerakligini ko'rsatib ber.",
      icon: Code2,
      accent: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Chuqur Mantiq & Tahlil",
      desc: "Murakkab masalalarni bosqichma-bosqich mantiqiy tahlil qilish",
      prompt: "Katta ma'lumotlar bazasida so'rovlar tezligini 10 barobar oshirish uchun qanday strategiyalarni qo'llash mumkin? Chuqur tahlil qilib ber.",
      icon: BrainCircuit,
      accent: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Yangi G'oyalar & Strategiya",
      desc: "Innovatsion loyihalar va startaplar uchun yechimlar ishlab chiqish",
      prompt: "Menga zamonaviy AI vositalari yordamida avtomatlashtirilgan yangi startap g'oyasi va uning 3 oylik yo'l xaritasini taklif qil.",
      icon: Compass,
      accent: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
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
          ? 'Bugun qanday yangi g‘oya, kod yoki tahlil ustida ishlaymiz?'
          : 'Ilg‘or tahlil, dasturlash va har qanday tildagi erkin muloqot uchun professional AI yordamchisi.'}
      </p>

      {/* Cards Grid */}
      <div className="mt-5 sm:mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2">
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
                <h3 className="text-xs font-semibold text-text-primary group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-text-secondary leading-snug">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
