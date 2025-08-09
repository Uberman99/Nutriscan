// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/scan(.*)',
  '/api/log-meal(.*)',
  '/api/get-meals(.*)',
  '/api/clear-meals(.*)',
  // Add any other routes that require a user to be logged in
]);

export default clerkMiddleware(async (auth, req) => {
  // If the requested route matches one of our protected routes,
  // enforce authentication.
  if (isProtectedRoute(req)) {
    await auth();
  }
});

export const config = {
  // This matcher ensures the middleware runs on all routes
  // except for static assets and internal Next.js paths.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};