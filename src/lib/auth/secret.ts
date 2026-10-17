import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, appSecrets } from '@db';

let cached: Promise<string> | null = null;

/**
 * Returns the Auth.js signing secret. Uses AUTH_SECRET when configured;
 * otherwise generates one on first use and persists it in the database so
 * every function instance signs and verifies sessions with the same key.
 */
export function getAuthSecret(): Promise<string> {
  if (process.env.AUTH_SECRET) return Promise.resolve(process.env.AUTH_SECRET);

  cached ??= (async () => {
    await db
      .insert(appSecrets)
      .values({ name: 'auth_secret', value: randomBytes(32).toString('base64') })
      .onConflictDoNothing();
    const [row] = await db
      .select({ value: appSecrets.value })
      .from(appSecrets)
      .where(eq(appSecrets.name, 'auth_secret'))
      .limit(1);
    return row.value;
  })().catch((err) => {
    cached = null;
    throw err;
  });

  return cached;
}
