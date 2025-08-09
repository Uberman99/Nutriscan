// src/app/api/init-db/route.ts
import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/database';

export async function GET() {
  try {
    console.log('Initializing database...');
    const result = await initializeDatabase();
    console.log('Database initialized successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
