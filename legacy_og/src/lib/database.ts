import { sql } from '@vercel/postgres';
import { MealLog, NutritionInfo } from './types';

// This function is used to set up the database schema.
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        meal_type VARCHAR(50) NOT NULL,
        meal_name VARCHAR(255) NOT NULL, -- Ensure this column exists
        foods JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "meal_logs" is ready.');
    await sql`CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id_date ON meal_logs (user_id, date);`;
    console.log('Indexes are in place.');
    return { success: true, message: 'Database initialized successfully.' };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function saveMealLog(mealLog: Omit<MealLog, 'id' | 'createdAt'>): Promise<MealLog> {
  // Deconstruct all required properties, including the new mealName
  const { userId, date, mealType, mealName, foods } = mealLog;
  
  // *** CRITICAL FIX: Added 'meal_name' to the INSERT statement ***
  const result = await sql`
    INSERT INTO meal_logs (user_id, date, meal_type, meal_name, foods)
    VALUES (${userId}, ${date}, ${mealType}, ${mealName}, ${JSON.stringify(foods)})
    RETURNING id, user_id, date, meal_type, meal_name, foods, created_at;
  `;
  
  const row = result.rows[0];

  return {
    id: row.id.toString(), // Ensure ID is a string for type consistency
    userId: row.user_id,
    date: new Date(row.date).toISOString().split('T')[0],
    mealType: row.meal_type as MealLog['mealType'],
    mealName: row.meal_name, // Return the mealName
    foods: row.foods,
    createdAt: new Date(row.created_at)
  };
}

export async function getMealLogsByDate(userId: string, date: string): Promise<MealLog[]> {
    const result = await sql`
        SELECT id, user_id, date, meal_type, meal_name, foods, created_at 
        FROM meal_logs 
        WHERE user_id = ${userId} AND date = ${date} 
        ORDER BY created_at ASC;
    `;
    
    return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id,
        date: new Date(row.date).toISOString().split('T')[0],
        mealType: row.meal_type as MealLog['mealType'],
        mealName: row.meal_name,
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