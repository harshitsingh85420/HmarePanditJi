/**
 * WebOTP API Utility
 * Provides automatic SMS OTP reading on Android Chrome/Edge
 * Falls back to manual input on unsupported browsers
 * 
 * ## SMS Format Documentation
 * 
 * For WebOTP to work correctly, SMS messages MUST follow this format:
 * 
 * ```
 * Your HmarePanditJi OTP is: 123456. Valid for 10 minutes.
 * ```
 * 
 * ### Required Elements:
 * - **6-digit OTP code** (e.g., 123456) - MUST be present
 * - **App identifier** (e.g., "HmarePanditJi") - Helps user identify sender
 * - **Validity period** (e.g., "Valid for 10 minutes") - User guidance
 * 
 * ### Optional Elements (for better UX):
 * - `@domain.com #123456` format for origin-bound OTPs (Chrome requirement)
 * - Example: `Your HmarePanditJi OTP is 123456. @hmarepanditji.com #123456`
 * 
 * ### SMS Gateway Configuration:
 * 
 * For production SMS providers (Twilio, MSG91, etc.), use this template:
 * 
 * ```
 * Your HmarePanditJi OTP is: {OTP}. Valid for 10 minutes. Do not share this code.
 * ```
 * 
 * ### Testing:
 * 
 * For local testing without SMS, use Chrome DevTools:
 * 1. Open DevTools > Application > WebOTP
 * 2. Click "Start WebOTP"
 * 3. Enter test OTP: 123456
 * 
 * ### Browser Support:
 * - ✅ Chrome/Edge on Android 9+
 * - ❌ iOS Safari (manual entry fallback)
 * - ❌ Desktop browsers (manual entry fallback)
 */

interface WebOTPAnalytics {
  supported: boolean
  requested?: number
  success?: { timestamp: number; codePrefix: string }
  timeout?: number
  manualFallback?: number
}

/**
 * Check if WebOTP API is supported
 * Requires: Chrome/Edge on Android with 'credentials' in navigator
 */
export function isWebOTPSupported(): boolean {
  if (typeof window === 'undefined') return false

  // Check for credentials API
  if (!('credentials' in navigator)) return false

  // Check for OTP credential support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!('OTPCredential' in window)) return false

  // Check for Android Chrome/Edge
  const ua = navigator.userAgent.toLowerCase()
  const isAndroid = /android/.test(ua)
  const isChrome = /chrome/.test(ua) && !/edg/.test(ua)
  const isEdge = /edg/.test(ua)

  return isAndroid && (isChrome || isEdge)
}

/**
 * Analytics logger for WebOTP events
 */
function logWebOTPEvent(event: WebOTPAnalytics) {
  // In production, send to analytics service
  console.log('[WebOTP Analytics]', JSON.stringify(event))

  // Example: Send to analytics endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ event: 'webotp', ...event })
  // })
}

/**
 * Extract 6-digit OTP from SMS content
 * Handles various formats: "123456", "A1B2C3", "Your OTP is 123456"
 */
export function extractOTPFromSMS(sms: string): string | null {
  // First try to find exact 6-digit sequence
  const exactMatch = sms.match(/\b(\d{6})\b/)
  if (exactMatch) return exactMatch[1]

  // Try to find 6 consecutive digits anywhere
  const digitMatch = sms.match(/(\d{6})/)
  if (digitMatch) return digitMatch[1]

  // Try alphanumeric codes (e.g., "A1B2C3")
  const alphaNumMatch = sms.match(/\b([A-Za-z0-9]{6})\b/)
  if (alphaNumMatch) return alphaNumMatch[1].toUpperCase()

  return null
}

/**
 * Read OTP automatically using WebOTP API
 * @param timeoutMs - Timeout in milliseconds (default 6000ms)
 * @returns Promise with OTP code or null if failed/timeout
 */
export async function readOTPAuto(timeoutMs = 6000): Promise<string | null> {
  const analytics: WebOTPAnalytics = { supported: isWebOTPSupported() }

  if (!analytics.supported) {
    logWebOTPEvent(analytics)
    return null
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  analytics.requested = Date.now()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credential = await (navigator.credentials as any).get({
      otp: { transport: ['sms'] },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!credential || !credential.code) {
      analytics.timeout = Date.now()
      logWebOTPEvent(analytics)
      return null
    }

    const otp = extractOTPFromSMS(credential.code) ?? credential.code

    analytics.success = {
      timestamp: Date.now(),
      codePrefix: otp.slice(0, 2), // Only log first 2 digits for privacy
    }

    logWebOTPEvent(analytics)
    return otp
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === 'AbortError') {
      analytics.timeout = Date.now()
      console.log('[WebOTP] Timeout - no SMS received')
    } else {
      console.error('[WebOTP] Error reading OTP:', error)
    }

    logWebOTPEvent(analytics)
    return null
  }
}

/**
 * Create abort signal for WebOTP with tab visibility handling
 * Pauses timer when user switches tabs, resumes on return
 */
export function createVisibilityAwareAbortSignal(timeoutMs: number): {
  signal: AbortSignal
  cleanup: () => void
} {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let remainingTime = timeoutMs
  let startTime = Date.now()
  let isPaused = false

  const startTimer = () => {
    startTime = Date.now()
    timeoutId = setTimeout(() => {
      controller.abort()
    }, remainingTime)
  }

  const pauseTimer = () => {
    if (isPaused || !timeoutId) return
    isPaused = true
    if (timeoutId) {
      clearTimeout(timeoutId)
      remainingTime -= Date.now() - startTime
    }
  }

  const resumeTimer = () => {
    if (!isPaused || remainingTime <= 0) return
    isPaused = false
    if (remainingTime > 0) {
      startTimer()
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      pauseTimer()
    } else {
      resumeTimer()
    }
  }

  // Start initial timer
  startTimer()

  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    },
  }
}
