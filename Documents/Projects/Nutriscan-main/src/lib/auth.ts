import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import PgAdapter from "@auth/pg-adapter";
import { Pool } from 'pg';
import type { NextAuthConfig } from 'next-auth';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const config = {
  adapter: PgAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
        }
        return token;
    }
  },
  pages: {
    signIn: '/login', // A custom login page
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
