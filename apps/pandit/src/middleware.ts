import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,
  window: 60, // seconds
}

// Simple in-memory store (use Redis in production)
const requestStore = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded
    ? (forwarded as string).split(',')[0].trim()
    : request.ip || '127.0.0.1'
  return ip
}

function rateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const record = requestStore.get(ip)

  if (!record || now > record.resetTime) {
    requestStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.window * 1000,
    })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT.requests) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true }
}

// Cookie-gated routes (the login flow sets hpj_token on verify). The
// redirect carries ?next= so the pandit lands EXACTLY where he tapped
// after the gentle re-OTP — never a silent identity ambush.
const PROTECTED_PREFIXES = ['/dashboard', '/bookings', '/calendar', '/earnings', '/profile']

export function middleware(request: NextRequest) {
  const ip = getClientIP(request)

  // F4 auth gate (merged from the old root middleware so the security
  // headers below stay active — Next.js loads only ONE middleware file)
  const path = request.nextUrl.pathname
  if (PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    const token = request.cookies.get('hpj_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      const loginUrl = new URL(`/login?next=${encodeURIComponent(path)}`, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const result = rateLimit(ip)

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: result.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.requests.toString(),
            'X-RateLimit-Reset': result.resetTime!.toString(),
          },
        }
      )
    }
  }

  // Security headers for all responses
  const response = NextResponse.next()

  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // TODO: Move to nonce-based CSP. 'strict-dynamic' was declared here without
      // implementing nonces, which blocked ALL Next.js hydration scripts in
      // production. 'unsafe-inline'/'unsafe-eval' keep the app working until
      // nonces are wired through.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      // nominatim: LocationPermissionScreen reverse-geocodes there; without it
      // the CSP silently breaks the location grant path. localhost:3001 is the
      // dev API (NEXT_PUBLIC_API_URL fallback) — dev builds only.
      "connect-src 'self' https://nominatim.openstreetmap.org" +
        (process.env.NODE_ENV !== 'production' ? " http://localhost:3001 http://127.0.0.1:3001" : "") +
        " https://*.sentry.io https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com https://api.hmarepanditji.com https://hmarepanditji.onrender.com https://api.deepgram.com wss://api.deepgram.com",
      "media-src 'self' blob: data:",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
}
