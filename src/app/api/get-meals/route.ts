// src/app/api/get-meals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMealLogsByDate } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Use demo user if no auth user is available
    const effectiveUserId = userId || 'demo-user-123';

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ 
        success: false,
        error: 'Date parameter is required',
      }, { status: 400 });
    }

    console.log(`Fetching meals for date: ${date} user: ${effectiveUserId}`);
    const meals = await getMealLogsByDate(effectiveUserId, date);
    console.log(`Found meals: ${meals.length}`);
    
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
