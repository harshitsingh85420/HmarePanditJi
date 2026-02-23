import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware (Prompt 1 Section 3)
 * - Protected routes: /dashboard/*, /onboarding/*, /bookings/*, /calendar/*, /earnings/*, /profile/*
 * - No token → redirect to http://localhost:3000/login?redirect=pandit&next=${path}
 * - Token exists but onboardingComplete === false → redirect to /onboarding?step=<lastCompletedStep+1>
 * - Token exists, onboarding complete, but verificationStatus !== 'VERIFIED' → allow dashboard (pending banner shown in component)
 * - Token exists and role === 'ADMIN' → redirect to localhost:3003
 */
export function middleware(request: NextRequest) {
    // Skip static assets and API routes
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/icons') ||
        request.nextUrl.pathname === '/manifest.json' ||
        request.nextUrl.pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('hpj_token')?.value
        || request.cookies.get('hpj_pandit_token')?.value
        || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        // If we're already on a public route, don't redirect
        if (
            request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/auth' ||
            request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/auth')
        ) {
            return NextResponse.next();
        }

        const loginUrl = new URL(
            `http://localhost:3000/login?redirect=pandit&next=${encodeURIComponent(request.nextUrl.pathname)}`
        );
        return NextResponse.redirect(loginUrl);
    }

    // Try to decode JWT to check role and onboarding status
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );

        // If ADMIN role, redirect to admin portal
        if (payload.role === 'ADMIN') {
            return NextResponse.redirect(new URL('http://localhost:3003'));
        }

        // If onboarding not complete and not already on /onboarding
        if (
            payload.onboardingComplete === false &&
            !request.nextUrl.pathname.startsWith('/onboarding')
        ) {
            const lastStep = payload.lastCompletedStep || 0;
            return NextResponse.redirect(
                new URL(`/onboarding?step=${lastStep + 1}`, request.url)
            );
        }
    } catch {
        // If token parsing fails, allow through (auth will be checked by API)
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/onboarding/:path*',
        '/bookings/:path*',
        '/calendar/:path*',
        '/earnings/:path*',
        '/profile/:path*',
    ],
};
