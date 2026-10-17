import { NextRequest } from 'next/server';
import { and, count, desc, eq, ilike, inArray } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/dal';
import { db, conversations, messages } from '@db';
import { createConversationSchema } from '@/lib/security/validation';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const q = searchParams.get('q') || '';

  const escaped = q.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  const whereClause = escaped
    ? and(eq(conversations.userId, session.user.id), ilike(conversations.title, `%${escaped}%`))
    : eq(conversations.userId, session.user.id);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(conversations)
      .where(whereClause)
      .orderBy(desc(conversations.updatedAt))
      .offset((page - 1) * limit)
      .limit(limit),
    db.select({ total: count() }).from(conversations).where(whereClause),
  ]);

  const messageCounts = rows.length
    ? await db
        .select({ conversationId: messages.conversationId, messages: count() })
        .from(messages)
        .where(inArray(messages.conversationId, rows.map((c) => c.id)))
        .groupBy(messages.conversationId)
    : [];
  const countMap = new Map(messageCounts.map((m) => [m.conversationId, m.messages]));

  return Response.json({
    conversations: rows.map((c) => ({
      ...c,
      _count: { messages: countMap.get(c.id) ?? 0 },
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = createConversationSchema.safeParse(body);
    const title = parsed.success && parsed.data.title ? parsed.data.title : 'Yangi suhbat';

    const [conversation] = await db
      .insert(conversations)
      .values({ userId: session.user.id, title })
      .returning();

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return Response.json({ error: 'Suhbat yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
