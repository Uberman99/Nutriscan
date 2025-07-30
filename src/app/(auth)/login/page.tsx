// src/app/(auth)/login/page.tsx
'use client';

<<<<<<< HEAD
import { useSignIn } from '@clerk/nextjs';
=======
import { signIn } from 'next-auth/react';
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
<<<<<<< HEAD
  const { signIn } = useSignIn();
=======
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to NutriScan</CardTitle>
          <CardDescription>Sign in to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
<<<<<<< HEAD
            onClick={() => signIn({ strategy: 'oauth_google', redirectUrl: '/dashboard' })}
=======
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
