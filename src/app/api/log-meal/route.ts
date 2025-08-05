// src/app/api/log-meal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveMealLog } from '@/lib/database';
import { getFoodConfidenceScore, isValidFoodItem } from '@/lib/non-food-items';
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

    // Filter foods using heuristics, confidence, and name checks (no hardcoded exclusions)
    let filteredInputFoods = Array.isArray(foods)
      ? foods.filter(food => {
          const normalizedName = (food?.name || '').trim().toLowerCase();
          // Exclude empty or non-string names
          if (!food.name || typeof food.name !== 'string' || food.name.trim() === '') return false;
          // Exclude very short or very long names (likely noise)
          if (normalizedName.length < 3 || normalizedName.length > 40) return false;
          // Exclude if not a valid food item by heuristics
          if (!isValidFoodItem(normalizedName)) return false;
          // Exclude if confidence score is too low
          if (getFoodConfidenceScore(normalizedName) <= 0.6) return false;
          return true;
        })
      : [];

    // If all foods are filtered out, allow the highest-confidence original food item through (fallback)
    if (filteredInputFoods.length === 0 && Array.isArray(foods) && foods.length > 0) {
      // Pick the food with the highest confidence score
      const scored = foods
        .filter(food => food && typeof food.name === 'string' && food.name.trim() !== '')
        .map(food => ({
          ...food,
          _score: getFoodConfidenceScore((food.name || '').trim().toLowerCase())
        }));
      if (scored.length > 0) {
        scored.sort((a, b) => b._score - a._score);
        filteredInputFoods = [scored[0]];
      }
    }

    // Do NOT force muffins/keikitos through if all foods are filtered out

    console.log('Received meal log request:', { mealType, foods: filteredInputFoods, userId: effectiveUserId });

    // Validate mealType and foods
    if (!mealType || typeof mealType !== 'string') {
      console.error('Invalid mealType:', mealType);
      return NextResponse.json({ error: 'Invalid mealType' }, { status: 400 });
    }

    // Enforce strict validation for mealType
    const allowedMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    // Normalize mealType to handle case-insensitive comparisons
    const normalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();

    if (!allowedMealTypes.includes(normalizedMealType)) {
      console.error('Invalid mealType received:', normalizedMealType);
      return NextResponse.json({ error: `Invalid mealType. Allowed values are: ${allowedMealTypes.join(', ')}` }, { status: 400 });
    }

    // Add validation to ensure food names are trimmed and non-empty
    if (!Array.isArray(filteredInputFoods) || filteredInputFoods.length === 0 || filteredInputFoods.some(food => !food.name || typeof food.name !== 'string' || food.name.trim() === '')) {
      const filteredNames = Array.isArray(foods) ? foods.map(f => f.name).join(', ') : '';
      console.error('Invalid foods array after filtering. Original foods:', filteredNames, 'Filtered:', filteredInputFoods);
      return NextResponse.json({ error: 'Invalid foods array. Each food item must have a non-empty name. Original: ' + filteredNames + '. Filtered: ' + filteredInputFoods.map(f => f.name).join(', ') }, { status: 400 });
    }

    // Log request details for debugging
    console.log('Logging meal with details:', { mealType, foods: filteredInputFoods, userId: effectiveUserId });

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
    const validatedMealType = normalizedMealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

    // Enhance food scanning accuracy by filtering and ranking detected items
    const enhancedFoods = filteredInputFoods
      .map(food => {
        const normalizedName = food.name.trim().toLowerCase();
        const confidenceScore = getFoodConfidenceScore(normalizedName);
        return { ...food, confidenceScore };
      })
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      // Only keep foods with a valid, non-empty name and at least one other property
      .filter(food => {
        if (!food.name || typeof food.name !== 'string' || food.name.trim() === '') return false;
        // At least one other property besides name and confidenceScore
        const keys = Object.keys(food).filter(k => k !== 'name' && k !== 'confidenceScore');
        return keys.length > 0 && keys.some(k => food[k] !== null && food[k] !== undefined && food[k] !== '');
      });

    if (enhancedFoods.length === 0) {
      console.error('No valid foods to log after filtering.');
      return NextResponse.json({ error: 'No valid foods to log after filtering.' }, { status: 400 });
    }

    const mealLog = await saveMealLog({
      userId: effectiveUserId, // Use effective user ID (real or dev)
      date: todayDate,
      mealType: validatedMealType,
      foods: enhancedFoods,
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
