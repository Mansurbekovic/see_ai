import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, users } from '@db';
import { getAuthSecret } from '@/lib/auth/secret';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: Provider[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const parsedCredentials = credentialsSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const { email, password } = parsedCredentials.data;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

      if (!user || !user.passwordHash) {
        return null;
      }

      const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordsMatch) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
  secret: await getAuthSecret(),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // OAuth sign-ins: map the provider profile to a local user row by email
      if (account && account.provider !== 'credentials' && user?.email) {
        const email = user.email.toLowerCase().trim();
        const [dbUser] = await db
          .insert(users)
          .values({
            email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
          })
          .onConflictDoUpdate({
            target: users.email,
            set: { image: user.image, updatedAt: new Date() },
          })
          .returning({ id: users.id });
        token.id = dbUser.id;
      } else if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}));
