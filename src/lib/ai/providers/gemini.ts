import { GoogleGenAI } from '@google/genai';
import {
  AIError,
  type AICapabilities,
  type AICitation,
  type AIProvider,
  type AIStreamEvent,
  type GenerateRequest,
  type GenerateResponse,
  type ModelInfo,
  type ProviderConfig,
} from '../types';

export const GEMINI_MODELS: Record<string, ModelInfo> = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Fast, high-throughput multimodal model with 1M context window',
    capabilities: {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 1_000_000,
      maxOutputTokens: 8192,
    },
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Advanced reasoning, complex coding, and analysis with 1M context window',
    capabilities: {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 1_000_000,
      maxOutputTokens: 8192,
    },
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    description: 'Next-generation fast model optimized for low latency and multimodal tasks',
    capabilities: {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 1_000_000,
      maxOutputTokens: 8192,
    },
  },
};

function mapGeminiError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const status =
    (error as { status?: number })?.status ||
    (error as { statusCode?: number })?.statusCode ||
    (error as { response?: { status?: number } })?.response?.status;

  if (status === 429 || /rate limit|quota|resource exhausted/i.test(message)) {
    return new AIError({
      code: 'rate_limit',
      message: `Gemini rate limit exceeded: ${message}`,
      provider: 'gemini',
      retryable: true,
      retryAfterMs: (error as { retryAfterMs?: number })?.retryAfterMs || 2000,
    });
  }

  if (status === 401 || status === 403 || /api key|unauthenticated|permission denied/i.test(message)) {
    return new AIError({
      code: 'invalid_key',
      message: `Gemini authentication failed: ${message}`,
      provider: 'gemini',
      retryable: false,
    });
  }

  if (status === 404 || /not found|model.*not found/i.test(message)) {
    return new AIError({
      code: 'model_not_found',
      message: `Gemini model not found: ${message}`,
      provider: 'gemini',
      retryable: false,
    });
  }

  if (/context length|token limit|maximum prompt length|too many tokens/i.test(message)) {
    return new AIError({
      code: 'context_length',
      message: `Gemini context length exceeded: ${message}`,
      provider: 'gemini',
      retryable: false,
    });
  }

  if (/safety|blocked|content filter|harm/i.test(message)) {
    return new AIError({
      code: 'content_filter',
      message: `Gemini content filtered: ${message}`,
      provider: 'gemini',
      retryable: false,
    });
  }

  if (/network|fetch failed|econnreset|enotfound|etimedout/i.test(message)) {
    return new AIError({
      code: 'network',
      message: `Gemini network error: ${message}`,
      provider: 'gemini',
      retryable: true,
    });
  }

  if (/abort|timeout/i.test(message)) {
    return new AIError({
      code: 'timeout',
      message: `Gemini request timed out or cancelled: ${message}`,
      provider: 'gemini',
      retryable: false,
    });
  }

  return new AIError({
    code: 'unknown',
    message: `Gemini error: ${message}`,
    provider: 'gemini',
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
          provider: 'gemini',
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
          provider: 'gemini',
          retryable: false,
        })
      );
    };

    if (signal) {
      signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

function extractGroundingCitations(candidate: unknown): AICitation[] {
  const citations: AICitation[] = [];
  const metadata = (candidate as { groundingMetadata?: Record<string, unknown> })?.groundingMetadata;
  if (!metadata) return citations;

  const chunks = metadata.groundingChunks as Array<{ web?: { uri?: string; title?: string; snippet?: string } }> | undefined;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (chunk?.web?.uri) {
        citations.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
          snippet: chunk.web.snippet || undefined,
        });
      }
    }
  }

  const supports = metadata.groundingSupports as Array<{
    groundingChunkIndices?: number[];
    segment?: { text?: string };
  }> | undefined;
  if (Array.isArray(supports) && Array.isArray(chunks)) {
    for (const support of supports) {
      if (Array.isArray(support.groundingChunkIndices)) {
        for (const idx of support.groundingChunkIndices) {
          const chunk = chunks[idx];
          const web = (chunk as { web?: { uri?: string; title?: string } } | undefined)?.web;
          if (web?.uri && !citations.some((c) => c.url === web.uri)) {
            citations.push({
              title: web.title || web.uri,
              url: web.uri,
              snippet: support.segment?.text || undefined,
            });
          }
        }
      }
    }
  }

  const seen = new Set<string>();
  return citations.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

function buildGeminiPayload(config: ProviderConfig, request: GenerateRequest) {
  const contents = request.messages.map((msg) => {
    const parts: Array<Record<string, unknown>> = [];

    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (msg.attachments && msg.attachments.length > 0) {
      for (const att of msg.attachments) {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          },
        });
      }
    }

    if (parts.length === 0) {
      parts.push({ text: '' });
    }

    const role = msg.role === 'assistant' ? 'model' : (msg.role === 'tool' ? 'tool' : 'user');
    return {
      role,
      parts,
    };
  });

  const genConfig: Record<string, unknown> = {};

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
1. Ko'p tillilik: Foydalanuvchi qaysi tilda murojaat qilsa (O'zbek, Ingliz, Rus, Turk, Arab va barcha boshqa tillar), aynan o'sha tilda mukammal, ravon, tabiiy va chuqur tahlil bilan javob bering. O'zbek tilida so'zlashganda nihoyatda chiroyli, boy va adabiy so'z boyligidan foydalaning.
2. Aniq va chuqur mantiq: Savollarga shunchaki umumiy gaplar bilan emas, balki mohiyatini ochib beruvchi, faktlarga asoslangan, tushunarli va qadamma-qadam yechim bering.
3. Dasturlash va IT: Kod yozganda zamonaviy, toza, xavfsiz va xatosiz kod bloklarini Markdown formatida keltiring.
4. Chiroyli formatlash: Javoblarni o'qish maroqli bo'lishi uchun sarlavhalar, ro'yxatlar, qalin matn va jadvallardan foydalaning.`;

  const systemPrompt = request.systemPrompt || config.systemPrompt || defaultMasterPrompt;
  if (systemPrompt) {
    genConfig.systemInstruction = systemPrompt;
  }

  const temperature = request.temperature ?? config.temperature;
  if (temperature !== undefined) {
    genConfig.temperature = temperature;
  }

  const maxOutputTokens = request.maxOutputTokens ?? config.maxOutputTokens;
  if (maxOutputTokens !== undefined) {
    genConfig.maxOutputTokens = maxOutputTokens;
  }

  const tools: Array<Record<string, unknown>> = [];
  if (request.enableSearch) {
    tools.push({ googleSearch: {} });
  }

  if (request.tools && request.tools.length > 0) {
    tools.push({
      functionDeclarations: request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    });
  }

  if (tools.length > 0) {
    genConfig.tools = tools;
  }

  return { contents, genConfig };
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  readonly displayName = 'Google Gemini';
  readonly models: ModelInfo[] = Object.values(GEMINI_MODELS);

  getModels(): ModelInfo[] {
    return this.models;
  }

  getCapabilities(model: string): AICapabilities {
    const modelInfo = GEMINI_MODELS[model];
    if (modelInfo) {
      return modelInfo.capabilities;
    }

    return {
      streaming: true,
      multimodal: true,
      toolUse: true,
      maxContextTokens: 1_000_000,
      maxOutputTokens: 8192,
    };
  }

  validateConfig(config: ProviderConfig): { valid: boolean; error?: string } {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      return { valid: false, error: 'Gemini API key is required.' };
    }
    if (!config.model || config.model.trim().length === 0) {
      return { valid: false, error: 'Gemini model is required.' };
    }
    if (!(config.model in GEMINI_MODELS)) {
      return {
        valid: false,
        error: `Unknown Gemini model '${config.model}'. Supported models: ${Object.keys(GEMINI_MODELS).join(', ')}`,
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

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const { contents, genConfig } = buildGeminiPayload(config, request);

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
        const response = await ai.models.generateContent({
          model: config.model,
          contents,
          config: genConfig,
        });

        const candidate = response.candidates?.[0];
        let content = response.text || '';
        if (!content && candidate?.content?.parts) {
          content = (candidate.content.parts as Array<{ text?: string }>)
            .map((p) => p.text || '')
            .join('');
        }

        const finishReason = candidate?.finishReason || 'STOP';
        const citations = candidate ? extractGroundingCitations(candidate) : [];

        let usage: { inputTokens: number; outputTokens: number } | undefined;
        if (response.usageMetadata) {
          usage = {
            inputTokens: response.usageMetadata.promptTokenCount ?? 0,
            outputTokens: response.usageMetadata.candidatesTokenCount ?? 0,
          };
        }

        return {
          content,
          finishReason,
          usage,
          citations: citations.length > 0 ? citations : undefined,
        };
      } catch (err: unknown) {
        const aiError = mapGeminiError(err);
        lastError = aiError;

        if (attempt === maxRetries || !aiError.retryable) {
          throw aiError;
        }

        const delay = aiError.retryAfterMs ?? Math.min(500 * Math.pow(2, attempt) + Math.random() * 200, 4000);
        await sleepWithSignal(delay, request.signal);
      }
    }

    throw mapGeminiError(lastError);
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
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      const { contents, genConfig } = buildGeminiPayload(config, request);

      const responseStream = await ai.models.generateContentStream({
        model: config.model,
        contents,
        config: genConfig,
      });

      let lastCandidate: unknown = null;
      let lastUsage: { promptTokenCount?: number; candidatesTokenCount?: number } | null = null;

      for await (const chunk of responseStream) {
        if (request.signal?.aborted) {
          yield { type: 'error', error: 'Operation cancelled by caller' };
          return;
        }

        if (chunk.text) {
          yield { type: 'text', text: chunk.text };
        }

        if (chunk.functionCalls && Array.isArray(chunk.functionCalls)) {
          for (const fc of chunk.functionCalls) {
            yield {
              type: 'tool_call',
              name: fc.name || 'unknown_tool',
              args: (fc.args as Record<string, unknown>) || {},
            };
          }
        }

        if (chunk.candidates?.[0]) {
          lastCandidate = chunk.candidates[0];
        }
        if (chunk.usageMetadata) {
          lastUsage = chunk.usageMetadata;
        }
      }

      if (lastUsage) {
        yield {
          type: 'usage',
          inputTokens: lastUsage.promptTokenCount ?? 0,
          outputTokens: lastUsage.candidatesTokenCount ?? 0,
        };
      }

      const finishReason = (lastCandidate as { finishReason?: string })?.finishReason || 'STOP';
      yield {
        type: 'done',
        finishReason,
      };
    } catch (error: unknown) {
      const aiError = mapGeminiError(error);
      yield { type: 'error', error: aiError.message };
    }
  }
}

export const geminiProvider = new GeminiProvider();

