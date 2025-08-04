// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';

export default function customClerkMiddleware(req: NextRequest, ev: NextFetchEvent) {
  console.log(`Middleware applied to route: ${req.url}`);
  if (req.url.includes('_not-found')) {
    console.log('Skipping middleware for _not-found route');
    return;
  }
  return clerkMiddleware()(req, ev);
}

export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next|_not-found).*)', '/', '/(api|trpc)(.*)'],
};