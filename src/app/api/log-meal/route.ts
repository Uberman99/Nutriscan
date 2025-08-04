// src/app/api/log-meal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveMealLog } from '@/lib/database';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Try Clerk authentication, fallback to development mode
    let user;
    let effectiveUserId;
    
    try {
      user = await currentUser();
      effectiveUserId = user?.id;
    } catch (error) {
      console.log('⚠️ Clerk authentication failed, using development mode:', error instanceof Error ? error.message : 'Unknown error');
      effectiveUserId = 'dev-user-123';
    }
    
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const { mealType, foods } = await request.json();

    console.log('Received meal log request:', { mealType, foods, userId: effectiveUserId });

    // Validate mealType and foods
    if (!mealType || typeof mealType !== 'string') {
      console.error('Invalid mealType:', mealType);
      return NextResponse.json({ error: 'Invalid mealType' }, { status: 400 });
    }

    // Enforce strict validation for mealType
    const allowedMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!allowedMealTypes.includes(mealType)) {
      console.error('Invalid mealType received:', mealType);
      return NextResponse.json({ error: `Invalid mealType. Allowed values are: ${allowedMealTypes.join(', ')}` }, { status: 400 });
    }

    if (!Array.isArray(foods) || foods.some(food => typeof food !== 'object')) {
      console.error('Invalid foods array:', foods);
      return NextResponse.json({ error: 'Invalid foods array' }, { status: 400 });
    }

    // Log request details for debugging
    console.log('Logging meal with details:', { mealType, foods, userId: effectiveUserId });

    // Log the received mealType for debugging
    console.log('Received mealType:', mealType);

    // Use consistent date format to avoid timezone issues
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayDate = getTodayDate();
    console.log('📅 Logging meal with date:', todayDate);
    
    // Cast mealType to the expected type after validation
    const validatedMealType = mealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

    const mealLog = await saveMealLog({
      userId: effectiveUserId, // Use effective user ID (real or dev)
      date: todayDate,
      mealType: validatedMealType,
      foods,
    });

    console.log('Meal logged successfully for user:', effectiveUserId, mealLog);

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
