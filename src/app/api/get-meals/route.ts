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
    
    let user;
    let effectiveUserId;
    
    try {
      user = await currentUser();
      console.log('🔍 Current user result:', { 
        id: user?.id, 
        email: user?.emailAddresses?.[0]?.emailAddress,
        firstName: user?.firstName 
      });
      effectiveUserId = user?.id;
    } catch (error) {
      console.log('⚠️ Clerk authentication failed, using development mode:', error instanceof Error ? error.message : 'Unknown error');
      effectiveUserId = 'dev-user-123';
    }
    
    if (!effectiveUserId) {
      console.log('❌ No user found - authentication required');
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in',
        debug: 'No authenticated user found'
      }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', effectiveUserId);

    const { searchParams } = new URL(request.url);
    let date = searchParams.get('date');
    
    // If no date is provided or it's empty, use today's date
    if (!date || date.trim() === '') {
      date = new Date().toISOString().split('T')[0];
      console.log('📅 No date provided, using today:', date);
    }
    
    console.log('📅 Using date for meal fetch:', date);

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