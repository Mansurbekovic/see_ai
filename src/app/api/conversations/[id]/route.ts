import { NextRequest } from 'next/server';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/dal';
import { db, conversations, messages, attachments } from '@db';
import { updateConversationSchema } from '@/lib/security/validation';

async function findOwnedConversation(id: string, userId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .limit(1);
  return conversation;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  const conversation = await findOwnedConversation(id, session.user.id);

  if (!conversation) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  const messageRows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const attachmentRows = messageRows.length
    ? await db
        .select()
        .from(attachments)
        .where(inArray(attachments.messageId, messageRows.map((m) => m.id)))
    : [];

  return Response.json({
    ...conversation,
    messages: messageRows.map((m) => ({
      ...m,
      attachments: attachmentRows.filter((a) => a.messageId === m.id),
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  const exists = await findOwnedConversation(id, session.user.id);

  if (!exists) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [updated] = await db
    .update(conversations)
    .set({ title: parsed.data.title })
    .where(eq(conversations.id, id))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  const exists = await findOwnedConversation(id, session.user.id);

  if (!exists) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  await db.delete(conversations).where(eq(conversations.id, id));

  return Response.json({ success: true, message: 'Suhbat o‘chirildi' });
}
