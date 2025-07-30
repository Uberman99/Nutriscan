import { sql } from '@vercel/postgres';
import { MealLog, NutritionInfo } from './types';

// This function is used to set up the database schema.
// It should be called from an API route, e.g., /api/init-db
export async function initializeDatabase() {
  try {
    // Create meal_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        meal_type VARCHAR(50) NOT NULL,
        foods JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "meal_logs" is ready.');

    // Add indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id_date ON meal_logs (user_id, date);`;
    console.log('Indexes are in place.');

    return { success: true, message: 'Database initialized successfully.' };
  } catch (error) {
    console.error('Database initialization error:', error);
    // Throw the error to be caught by the API route
    throw error;
  }
}

export async function saveMealLog(mealLog: Omit<MealLog, 'id' | 'createdAt'>): Promise<MealLog> {
  const { userId, date, mealType, foods } = mealLog;
  
  const result = await sql`
    INSERT INTO meal_logs (user_id, date, meal_type, foods)
    VALUES (${userId}, ${date}, ${mealType}, ${JSON.stringify(foods)})
    RETURNING id, user_id, date, meal_type, foods, created_at;
  `;
  
  const row = result.rows[0];

  return {
    id: row.id,
    userId: row.user_id,
    date: new Date(row.date).toISOString().split('T')[0],
    mealType: row.meal_type,
    foods: row.foods,
    createdAt: new Date(row.created_at)
  };
}

export async function getMealLogsByDate(userId: string, date: string): Promise<MealLog[]> {
  const result = await sql`
    SELECT id, user_id, date, meal_type, foods, created_at 
    FROM meal_logs 
    WHERE user_id = ${userId} AND date = ${date} 
    ORDER BY created_at ASC;
  `;
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    date: new Date(row.date).toISOString().split('T')[0],
    mealType: row.meal_type as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    foods: row.foods as NutritionInfo[],
    createdAt: new Date(row.created_at)
  }));
}

export async function deleteMealLogsByDate(userId: string, date: string): Promise<void> {
  await sql`
    DELETE FROM meal_logs 
    WHERE user_id = ${userId} AND date = ${date};
  `;
}

export async function getAllMealLogs(userId: string): Promise<MealLog[]> {
  const result = await sql`
    SELECT id, user_id, date, meal_type, foods, created_at 
    FROM meal_logs 
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC;
  `;
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    date: new Date(row.date).toISOString().split('T')[0],
    mealType: row.meal_type as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    foods: row.foods as NutritionInfo[],
    createdAt: new Date(row.created_at)
  }));
}
