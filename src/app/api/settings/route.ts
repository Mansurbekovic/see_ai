import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import prisma from '@/lib/database/prisma';
import { updateSettingsSchema } from '@/lib/security/validation';

export async function GET() {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preference = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  return Response.json({
    theme: preference?.theme || 'system',
    language: preference?.language || 'uz',
    defaultProvider: preference?.defaultProvider || 'gemini',
    defaultModel: preference?.defaultModel || 'gemini-2.5-flash',
    searchEnabled: preference?.searchEnabled || false,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.userPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...parsed.data,
    },
    update: parsed.data,
  });

  return Response.json(updated);
}
