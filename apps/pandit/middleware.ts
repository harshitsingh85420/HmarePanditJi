import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('hpj_token')?.value
        || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        // If we're already on a public route, don't redirect
        if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/_next')) {
            return NextResponse.next();
        }

        const loginUrl = new URL(
            `http://localhost:3000/login?redirect=pandit&next=${request.nextUrl.pathname}`
        );
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/onboarding/:path*', '/bookings/:path*',
        '/calendar/:path*', '/earnings/:path*', '/profile/:path*'],
};
