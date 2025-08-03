import { sql } from '@vercel/postgres';
import { MealLog, NutritionInfo } from './types';

// Enhanced database connection with proper error handling and fallback
async function getDBConnection(): Promise<typeof sql | null> {
  // Check if we have a valid connection string
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString || 
      connectionString.includes('************') || 
      connectionString.includes('your-password-here') ||
      connectionString === 'postgres://default:***@***.***/verceldb?sslmode=require') {
    console.log('🔧 No valid Vercel Postgres connection string found, using mock data');
    return null;
  }

  try {
    // Test the connection
    await sql`SELECT 1`;
    return sql;
  } catch (error) {
    console.warn('📊 Postgres connection failed:', error);
    return null;
  }
}

// This function is used to set up the database schema.
// It should be called from an API route, e.g., /api/init-db
export async function initializeDatabase() {
  const dbSql = await getDBConnection();
  
  if (!dbSql) {
    console.log('🏗️ Database initialization skipped - using mock data for development');
    return { success: true, message: 'Database initialization skipped (development mode)' };
  }

  try {
    // Create meal_logs table
    await dbSql`
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
    await dbSql`CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id_date ON meal_logs (user_id, date);`;
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
  
  const dbSql = await getDBConnection();
  
  if (!dbSql) {
    console.log('💾 Using mock data for meal log (development mode)');
    return {
      id: Date.now().toString(),
      userId,
      date,
      mealType,
      foods,
      createdAt: new Date(),
    };
  }

  try {
    const result = await dbSql`
      INSERT INTO meal_logs (user_id, date, meal_type, foods)
      VALUES (${userId}, ${date}, ${mealType}, ${JSON.stringify(foods)})
      RETURNING id, user_id, date, meal_type, foods, created_at;
    `;
    
    interface DatabaseRow {
      id: string;
      user_id: string;
      date: string;
      meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
      foods: NutritionInfo[];
      created_at: string;
    }
    
    const row = result.rows[0] as DatabaseRow;

    return {
      id: row.id,
      userId: row.user_id,
      date: new Date(row.date).toISOString().split('T')[0],
      mealType: row.meal_type,
      foods: row.foods,
      createdAt: new Date(row.created_at)
    };
  } catch (error) {
    console.warn('📊 Postgres connection failed, using mock data for development:', error);
    return {
      id: Date.now().toString(),
      userId,
      date,
      mealType,
      foods,
      createdAt: new Date(),
    };
  }
}

export async function getMealLogsByDate(userId: string, date: string): Promise<MealLog[]> {
  console.log(`[DB] Attempting to get meal logs for user: ${userId} on date: ${date}`);
  const dbSql = await getDBConnection();
  
  if (!dbSql) {
    console.log('[DB] No database connection. Returning mock data (empty array).');
    return [];
  }

  try {
    console.log('[DB] Executing query to get meal logs.');
    const result = await dbSql`
      SELECT id, user_id, date, meal_type, foods, created_at
      FROM meal_logs
      WHERE user_id = ${userId} AND date = ${date}
      ORDER BY created_at ASC;
    `;
    console.log(`[DB] Found ${result.rows.length} meal logs.`);

    interface DatabaseRow {
      id: string;
      user_id: string;
      date: string;
      meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
      foods: NutritionInfo[];
      created_at: string;
    }

    return result.rows.map((row) => ({
      id: (row as DatabaseRow).id,
      userId: (row as DatabaseRow).user_id,
      date: new Date((row as DatabaseRow).date).toISOString().split('T')[0],
      mealType: (row as DatabaseRow).meal_type,
      foods: (row as DatabaseRow).foods,
      createdAt: new Date((row as DatabaseRow).created_at)
    }));
  } catch (error) {
    console.error('[DB] Error in getMealLogsByDate:', error);
    console.warn('📊 Postgres connection failed, returning empty array for development:', error);
    return [];
  }
}export async function deleteMealLogsByDate(userId: string, date: string): Promise<void> {
  try {
    await sql`
      DELETE FROM meal_logs 
      WHERE user_id = ${userId} AND date = ${date};
    `;
  } catch (error) {
    console.warn('Failed to delete meals from database:', error);
    // Silently fail for development
  }
}

export async function getAllMealLogs(userId: string): Promise<MealLog[]> {
  try {
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
  } catch (error) {
    console.warn('Failed to fetch all meals from database:', error);
    // Return empty array for development
    return [];
  }
}
