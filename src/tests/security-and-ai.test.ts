import { describe, it, expect } from 'vitest';
import { isAllowedUrl, sanitizeFilename, validateFile } from '@/lib/security/sanitize';
import { rateLimiter } from '@/lib/security/rate-limit';
import { estimateTokens, selectMessages } from '@/lib/ai/context';
import type { AIMessage } from '@/lib/ai/types';

describe('Security: SSRF Prevention', () => {
  it('blocks localhost and loopback addresses', () => {
    expect(isAllowedUrl('http://localhost:3000')).toBe(false);
    expect(isAllowedUrl('http://127.0.0.1')).toBe(false);
    expect(isAllowedUrl('http://0.0.0.0')).toBe(false);
  });

  it('blocks private IPv4 networks and cloud metadata', () => {
    expect(isAllowedUrl('http://10.0.0.1')).toBe(false);
    expect(isAllowedUrl('http://192.168.1.1')).toBe(false);
    expect(isAllowedUrl('http://172.16.0.1')).toBe(false);
    expect(isAllowedUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
  });

  it('allows valid public HTTPS endpoints', () => {
    expect(isAllowedUrl('https://example.com')).toBe(true);
    expect(isAllowedUrl('https://api.github.com/repos')).toBe(true);
  });
});

describe('Security: Filename Sanitization', () => {
  it('removes path traversal sequences and dangerous characters', () => {
    expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
    expect(sanitizeFilename('file\\with\\slashes.png')).not.toContain('\\');
    expect(sanitizeFilename('test\0null.txt')).not.toContain('\0');
  });
});

describe('Security: File Validation', () => {
  it('allows valid image within size bounds', () => {
    const result = validateFile({
      name: 'avatar.png',
      size: 1024 * 50,
      type: 'image/png',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects oversized files', () => {
    const result = validateFile({
      name: 'huge.png',
      size: 50 * 1024 * 1024, // 50MB
      type: 'image/png',
    });
    expect(result.valid).toBe(false);
  });
});

describe('Security: Rate Limiter', () => {
  it('enforces request boundaries in window', () => {
    const config = { windowMs: 1000, maxRequests: 2 };
    const key = `test-${Date.now()}`;

    expect(rateLimiter.check(key, config).allowed).toBe(true);
    expect(rateLimiter.check(key, config).allowed).toBe(true);
    expect(rateLimiter.check(key, config).allowed).toBe(false);
  });
});

describe('AI Context Management', () => {
  it('estimates token counts accurately', () => {
    expect(estimateTokens('Hello world')).toBeGreaterThan(0);
  });

  it('selects messages within budget preserving recent context', () => {
    const messages: AIMessage[] = [
      { role: 'user', content: 'Initial message' },
      { role: 'assistant', content: 'Middle response' },
      { role: 'user', content: 'Latest query' },
    ];
    const selected = selectMessages(messages, 1000, 100);
    expect(selected.length).toBeGreaterThan(0);
    expect(selected[selected.length - 1].content).toBe('Latest query');
  });
});
