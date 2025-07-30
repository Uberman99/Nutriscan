import { NextRequest, NextResponse } from 'next/server';

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is deprecated. Use /api/scan-food instead.' }, { status: 410 });
}
