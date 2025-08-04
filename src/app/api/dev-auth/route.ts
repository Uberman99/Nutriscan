// Development authentication bypass
import { NextResponse } from 'next/server';

export async function GET() {
  // Return a mock authenticated user for development
  return NextResponse.json({ 
    authenticated: true,
    user: {
      id: 'dev-user-123',
      email: 'dev@nutriscan.app',
      firstName: 'Development'
    },
    message: 'Development authentication bypass active'
  });
}

export async function POST() {
  // Same as GET for consistency
  return NextResponse.json({ 
    authenticated: true,
    user: {
      id: 'dev-user-123',
      email: 'dev@nutriscan.app',
      firstName: 'Development'
    },
    message: 'Development authentication bypass active'
  });
}
