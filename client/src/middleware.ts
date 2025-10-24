import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is simplified - protection handled client-side via AuthContext
// This avoids dependency on @supabase/auth-helpers-nextjs
export async function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
};
