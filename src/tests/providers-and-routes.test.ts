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

