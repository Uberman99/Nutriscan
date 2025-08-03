// src/app/api/multi-food-recognition/route.ts
import { NextResponse } from 'next/server';

// This endpoint is permanently deprecated in favor of the unified /api/scan-food route.
export async function POST() {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. Use /api/scan-food instead.' 
  }, { 
    status: 410 // Gone
  });
}