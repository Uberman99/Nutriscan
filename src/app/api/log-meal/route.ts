// src/app/api/log-meal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveMealLog } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { mealType, foods } = await request.json();

    console.log('Received meal log request:', { mealType, foods });

    if (!mealType || !foods || !Array.isArray(foods) || foods.length === 0) {
      console.error('Invalid request data:', { mealType, foods });
      return NextResponse.json({ error: 'Missing mealType or foods' }, { status: 400 });
    }

    // Enforce authentication (must be present)
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mealLog = await saveMealLog({
      userId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      mealType,
      foods,
    });

    console.log('Meal logged successfully:', mealLog);

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
