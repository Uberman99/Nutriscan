// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { VercelPostgresAdapter } from "@auth/vercel-postgres"
import { db } from './db';

export const authOptions: NextAuthOptions = {
  adapter: VercelPostgresAdapter(db.query),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers like GitHub, Apple, etc. if needed
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
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
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (e.g. check your email)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in
  },
};
