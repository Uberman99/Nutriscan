// src/app/api/get-meals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMealLogsByDate } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
<<<<<<< HEAD
    // Enforce authentication (must be present)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const effectiveUserId = userId;
=======
    // Use demo user if no auth user is available
    const effectiveUserId = userId || 'demo-user-123';
>>>>>>> 248da69a8d9281c86ca4da4f6f5c83429d127f98

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ 
        success: false,
        error: 'Date parameter is required',
      }, { status: 400 });
    }

    console.log(`Fetching meals for date: ${date} user: ${effectiveUserId}`);
    let meals = [];
    try {
      meals = await getMealLogsByDate(effectiveUserId, date);
      if (Array.isArray(meals)) {
        console.log(`Found meals: ${meals.length}`);
      } else {
        console.warn('getMealLogsByDate did not return an array:', meals);
      }
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
