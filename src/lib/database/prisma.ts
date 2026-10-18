import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function resolveDatabaseUrl(): string {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      const bundledDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(bundledDb)) {
        try {
          fs.copyFileSync(bundledDb, tmpDbPath);
          console.log('[Database] Initialized dev.db in serverless tmp directory');
        } catch (err) {
          console.error('[Database] Failed to copy bundled dev.db to tmp:', err);
        }
      } else {
        const publicDb = path.join(process.cwd(), 'public', 'dev.db');
        if (fs.existsSync(publicDb)) {
          try {
            fs.copyFileSync(publicDb, tmpDbPath);
            console.log('[Database] Initialized dev.db from public to serverless tmp directory');
          } catch (err) {
            console.error('[Database] Failed to copy public dev.db to tmp:', err);
          }
        }
      }
    }

    return 'file:' + tmpDbPath.replace(/\\/g, '/');
  }

  // Local development
  const raw = process.env.DATABASE_URL || 'file:./dev.db';
  if (raw.startsWith('file:./') || raw.startsWith('file:../')) {
    const rel = raw.replace('file:', '');
    const inPrisma = path.join(process.cwd(), 'prisma', rel);
    if (fs.existsSync(inPrisma)) {
      return 'file:' + inPrisma.replace(/\\/g, '/');
    }
    const inCwd = path.join(/*turbopackIgnore: true*/ process.cwd(), rel);
    return 'file:' + inCwd.replace(/\\/g, '/');
  }

  return raw;
}

const activeUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

