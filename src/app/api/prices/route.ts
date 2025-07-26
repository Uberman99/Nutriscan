import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json({ message: 'This endpoint is not implemented yet.' }, { status: 501 });
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({ message: 'This endpoint is not implemented yet.' }, { status: 501 });
}
