import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define all routes that require a user to be logged in to access.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/scan(.*)',
  '/api/log-meal(.*)',
  '/api/get-meals(.*)',
  '/api/clear-meals(.*)',
  '/api/scan-food(.*)', // This critical API route must be protected
]);

// This is the standard Clerk middleware implementation.
// It will automatically protect the routes defined above.
export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth(); // Invoking auth() on a protected route handles the protection logic.
  }
});

export const config = {
  // This matcher ensures the middleware runs on all routes
  // except for static assets and internal Next.js paths.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};