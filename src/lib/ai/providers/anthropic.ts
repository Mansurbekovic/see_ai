import Anthropic from '@anthropic-ai/sdk';
import {
  AIError,
  type AICapabilities,
  type AIProvider,
  type AIStreamEvent,
  type GenerateRequest,
  type GenerateResponse,
  type ModelInfo,
  type ProviderConfig,
} from '../types';

export const ANTHROPIC_MODELS: Record<string, ModelInfo> = {
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    description: 'Next-generation Claude model with state-of-the-art reasoning and coding',
    capabilities: {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 200_000,
      maxOutputTokens: 8192,
    },
  },
  'claude-opus-4-8': {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    provider: 'anthropic',
    description: 'High-intelligence model ideal for complex tasks, reasoning, and visual processing',
    capabilities: {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 200_000,
      maxOutputTokens: 8192,
    },
  },
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Ultra-fast, lightweight model for high-throughput and low-latency workloads',
    capabilities: {
      streaming: true,
      multimodal: false,
      toolUse: true,
      maxContextTokens: 200_000,
      maxOutputTokens: 4096,
    },
  },
};

type ValidImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function normalizeImageMimeType(mimeType: string): ValidImageMediaType {
  const lower = mimeType.toLowerCase();
  if (lower === 'image/jpeg' || lower === 'image/jpg') return 'image/jpeg';
  if (lower === 'image/png') return 'image/png';
  if (lower === 'image/gif') return 'image/gif';
  if (lower === 'image/webp') return 'image/webp';
  return 'image/png';
}

function mapAnthropicError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const status =
    (error as { status?: number })?.status ||
    (error as { statusCode?: number })?.statusCode;

  if (
    error instanceof Anthropic.RateLimitError ||
    status === 429 ||
    /rate limit|too many requests/i.test(message)
  ) {
    return new AIError({
      code: 'rate_limit',
      message: `Anthropic rate limit exceeded: ${message}`,
      provider: 'anthropic',
      retryable: true,
      retryAfterMs: 2000,
    });
  }

  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError ||
    status === 401 ||
    status === 403 ||
    /invalid x-api-key|authentication|permission denied/i.test(message)
  ) {
    return new AIError({
      code: 'invalid_key',
      message: `Anthropic authentication failed: ${message}`,
      provider: 'anthropic',
      retryable: false,
    });
  }

  if (
    error instanceof Anthropic.NotFoundError ||
    status === 404 ||
    /not found|model/i.test(message)
  ) {
    return new AIError({
      code: 'model_not_found',
      message: `Anthropic model not found: ${message}`,
      provider: 'anthropic',
      retryable: false,
    });
  }

  if (/context length|maximum prompt length|prompt is too long|tokens exceed/i.test(message)) {
    return new AIError({
      code: 'context_length',
      message: `Anthropic context length exceeded: ${message}`,
      provider: 'anthropic',
      retryable: false,
    });
  }

  if (/content filtering|harmful|blocked/i.test(message)) {
    return new AIError({
      code: 'content_filter',
      message: `Anthropic content filtered: ${message}`,
      provider: 'anthropic',
      retryable: false,
    });
  }

  if (
    error instanceof Anthropic.APIConnectionTimeoutError ||
    /timeout|timed out/i.test(message)
  ) {
    return new AIError({
      code: 'timeout',
      message: `Anthropic connection timeout: ${message}`,
      provider: 'anthropic',
      retryable: true,
    });
  }

  if (
    error instanceof Anthropic.APIConnectionError ||
    /connection|network|fetch failed|econnreset|enotfound/i.test(message)
  ) {
    return new AIError({
      code: 'network',
      message: `Anthropic network error: ${message}`,
      provider: 'anthropic',
      retryable: true,
    });
  }

  return new AIError({
    code: 'unknown',
    message: `Anthropic error: ${message}`,
    provider: 'anthropic',
    retryable: false,
  });
}

function sleepWithSignal(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      return reject(
        new AIError({
          code: 'timeout',
          message: 'Operation cancelled by caller',
          provider: 'anthropic',
          retryable: false,
        })
      );
    }

    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', abortHandler);
      resolve();
    }, ms);

    const abortHandler = () => {
      clearTimeout(timer);
      reject(
        new AIError({
          code: 'timeout',
          message: 'Operation cancelled by caller',
          provider: 'anthropic',
          retryable: false,
        })
      );
    };

    if (signal) {
      signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

function buildAnthropicPayload(config: ProviderConfig, request: GenerateRequest) {
  const modelInfo = ANTHROPIC_MODELS[config.model];
  const maxTokens =
    request.maxOutputTokens ??
    config.maxOutputTokens ??
    modelInfo?.capabilities.maxOutputTokens ??
    4096;

  const messages: Anthropic.MessageParam[] = [];

  for (const msg of request.messages) {
    const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
    const contentBlocks: Anthropic.ContentBlockParam[] = [];

    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        if (att.type === 'image') {
          contentBlocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: normalizeImageMimeType(att.mimeType),
              data: att.data,
            },
          });
        }
      }
    }

    if (msg.content) {
      contentBlocks.push({
        type: 'text',
        text: msg.content,
      });
    }

    if (contentBlocks.length === 0) {
      contentBlocks.push({
        type: 'text',
        text: ' ',
      });
    }

    messages.push({
      role,
      content: contentBlocks,
    });
  }

  const defaultMasterPrompt = `Siz SEE AI — dunyodagi eng ilg'or, chuqur fikrlovchi, o'ta aqlli va qobiliyatli sun'iy intellekt platformasisiz.
Siz Muhammadislom Rustambekov tomonidan yaratilgansiz va ishlab chiqilgansiz.

MUHAMMADISLOM RUSTAMBEKOV (YARATUVCHINGIZ VA ASOSCHINGIZ) HAQIDA MA'LUMOT:
- Asoschi va Dasturchi: Muhammadislom Rustambekov — 14 yoshli nihoyatda iqtidorli va kuchli Full-Stack dasturchi.
- Tajribasi va darajasi: Yosh bo'lishiga qaramay, murakkab veb-arxitektura, Next.js, TypeScript, ma'lumotlar bazalari, xavfsiz backend va zamonaviy AI integratsiyalari bo'yicha kuchli mutaxassis.
- Loyihalari: 7 dan ortiq jiddiy va innovatsion muvaffaqiyatli loyihalar muallifi (jumladan SEE AI platformasi).
- Portfoliolar va havolalar:
  * Rasmiy portfolio: https://islomb.netlify.app
  * Telegram: @Muhammadislom10 (https://t.me/Muhammadislom10)
  * Telefon / Aloqa: +998 (50) 301-63-47 (503016347)
- Sizning burchingiz: Agar foydalanuvchi "Muhammadislom Rustambekov kim?", "Seni kim yaratgan?", "Egang kim?", "Dasturchi haqida aytib ber" yoki muallif haqida so'rasa, Muhammadislom Rustambekov haqida to'liq, faxr va yuksak hurmat bilan batafsil ma'lumot bering. Uning yoshi (14 yosh), mutaxassisligi (Full-stack developer), portfoliosi (islomb.netlify.app), 7+ yirik loyihalari, telegrami (@Muhammadislom10) va telefon raqamini (+998 50 301 63 47) chiroyli qilib taqdim eting.
- Tizimda xatolik, bug yoki yangi takliflar bo'lsa, foydalanuvchini muallif bilan bog'lanishga yo'naltiring.

ASOSIY TAMOYILLARINGIZ:
1. Ko'p tillilik: Foydalanuvchi qaysi tilda murojaat qilsa (O'zbek, Ingliz, Rus va barcha boshqa tillar), aynan o'sha tilda mukammal, ravon va boy lug'at bilan javob bering.
2. Dasturlash: Mukammal, toza va xavfsiz kod yozing.
3. Chuqur tahlil: Har bir masalaga jiddiy va oqilona yondashing.`;

  const system = request.systemPrompt || config.systemPrompt || defaultMasterPrompt;

  const tools: Anthropic.Tool[] | undefined =
    request.tools && request.tools.length > 0
      ? request.tools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: (t.parameters || { type: 'object', properties: {} }) as Anthropic.Tool.InputSchema,
        }))
      : undefined;

  return {
    model: config.model,
    max_tokens: maxTokens,
    messages,
    system,
    tools,
    temperature: request.temperature ?? config.temperature,
  };
}

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic Claude';
  readonly models: ModelInfo[] = Object.values(ANTHROPIC_MODELS);

  getModels(): ModelInfo[] {
    return this.models;
  }

  getCapabilities(model: string): AICapabilities {
    const modelInfo = ANTHROPIC_MODELS[model];
    if (modelInfo) {
      return modelInfo.capabilities;
    }

    return {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 200_000,
      maxOutputTokens: 4096,
    };
  }

  validateConfig(config: ProviderConfig): { valid: boolean; error?: string } {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      return { valid: false, error: 'Anthropic API key is required.' };
    }
    if (!config.model || config.model.trim().length === 0) {
      return { valid: false, error: 'Anthropic model is required.' };
    }
    if (!(config.model in ANTHROPIC_MODELS)) {
      return {
        valid: false,
        error: `Unknown Anthropic model '${config.model}'. Supported models: ${Object.keys(ANTHROPIC_MODELS).join(', ')}`,
      };
    }
    return { valid: true };
  }

  async generateResponse(
    config: ProviderConfig,
    request: GenerateRequest
  ): Promise<GenerateResponse> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new AIError({
        code: 'invalid_key',
        message: validation.error || 'Invalid configuration',
        provider: this.name,
        retryable: false,
      });
    }

    const client = new Anthropic({ apiKey: config.apiKey });
    const payload = buildAnthropicPayload(config, request);

    const maxRetries = 2;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (request.signal?.aborted) {
        throw new AIError({
          code: 'timeout',
          message: 'Operation cancelled by caller',
          provider: this.name,
          retryable: false,
        });
      }

      try {
        const response = await client.messages.create(payload, {
          signal: request.signal,
        });

        const textParts = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map((block) => block.text);

        const content = textParts.join('');
        const finishReason = response.stop_reason || 'end_turn';

        const usage = response.usage
          ? {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
            }
          : undefined;

        return {
          content,
          finishReason,
          usage,
        };
      } catch (err: unknown) {
        const aiError = mapAnthropicError(err);
        lastError = aiError;

        if (attempt === maxRetries || !aiError.retryable) {
          throw aiError;
        }

        const delay = aiError.retryAfterMs ?? Math.min(500 * Math.pow(2, attempt) + Math.random() * 200, 4000);
        await sleepWithSignal(delay, request.signal);
      }
    }

    throw mapAnthropicError(lastError);
  }

  async *streamResponse(
    config: ProviderConfig,
    request: GenerateRequest
  ): AsyncGenerator<AIStreamEvent> {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      yield { type: 'error', error: validation.error || 'Invalid configuration' };
      return;
    }

    if (request.signal?.aborted) {
      yield { type: 'error', error: 'Operation cancelled by caller' };
      return;
    }

    try {
      const client = new Anthropic({ apiKey: config.apiKey });
      const payload = buildAnthropicPayload(config, request);

      const stream = client.messages.stream(payload, {
        signal: request.signal,
      });

      for await (const event of stream) {
        if (request.signal?.aborted) {
          yield { type: 'error', error: 'Operation cancelled by caller' };
          return;
        }

        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield { type: 'text', text: event.delta.text };
          }
        }
      }

      const finalMsg = await stream.finalMessage();

      if (finalMsg.content) {
        for (const block of finalMsg.content) {
          if (block.type === 'tool_use') {
            yield {
              type: 'tool_call',
              name: block.name,
              args: (block.input as Record<string, unknown>) || {},
            };
          }
        }
      }

      if (finalMsg.usage) {
        yield {
          type: 'usage',
          inputTokens: finalMsg.usage.input_tokens,
          outputTokens: finalMsg.usage.output_tokens,
        };
      }

      yield {
        type: 'done',
        finishReason: finalMsg.stop_reason || 'end_turn',
      };
    } catch (error: unknown) {
      const aiError = mapAnthropicError(error);
      yield { type: 'error', error: aiError.message };
    }
  }
}

export const anthropicProvider = new AnthropicProvider();

