// src/app/api/get-meals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMealLogsByDate } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Enforce authentication (must be present)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const effectiveUserId = userId;

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