import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('hpj_token')?.value
        || request.headers.get('authorization')?.replace('Bearer ', '');

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/onboarding', '/mobile', '/otp', '/register'];
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith('/onboarding/')
    );

    if (!token && !isPublicRoute && !request.nextUrl.pathname.startsWith('/_next')) {
        // Use relative URL for login redirect
        const loginUrl = new URL(
            `/login?redirect=pandit&next=${request.nextUrl.pathname}`,
            request.url
        );
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/onboarding/:path*', '/bookings/:path*',
        '/calendar/:path*', '/earnings/:path*', '/profile/:path*', '/login', '/mobile', '/otp', '/register'],
};
