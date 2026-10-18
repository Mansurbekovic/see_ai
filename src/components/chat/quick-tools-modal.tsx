'use client';

import { useState, type FC } from 'react';
import {
  X,
  Sparkles,
  FileCheck,
  FileSignature,
  Languages,
  BookOpen,
  HelpCircle,
  Code2,
  ArrowRight,
  Send,
} from 'lucide-react';

export interface QuickTool {
  id: string;
  title: string;
  badge: string;
  desc: string;
  icon: typeof Sparkles;
  gradient: string;
  placeholder: string;
  buildPrompt: (input: string) => string;
}

export const QUICK_TOOLS: QuickTool[] = [
  {
    id: 'grammar',
    title: 'Imlo va Grammatika Tekshirish',
    badge: 'Xatolarni tuzatish',
    desc: "Matndagi imlo, tinish belgilari va uslubiy xatolarni to'g'rilab, mukammal holatga keltiradi.",
    icon: FileCheck,
    gradient: 'from-emerald-500 to-teal-600 text-emerald-400',
    placeholder: "Xatolarini tekshirmoqchi bo'lgan matningizni shu yerga yozing yoki nusxalab qo'ying...",
    buildPrompt: (text) =>
      `Quyidagi matnni imlo, grammatika, tinish belgilari va uslubiy xatolardan tozalab, sof va to'g'ri o'zbek tilida qayta yozib ber. Qilingan tuzatishlarni qisqacha izohlab ber:\n\n"""\n${text}\n"""`,
  },
  {
    id: 'official-letter',
    title: 'Rasmiy Ariza va Xat Yozish',
    badge: 'Hujjatlar & Arizalar',
    desc: "Ishga kirish, ta'til olish, tashkilot yoki davlat organlariga rasmiy ariza va xat tayyorlash.",
    icon: FileSignature,
    gradient: 'from-blue-500 to-indigo-600 text-blue-400',
    placeholder: "Misol: Maktab direktoriga 3 kunga farzandimga ruxsat so'rab ariza yozib ber, yoki Firma rahbariga mehnat ta'tili haqida...",
    buildPrompt: (text) =>
      `Men uchun rasmiy, qonuniy va barcha ish yuritish qoidalariga mos ariza (yoki rasmiy xat) yozib ber. Talablar: To'liq bosh qismi (shapka), murojaat matni, sana va imzo joyi bo'lsin. Mavzu / maqsadi:\n\n${text}`,
  },
  {
    id: 'translator',
    title: 'Professional 3 Tilli Tarjimon',
    badge: "O'zbek ⇄ Rus ⇄ Ingliz",
    desc: "Oddiy lug'at emas, matn ma'nosi va so'zlashuv nozikliklarini saqlagan professional tarjima.",
    icon: Languages,
    gradient: 'from-cyan-500 to-blue-600 text-cyan-400',
    placeholder: "Tarjima qilmoqchi bo'lgan so'z, gap yoki matningizni kiriting va qaysi tilga ekanligini yozing...",
    buildPrompt: (text) =>
      `Quyidagi matnni professional darajada, ma'no va uslubni buzmasdan tarjima qilib ber. Agar til ko'rsatilmagan bo'lsa, O'zbekcha ⇄ Inglizcha ⇄ Ruscha variantlarini taqdim et:\n\n"""\n${text}\n"""`,
  },
  {
    id: 'summarize',
    title: 'Matnni Qisqartirish va Xulosa',
    badge: 'Konspekt & Asosiy fikr',
    desc: "Uzun maqola, xabar yoki hujjatdan eng muhim 3-5 ta punktni ajratib beradi.",
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600 text-amber-400',
    placeholder: "Qisqartirmoqchi bo'lgan uzun maqola, xabar yoki hujjat matnini kiriting...",
    buildPrompt: (text) =>
      `Quyidagi matnni diqqat bilan o'rganib, uning eng muhim 3-5 ta asosiy fikrini aniq va tushunarli qilib punktlarda (tezislarda) konspekt qilib ber:\n\n"""\n${text}\n"""`,
  },
  {
    id: 'eli5',
    title: 'Oddiy va Xalqona Tushuntir',
    badge: 'Katta va kichiklar uchun',
    desc: "Murakkab qonunlar, tibbiy atamalar, bank foizlari yoki texnologiyalarni oddiy tilda tushuntirish.",
    icon: HelpCircle,
    gradient: 'from-purple-500 to-pink-600 text-purple-400',
    placeholder: "Misol: Bank depoziti qanday ishlaydi? Qonundagi ushbu modda nimani anglatadi?...",
    buildPrompt: (text) =>
      `Quyidagi mavzuni yoki savolni har qanday inson, hatto katta yoshli insonlar yoki bolalar ham oson tushunadigan juda sodda, samimiy va hayotiy misollar orqali tushuntirib ber. Keraksiz murakkab atamalardan qoch:\n\n${text}`,
  },
  {
    id: 'coding',
    title: 'Dasturlash va Kod Yordamchisi',
    badge: 'Dasturchilar & Talabalar',
    desc: "Kod yozish, xatolarni topish (debug) va zamonaviy texnologiyalarni o'rganish.",
    icon: Code2,
    gradient: 'from-rose-500 to-red-600 text-rose-400',
    placeholder: "Kodingizni yoki nima dastur yaratmoqchi ekanligingizni yozing...",
    buildPrompt: (text) =>
      `Quyidagi kod yoki dasturlash masalasi bo'yicha to'liq, xavfsiz va toza kod yechimini taqdim et. Har bir asosiy qadamni qisqacha tushuntir:\n\n${text}`,
  },
];

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (promptText: string) => void;
}

export const QuickToolsModal: FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  onApplyPrompt,
}) => {
  const [selectedTool, setSelectedTool] = useState<QuickTool | null>(null);
  const [userInput, setUserInput] = useState('');

  if (!isOpen) return null;

  const handleExecute = () => {
    if (!selectedTool) return;
    const trimmed = userInput.trim();
    if (!trimmed) {
      alert("Iltimos, matn yoki savolingizni kiriting!");
      return;
    }
    const finalPrompt = selectedTool.buildPrompt(trimmed);
    onApplyPrompt(finalPrompt);
    setUserInput('');
    setSelectedTool(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setSelectedTool(null);
          setUserInput('');
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border-default/90 bg-surface-primary shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {selectedTool ? selectedTool.title : 'Tezkor AI Vositalari'}
              </h2>
              <p className="text-xs text-text-secondary">
                {selectedTool
                  ? selectedTool.badge
                  : 'Kundalik ishlar, hujjatlar va o\'rganish uchun qulay yordamchilar'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedTool(null);
              setUserInput('');
              onClose();
            }}
            className="rounded-xl p-2 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary active:scale-90 transition-all"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {selectedTool ? (
            /* Tool Input Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border-default/70 bg-surface-secondary/40 p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedTool.gradient}`}>
                    <selectedTool.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{selectedTool.title}</h3>
                    <p className="text-xs text-text-secondary">{selectedTool.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 active:scale-95"
                >
                  Boshqa vosita
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-primary">
                  Matningiz yoki so&apos;rovingiz:
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={selectedTool.placeholder}
                  rows={6}
                  className="w-full rounded-2xl border border-border-default bg-surface-secondary/50 p-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className="rounded-xl border border-border-default px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary active:scale-95"
                >
                  Orqaga
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={!userInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 disabled:opacity-40"
                >
                  <span>AI ga yuborish</span>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Tools Grid */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUICK_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border-default/80 bg-surface-secondary/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-surface-secondary active:scale-[0.98]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-text-secondary group-hover:text-cyan-400">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-cyan-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 opacity-90 group-hover:translate-x-1 transition-transform">
                      <span>Foydalanish</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
