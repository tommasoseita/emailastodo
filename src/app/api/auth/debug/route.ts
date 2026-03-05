import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`}/api/auth/callback/google`,
  });
}
