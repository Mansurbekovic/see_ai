'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  guestCount?: number;
}

export function GuestAuthModal({
  isOpen,
  guestCount = 3,
}: GuestAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-[#07090e] p-6 sm:p-8 text-slate-100 shadow-2xl shadow-cyan-500/20">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* Header Icon */}
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <Sparkles className="h-7 w-7 text-white animate-pulse" />
        </div>

        {/* Content */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            <span>{"Sinov so'rovlari: "}{guestCount}/3</span>
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Bepul sinov limiti tugadi
          </h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed sm:text-sm">
            {"Siz 3 ta bepul sinov so'rovidan foydalandingiz. SEE AI bilan suhbatni cheklovlarsiz davom ettirish uchun ro'yxatdan o'tish yoki tizimga kirish talab etiladi."}
          </p>
        </div>

        {/* Benefits list */}
        <div className="my-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{"Cheksiz tezkor AI so'rovlari (Gemini & Claude)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Suhbatlar tarixini avtomatik xavfsiz saqlash</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Ovozli savol-javob va shaxsiy sozlamalar</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>{"Ro'yxatdan o'tish (Bepul)"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            <span>Hisobingiz bormi? Tizimga kirish</span>
          </Link>
        </div>

        {/* Footer author attribution */}
        <div className="mt-5 text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
          SEE AI — Asoschi: <span className="text-cyan-400 font-medium">Muhammadislom Rustambekov</span> (14 yosh)
        </div>
      </div>
    </div>
  );
}
