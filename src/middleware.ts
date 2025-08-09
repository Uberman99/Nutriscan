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

export default clerkMiddleware((auth, req) => {
  // If the requested route matches one of our protected routes,
  // enforce authentication by calling auth().protect().
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // This matcher ensures the middleware runs on all routes
  // except for static assets and internal Next.js paths.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};