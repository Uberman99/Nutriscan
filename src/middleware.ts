import { clerkMiddleware } from '@clerk/nextjs/server';

<<<<<<< HEAD
// Use Clerk's middleware directly
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
=======
export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all API routes that need auth
    "/api/(.*)",
    // Add other routes as needed
  ],
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
};
