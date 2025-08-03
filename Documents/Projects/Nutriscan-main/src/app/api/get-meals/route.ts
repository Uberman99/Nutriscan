// src/app/api/get-meals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMealLogsByDate } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/get-meals - Starting authentication check');
    console.log('🔍 Request headers:', {
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie') ? 'Present' : 'Missing',
      authorization: request.headers.get('authorization') ? 'Present' : 'Missing'
    });
    
    const user = await currentUser();
    console.log('🔍 Current user result:', { 
      id: user?.id, 
      email: user?.emailAddresses?.[0]?.emailAddress,
      firstName: user?.firstName 
    });
    
    if (!user) {
      console.log('❌ No user found - authentication required');
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in',
        debug: 'No authenticated user found via Clerk'
      }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.id);
    const effectiveUserId = user.id;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ 
        success: false,
        error: 'Date parameter is required',
      }, { status: 400 });
    }

    let meals = [];
    try {
      meals = await getMealLogsByDate(effectiveUserId, date);
    } catch (dbError) {
      console.error('Database error in getMealLogsByDate:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: dbError instanceof Error ? dbError.message : dbError
      }, { status: 500 });
    }
    return NextResponse.json({ success: true, meals });

  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch meals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}