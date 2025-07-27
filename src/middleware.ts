import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all API routes that need auth
    "/api/(.*)",
    // Add other routes as needed
  ],
};
