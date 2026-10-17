'use client';

import { type FC } from 'react';
import {
  X,
  Sparkles,
  Phone,
  Send,
  Globe,
  Code2,
  Layers,
  Bug,
  Award,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorModal: FC<AuthorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-blue-600/20 blur-[80px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Yopish"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Author Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-slate-800/80">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-2xl shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/40">
            MR
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-900">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>

          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20 mb-1.5">
              <Sparkles className="h-3 w-3" />
              <span>SEE AI Asoschisi & Bosh Arxitektori</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Muhammadislom Rustambekov
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              14 yoshli iqtidorli Full-Stack Dasturchi
            </p>
          </div>
        </div>

        {/* Highlights / Stats */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3 text-center">
            <Award className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-base font-bold text-white">14 yosh</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Yosh</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3 text-center">
            <Code2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-base font-bold text-white">Full-Stack</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Daraja</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3 text-center">
            <Layers className="h-4 w-4 text-purple-400 mx-auto mb-1" />
            <div className="text-base font-bold text-white">7+ loyiha</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Loyihalar</div>
          </div>
        </div>

        {/* Bio text */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          Yosh bo‘lishiga qaramay, murakkab veb-arxitekturalar, Next.js, zamonaviy sun’iy intellekt integratsiyalari va xavfsiz tizimlarni ishlab chiqish bo‘yicha yuqori tajribaga ega dasturchi. 7 dan ortiq jiddiy va amaliy loyihalar yaratgan.
        </p>

        {/* Contact Links */}
        <div className="space-y-2 mb-4">
          {/* Portfolio */}
          <a
            href="https://islomb.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Rasmiy Portfolio</div>
                <div className="text-[10px] text-slate-400">islomb.netlify.app</div>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/Muhammadislom10"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-200 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Telegram profil</div>
                <div className="text-[10px] text-slate-400">@Muhammadislom10</div>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </a>

          {/* Phone */}
          <a
            href="tel:+998503016347"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Telefon raqam</div>
                <div className="text-[10px] text-slate-400">+998 (50) 301-63-47</div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-400">Qo‘ng‘iroq qilish</span>
          </a>
        </div>

        {/* Bug / Feedback Box */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <Bug className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-white">Xatolik (Bug) yoki taklif bormi?</span>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              Agar tizimda biror xatolik sezsangiz yoki yangi g‘oyangiz bo‘lsa, to‘g‘ridan-to‘g‘ri muallifga Telegram orqali yozing.
            </p>
          </div>
          <a
            href="https://t.me/Muhammadislom10"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Xabar yozish
          </a>
        </div>
      </div>
    </div>
  );
};
