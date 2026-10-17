import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import prisma from '@/lib/database/prisma';
import { updateConversationSchema } from '@/lib/security/validation';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { attachments: true },
      },
    },
  });

  if (!conversation) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  return Response.json(conversation);
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

  const exists = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!exists) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.conversation.update({
    where: { id },
    data: { title: parsed.data.title },
  });

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

  const exists = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!exists) {
    return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
  }

  await prisma.conversation.delete({
    where: { id },
  });

  return Response.json({ success: true, message: 'Suhbat o‘chirildi' });
}
