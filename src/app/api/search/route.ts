import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import { rateLimiter, rateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { searchSchema } from '@/lib/security/validation';
import { executeSearch } from '@/lib/search/provider';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = rateLimiter.check(
    rateLimitKey(session.user.id, 'search'),
    RATE_LIMITS.search
  );
  if (!rateCheck.allowed) {
    return Response.json(
      { error: 'Qidiruv so‘rovlari chegarasi oshdi' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const results = await executeSearch(parsed.data.query);
    return Response.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ error: 'Qidiruvda xatolik yuz berdi' }, { status: 500 });
  }
}
