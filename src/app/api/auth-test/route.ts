// Test endpoint to debug authentication
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [AUTH-TEST] Starting authentication check');
    console.log('🔍 [AUTH-TEST] Request headers:', {
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie') ? 'Present' : 'Missing',
      authorization: request.headers.get('authorization') ? 'Present' : 'Missing',
      'user-agent': request.headers.get('user-agent')?.substring(0, 50) + '...'
    });
    
    const user = await currentUser();
    console.log('🔍 [AUTH-TEST] Current user result:', { 
      id: user?.id, 
      email: user?.emailAddresses?.[0]?.emailAddress,
      firstName: user?.firstName,
      hasUser: !!user
    });
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'No user found',
        debug: {
          hasAuthHeader: !!request.headers.get('authorization'),
          hasCookie: !!request.headers.get('cookie'),
          cookieValue: request.headers.get('cookie')?.substring(0, 100) + '...'
        }
      }, { status: 200 });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName
      }
    });

  } catch (error) {
    console.error('[AUTH-TEST] Error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Authentication check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
