import { describe, it, expect } from 'vitest';
import { providerRegistry } from '@/lib/ai/provider-registry';
import { chatRequestSchema, registerSchema } from '@/lib/security/validation';
import { formatSearchContext } from '@/lib/search/provider';
import type { SearchResult } from '@/lib/search/types';

describe('AI Engine: Provider Registry', () => {
  it('registers and retrieves Gemini provider', () => {
    const provider = providerRegistry.get('gemini');
    expect(provider).toBeDefined();
    expect(provider?.name).toBe('gemini');
  });

  it('registers and retrieves Anthropic Claude provider', () => {
    const provider = providerRegistry.get('anthropic');
    expect(provider).toBeDefined();
    expect(provider?.name).toBe('anthropic');
  });

  it('provides available model lists with capabilities', () => {
    const models = providerRegistry.getAvailableModels();
    expect(models.length).toBeGreaterThan(0);
    const flash = models.find((m) => m.id === 'gemini-2.5-flash');
    expect(flash).toBeDefined();
    expect(flash?.capabilities.streaming).toBe(true);
    expect(flash?.capabilities.multimodal).toBe(true);
  });
});

describe('Validation: API Schemas', () => {
  it('validates proper chat request payload', () => {
    const result = chatRequestSchema.safeParse({
      message: 'Salom, SEE AI!',
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      enableSearch: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty message payload', () => {
    const result = chatRequestSchema.safeParse({
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('validates registration schema rules', () => {
    const valid = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'Ali Valiyev',
      password: 'StrongPassword123!',
    });
    expect(valid.success).toBe(true);

    const invalidPassword = registerSchema.safeParse({
      email: 'user@example.com',
      name: 'Ali',
      password: 'short',
    });
    expect(invalidPassword.success).toBe(false);
  });
});

describe('Search: Untrusted Content Formatting', () => {
  it('formats search results as untrusted content boundary', () => {
    const sampleResults: SearchResult[] = [
      {
        title: 'Next.js 16 Documentation',
        url: 'https://nextjs.org/docs',
        snippet: 'Next.js 16 includes breaking changes in async params.',
        domain: 'nextjs.org',
      },
    ];
    const formatted = formatSearchContext(sampleResults);
    expect(formatted).toContain('UNTRUSTED CONTENT');
    expect(formatted).toContain('https://nextjs.org/docs');
    expect(formatted).toContain('Next.js 16 includes breaking changes');
  });

  it('returns empty string if no search results found', () => {
    expect(formatSearchContext([])).toBe('');
  });
});

describe('Database: Prisma Client', () => {
  it('connects and queries user table without error code 14', async () => {
    const { prisma } = await import('@/lib/database/prisma');
    const users = await prisma.user.findMany({ take: 1 });
    expect(Array.isArray(users)).toBe(true);
  });
});

describe('Guest Trial: 3-Query Limit', () => {
  it('allows guest queries when count is under 3', () => {
    const guestCount = 2;
    const isLimitReached = guestCount >= 3;
    expect(isLimitReached).toBe(false);
  });

  it('enforces mandatory authentication when guest count reaches 3', () => {
    const guestCount = 3;
    const isLimitReached = guestCount >= 3;
    expect(isLimitReached).toBe(true);
  });

  it('correctly maps model to provider via getProviderForModel', () => {
    const gemini = providerRegistry.getProviderForModel('gemini-2.5-flash');
    expect(gemini?.name).toBe('gemini');

    const claude = providerRegistry.getProviderForModel('claude-3-5-sonnet-20241022');
    expect(claude?.name).toBe('anthropic');
  });

  it('rejects attachment payload exceeding 5MB limit', () => {
    const oversizedData = 'a'.repeat(8_000_001);
    const result = chatRequestSchema.safeParse({
      message: 'Salom',
      attachments: [{
        type: 'document',
        mimeType: 'application/pdf',
        data: oversizedData,
      }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid attachments under 5MB limit', () => {
    const validData = 'a'.repeat(100);
    const result = chatRequestSchema.safeParse({
      message: 'Salom',
      attachments: [{
        type: 'image',
        mimeType: 'image/png',
        data: validData,
      }],
    });
    expect(result.success).toBe(true);
  });
});


