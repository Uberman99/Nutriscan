import { NextRequest, NextResponse } from 'next/server';

// Simple food emoji mapping for images
const foodEmojis: { [key: string]: string } = {
  'apple': '🍎',
  'banana': '🍌',
  'orange': '🍊',
  'cake': '🍰',
  'pizza': '🍕',
  'samosa': '🥟',
  'rasmalai': '🧀',
  'panipuri': '🥟',
  'biryani': '🍛',
  'dosa': '🥞',
  'bread': '🍞',
  'salad': '🥗',
  'burger': '🍔',
  'sandwich': '🥪',
  'noodles': '🍜',
  'cookies': '🍪',
  'rice': '🍚',
  'curry': '🍛',
  'dal': '🍲',
  'default': '🍽️'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const foodName = searchParams.get('food')?.toLowerCase() || '';
  
  // Find matching emoji
  let emoji = foodEmojis['default'];
  for (const [key, value] of Object.entries(foodEmojis)) {
    if (foodName.includes(key)) {
      emoji = value;
      break;
    }
  }
  
  // Create SVG with emoji
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f8fafc" stroke="#e2e8f0" rx="12"/>
      <text x="50" y="60" font-size="40" text-anchor="middle" font-family="system-ui">${emoji}</text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
