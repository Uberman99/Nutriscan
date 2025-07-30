import { clerkMiddleware } from '@clerk/nextjs/server';

// Use Clerk's middleware directly
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
