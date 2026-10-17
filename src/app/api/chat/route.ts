import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/dal';
import prisma from '@/lib/database/prisma';
import { rateLimiter, rateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { chatRequestSchema } from '@/lib/security/validation';
import { providerRegistry } from '@/lib/ai/provider-registry';
import { isProviderConfigured } from '@/lib/configuration/env';
import type { AIMessage, AIAttachment } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const session = await verifySession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Rate limit
  const rateCheck = rateLimiter.check(
    rateLimitKey(userId, 'chat'),
    RATE_LIMITS.chat
  );
  if (!rateCheck.allowed) {
    return Response.json(
      { error: 'Xabarlar yuborish tezligi oshib ketdi. Iltimos, biroz kuting.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.retryAfterMs || 1000) / 1000)),
        },
      }
    );
  }

  // 3. Validate request payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Noto‘g‘ri JSON formati' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || 'Noto‘g‘ri ma‘lumotlar' },
      { status: 400 }
    );
  }

  const {
    conversationId: providedConvId,
    message: userText,
    provider: requestedProvider = 'gemini',
    model: requestedModel,
    enableSearch = false,
    attachments = [],
  } = parsed.data;

  // 4. Select provider and check API keys
  const providerName = requestedProvider;
  if (!isProviderConfigured(providerName)) {
    return Response.json(
      {
        error: `${providerName.toUpperCase()} provayderi sozlanmagan. Iltimos, server sozlamalarida tegishli API kalitini kiriting.`,
      },
      { status: 503 }
    );
  }

  const provider = providerRegistry.get(providerName);
  if (!provider) {
    return Response.json(
      { error: `Noma‘lum AI provayderi: ${providerName}` },
      { status: 400 }
    );
  }

  const modelId =
    requestedModel ||
    (providerName === 'anthropic'
      ? process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
      : process.env.GEMINI_MODEL || 'gemini-2.5-flash');

  // 5. Ensure conversation exists and belongs to user
  let conversationId = providedConvId;
  if (conversationId) {
    const existingConv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!existingConv) {
      return Response.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    }
  } else {
    const generatedTitle =
      userText.slice(0, 40).trim() + (userText.length > 40 ? '...' : '') ||
      'Yangi suhbat';
    const newConv = await prisma.conversation.create({
      data: {
        userId,
        title: generatedTitle,
      },
    });
    conversationId = newConv.id;
  }

  // 6. Persist user message to database
  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      role: 'user',
      content: userText,
      status: 'complete',
    },
  });

  // Attach files to user message if present
  if (attachments.length > 0) {
    for (const att of attachments) {
      await prisma.attachment.create({
        data: {
          conversationId,
          messageId: userMessage.id,
          userId,
          filename: att.name || 'fayl',
          originalName: att.name || 'fayl',
          mimeType: att.mimeType,
          size: Math.round((att.data.length * 3) / 4),
          storagePath: 'memory://',
        },
      });
    }
  }

  // 7. Load recent history for context
  const previousMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const formattedMessages: AIMessage[] = previousMessages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'tool',
    content: m.content,
  }));

  // Append attachments to the latest user message
  if (attachments.length > 0 && formattedMessages.length > 0) {
    const lastMsg = formattedMessages[formattedMessages.length - 1];
    if (lastMsg.role === 'user') {
      lastMsg.attachments = attachments.map((a) => ({
        type: a.type,
        mimeType: a.mimeType,
        data: a.data,
        name: a.name,
      })) as AIAttachment[];
    }
  }

  // 8. Stream response via SSE
  const apiKey =
    providerName === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY || ''
      : process.env.GEMINI_API_KEY || '';

  const providerConfig = {
    apiKey,
    model: modelId,
  };

  const generateRequest = {
    messages: formattedMessages,
    enableSearch,
    signal: req.signal,
  };

  const streamGenerator = provider.streamResponse(
    providerConfig,
    generateRequest
  );

  const encoder = new TextEncoder();
  let accumulatedText = '';
  let outputTokens = 0;
  let inputTokens = 0;

  const readable = new ReadableStream({
    async start(controller) {
      // Send initial meta event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'meta',
            conversationId,
            messageId: userMessage.id,
          })}\n\n`
        )
      );

      try {
        for await (const event of streamGenerator) {
          if (event.type === 'text') {
            accumulatedText += event.text;
          } else if (event.type === 'usage') {
            inputTokens = event.inputTokens;
            outputTokens = event.outputTokens;
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }

        // Persist final assistant response
        const assistantMessage = await prisma.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: accumulatedText,
            status: 'complete',
            provider: providerName,
            model: modelId,
            tokensUsed: outputTokens,
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Record usage
        if (inputTokens || outputTokens) {
          await prisma.usageRecord.create({
            data: {
              userId,
              provider: providerName,
              model: modelId,
              tokensIn: inputTokens,
              tokensOut: outputTokens,
            },
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              messageId: assistantMessage.id,
              conversationId,
            })}\n\n`
          )
        );
      } catch (err: unknown) {
        console.error('Chat stream error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Noma‘lum xatolik';

        // Save partial response if aborted or errored
        if (accumulatedText.trim()) {
          await prisma.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: accumulatedText,
              status: req.signal.aborted ? 'cancelled' : 'error',
              provider: providerName,
              model: modelId,
            },
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
