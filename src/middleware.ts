// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Add routes that can be accessed while signed out
  // The scan page and its API should NOT be public.
  publicRoutes: [
    '/',
    '/about',
    '/blog/(.*)',
  ],

  // Add routes that can be accessed while signed out
  // and will not be clerk-loaded
  ignoredRoutes: [],
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets and internal Next.js paths.
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};