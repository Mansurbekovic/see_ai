import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import { eq } from 'drizzle-orm';
import { db, userPreferences } from '@db';
import { updateSettingsSchema } from '@/lib/security/validation';

export async function GET() {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [preference] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id))
    .limit(1);

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

  const [updated] = await db
    .insert(userPreferences)
    .values({ userId: session.user.id, ...parsed.data })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  return Response.json(updated);
}
