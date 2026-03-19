import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/identity', 'http://localhost:3000'));
}
