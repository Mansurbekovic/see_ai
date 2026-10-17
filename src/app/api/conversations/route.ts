import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import prisma from '@/lib/database/prisma';
import { createConversationSchema } from '@/lib/security/validation';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const q = searchParams.get('q') || '';

  const whereClause: { userId: string; title?: { contains: string; mode: 'insensitive' } } = {
    userId: session.user.id,
  };
  if (q.trim()) {
    whereClause.title = { contains: q.trim(), mode: 'insensitive' };
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.conversation.count({ where: whereClause }),
  ]);

  return Response.json({
    conversations,
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

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title,
      },
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return Response.json({ error: 'Suhbat yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
