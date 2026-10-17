import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/database/prisma';

const registerSchema = z.object({
  email: z.string().email("To'g'ri elektron pochta manzilini kiriting"),
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json(
        { error: "So'rov ma'lumotlari kiritilmadi" },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Ma'lumotlar to'g'ri kiritilmadi";
      return Response.json(
        {
          error: firstError,
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, name, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return Response.json(
        { error: "Bu elektron pochta manzili allaqachon ro'yxatdan o'tgan" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
      },
    });

    // Default user preference
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        theme: 'system',
        language: 'uz',
        defaultProvider: 'gemini',
        defaultModel: 'gemini-2.5-flash',
      },
    }).catch(() => {});

    return Response.json(
      { success: true, message: "Hisob muvaffaqiyatli yaratildi" },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Registration server error:', err);
    const msg = err instanceof Error ? err.message : "Kutilmagan xatolik yuz berdi";
    return Response.json(
      { error: `Ro'yxatdan o'tishda xatolik: ${msg}` },
      { status: 500 }
    );
  }
}
