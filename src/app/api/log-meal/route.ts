// src/app/api/log-meal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveMealLog } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Enforce authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const { mealType, foods } = await request.json();

    console.log('Received meal log request:', { mealType, foods, userId: user.id });

    if (!mealType || !foods || !Array.isArray(foods) || foods.length === 0) {
      console.error('Invalid request data:', { mealType, foods });
      return NextResponse.json({ error: 'Missing mealType or foods' }, { status: 400 });
    }

    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 Logging meal with date:', todayDate);
    
    const mealLog = await saveMealLog({
      userId: user.id, // Use real Clerk user ID
      date: todayDate,
      mealType,
      foods,
    });

    console.log('Meal logged successfully for user:', user.id, mealLog);

    return NextResponse.json({ 
      success: true, 
      message: 'Meal logged successfully',
      log: mealLog
    });

  } catch (error) {
    console.error('Error logging meal:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to log meal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
