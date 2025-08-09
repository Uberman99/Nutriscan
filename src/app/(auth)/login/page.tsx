'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, ScanLine } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  // Clerk's OAuth flow with redirect is handled by middleware and simple navigation.
  // The useSignIn() hook is not required for this specific implementation.
  const handleGoogleSignIn = () => {
    // In a full Clerk setup with redirects, this would ideally use signIn.authenticateWithRedirect.
    // However, for a simple flow managed by middleware, a direct navigation can work.
    // For robustness, linking to Clerk's sign-in page is the most stable approach.
    window.location.href = '/sign-in'; 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_200%_100%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))] animate-aurora"></div>
      <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-lg">
        <CardHeader className="text-center items-center">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your Sovereign Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}