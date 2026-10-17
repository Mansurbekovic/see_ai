// =============================================================================
// SEE AI — Environment Configuration & Validation
// =============================================================================
// Validates all environment variables at startup, providing clear error messages
// for missing required configuration.
// =============================================================================

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required. Set a PostgreSQL connection string.'),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(1, 'AUTH_SECRET is required. Generate with: openssl rand -base64 32'),
  AUTH_URL: z.string().url().optional().default('http://localhost:3000'),

  // Google OAuth (optional)
  AUTH_GOOGLE_ID: z.string().optional().default(''),
  AUTH_GOOGLE_SECRET: z.string().optional().default(''),

  // AI Providers
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().optional().default('gemini-2.5-flash'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().optional().default('claude-sonnet-4-20250514'),

  // Web Search
  WEB_SEARCH_PROVIDER: z
    .enum(['google', 'brave', 'serpapi', ''])
    .optional()
    .default(''),
  WEB_SEARCH_API_KEY: z.string().optional().default(''),

  // Application
  MAX_UPLOAD_SIZE: z.coerce.number().optional().default(10_485_760), // 10MB
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .optional()
    .default('info'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _env: EnvConfig | null = null;

/**
 * Validates and returns the current environment configuration.
 * Throws a descriptive error on first call if required variables are missing.
 * Cached after first successful validation.
 */
export function getEnv(): EnvConfig {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ❌ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n\n🔴 SEE AI — Environment Configuration Error:\n${errors}\n\nCopy .env.example to .env.local and fill in required values.\n`
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Check if a specific AI provider is configured.
 */
export function isProviderConfigured(provider: 'gemini' | 'anthropic'): boolean {
  const env = getEnv();
  switch (provider) {
    case 'gemini':
      return env.GEMINI_API_KEY.length > 0;
    case 'anthropic':
      return env.ANTHROPIC_API_KEY.length > 0;
  }
}

/**
 * Check if Google OAuth is configured.
 */
export function isGoogleOAuthConfigured(): boolean {
  const env = getEnv();
  return env.AUTH_GOOGLE_ID.length > 0 && env.AUTH_GOOGLE_SECRET.length > 0;
}

/**
 * Check if web search is configured.
 */
export function isSearchConfigured(): boolean {
  const env = getEnv();
  return env.WEB_SEARCH_PROVIDER.length > 0;
}
