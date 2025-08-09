import { sql } from '@vercel/postgres';
import { MealLog } from './types';

// Define the schema for food logging
export async function setupDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      image TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS meal_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id),
      date DATE NOT NULL,
      meal_type VARCHAR(50) NOT NULL,
      foods JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('Database setup complete');
}

export const db = {
  query: sql,
  async logMeal(mealLog: Omit<MealLog, 'id' | 'createdAt'>) {
    const { userId, date, mealType, foods } = mealLog;
    const result = await sql`
      INSERT INTO meal_logs (user_id, date, meal_type, foods)
      VALUES (${userId}, ${date}, ${mealType}, ${JSON.stringify(foods)})
      RETURNING *;
    `;
    return result.rows[0];
  },
  async getMeals(userId: string, date: string): Promise<MealLog[]> {
    const result = await sql`
      SELECT id, user_id as "userId", date, meal_type as "mealType", foods, created_at as "createdAt"
      FROM meal_logs
      WHERE user_id = ${userId} AND date = ${date}
      ORDER BY created_at ASC;
    `;
    return result.rows as MealLog[];
  }
};

