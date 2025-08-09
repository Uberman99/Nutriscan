// Development-only authentication bypass
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { mealType, foods } = await request.json();

    console.log('🧪 [DEV-LOG-MEAL] Development meal logging (bypassing auth)');
    console.log('📝 Meal data:', { mealType, foods });

    if (!mealType || !foods || !Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json({ 
        error: 'Missing mealType or foods' 
      }, { status: 400 });
    }

    // For development: simulate successful meal logging
    const mockMealLog = {
      id: `dev-${Date.now()}`,
      userId: 'dev-user',
      date: new Date().toISOString().split('T')[0],
      mealType,
      foods,
      createdAt: new Date()
    };

    console.log('✅ [DEV-LOG-MEAL] Mock meal logged successfully:', mockMealLog);

    return NextResponse.json({ 
      success: true, 
      message: 'Meal logged successfully (development mode)',
      log: mockMealLog
    });

  } catch (error) {
    console.error('❌ [DEV-LOG-MEAL] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to log meal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
