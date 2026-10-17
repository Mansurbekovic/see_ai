import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import { rateLimiter, rateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateFile, sanitizeFilename } from '@/lib/security/sanitize';
import { processFileContent } from '@/lib/files/document-processor';
import prisma from '@/lib/database/prisma';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateCheck = rateLimiter.check(
    rateLimitKey(session.user.id, 'upload'),
    RATE_LIMITS.upload
  );
  if (!rateCheck.allowed) {
    return Response.json(
      { error: 'Juda ko‘p fayl yuklandi. Biroz kuting.' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const conversationId = formData.get('conversationId') as string | null;

    if (!file) {
      return Response.json({ error: 'Fayl topilmadi' }, { status: 400 });
    }

    const validation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const cleanFilename = sanitizeFilename(file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';
    let base64Data = '';

    if (file.type.startsWith('image/')) {
      base64Data = buffer.toString('base64');
    } else {
      const processed = await processFileContent(buffer, file.type, cleanFilename);
      extractedText = processed.text;
    }

    // Optional database record
    let attachmentId = '';
    if (conversationId) {
      const attachment = await prisma.attachment.create({
        data: {
          conversationId,
          userId: session.user.id,
          filename: cleanFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          storagePath: 'memory://' + cleanFilename,
        },
      });
      attachmentId = attachment.id;
    }

    return Response.json({
      id: attachmentId || `${Date.now()}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      extractedText,
      base64Data,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'Faylni qayta ishlashda xatolik yuz berdi' }, { status: 500 });
  }
}
