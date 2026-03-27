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

export function middleware(request: NextRequest) {
  const ip = getClientIP(request)

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.sentry.io https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com https://api.hmarepanditji.com",
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
