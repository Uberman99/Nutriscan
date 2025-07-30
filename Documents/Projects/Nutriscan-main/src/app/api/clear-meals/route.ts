import { NextRequest, NextResponse } from 'next/server'
import { deleteMealLogsByDate } from '@/lib/database'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Enforce authentication (must be present)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const effectiveUserId = userId;

    const { date } = await req.json();
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Invalid date provided' }, { status: 400 });
    }

    await deleteMealLogsByDate(effectiveUserId, date);

    return NextResponse.json({ message: 'Meals for the selected date have been cleared.' });
  } catch (error) {
    console.error('Error clearing meals:', error);
    return NextResponse.json({ error: 'An error occurred while clearing meals.' }, { status: 500 });
  }
}
