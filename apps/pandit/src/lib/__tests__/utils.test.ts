import { describe, it, expect } from 'vitest'
import {
  normalizeNumberInput,
  normalizeOtpInput,
  formatMobileNumber,
  formatOTP,
  cn,
} from '../utils'

describe('normalizeNumberInput', () => {
  it('should convert Hindi number words to digits', () => {
    expect(normalizeNumberInput('एक दो तीन')).toBe('123')
  })

  it('should convert English number words to digits', () => {
    expect(normalizeNumberInput('one two three')).toBe('123')
  })

  it('should convert transliterated Hindi to digits', () => {
    expect(normalizeNumberInput('ek do teen')).toBe('123')
  })

  it('should strip "mera number" preamble', () => {
    expect(normalizeNumberInput('mera number एक दो तीन')).toBe('123')
  })

  it('should strip "hamara number" preamble', () => {
    expect(normalizeNumberInput('hamara number नौ आठ सात')).toBe('987')
  })

  it('should strip +91 country code', () => {
    expect(normalizeNumberInput('+91 9876543210')).toBe('9876543210')
  })

  it('should strip 91 country code', () => {
    expect(normalizeNumberInput('91 9876543210')).toBe('9876543210')
  })

  it('should strip "plus 91" country code', () => {
    expect(normalizeNumberInput('plus 91 9876543210')).toBe('9876543210')
  })

  it('should return 10 digit number as is', () => {
    expect(normalizeNumberInput('9876543210')).toBe('9876543210')
  })

  it('should strip country code from 12 digit number', () => {
    expect(normalizeNumberInput('919876543210')).toBe('9876543210')
  })

  it('should handle mixed Hindi-English', () => {
    expect(normalizeNumberInput('ek दो three')).toBe('123')
  })

  it('should handle empty string', () => {
    expect(normalizeNumberInput('')).toBe('')
  })

  it('should handle whitespace only', () => {
    expect(normalizeNumberInput('   ')).toBe('')
  })

  it('should handle multiple spaces between words', () => {
    expect(normalizeNumberInput('एक    दो      तीन')).toBe('123')
  })
})

describe('normalizeOtpInput', () => {
  it('should convert Hindi OTP words to digits', () => {
    expect(normalizeOtpInput('एक दो तीन चार पांच छह')).toBe('123456')
  })

  it('should convert English OTP words to digits', () => {
    expect(normalizeOtpInput('one two three four five six')).toBe('123456')
  })

  it('should strip "OTP" preamble', () => {
    expect(normalizeOtpInput('OTP एक दो तीन चार')).toBe('1234')
  })

  it('should strip "mera otp" preamble', () => {
    expect(normalizeOtpInput('mera otp एक दो तीन')).toBe('123')
  })

  it('should strip "code" preamble', () => {
    expect(normalizeOtpInput('code 123456')).toBe('123456')
  })

  it('should strip "verification code" preamble', () => {
    expect(normalizeOtpInput('verification code एक दो तीन')).toBe('123')
  })

  it('should handle numeric OTP', () => {
    expect(normalizeOtpInput('123456')).toBe('123456')
  })

  it('should handle empty string', () => {
    expect(normalizeOtpInput('')).toBe('')
  })

  it('should handle mixed digits and words', () => {
    expect(normalizeOtpInput('12 तीन 45 छह')).toBe('123456')
  })
})

describe('formatMobileNumber', () => {
  it('should format 10-digit number with space', () => {
    expect(formatMobileNumber('9876543210')).toBe('98765 43210')
  })

  it('should not format less than 10 digits', () => {
    expect(formatMobileNumber('98765')).toBe('98765')
  })

  it('should not format more than 10 digits', () => {
    expect(formatMobileNumber('9876543210123')).toBe('9876543210123')
  })

  it('should clean special characters before formatting', () => {
    expect(formatMobileNumber('98765-43210')).toBe('98765 43210')
  })

  it('should handle empty string', () => {
    expect(formatMobileNumber('')).toBe('')
  })

  it('should handle numbers with spaces', () => {
    expect(formatMobileNumber('98765 43210')).toBe('98765 43210')
  })

  it('should handle numbers with dashes', () => {
    expect(formatMobileNumber('98765-43210')).toBe('98765 43210')
  })

  it('should handle numbers with dots', () => {
    expect(formatMobileNumber('98765.43210')).toBe('98765 43210')
  })
})

describe('formatOTP', () => {
  it('should format 6-digit OTP with space', () => {
    expect(formatOTP('123456')).toBe('123 456')
  })

  it('should not format less than 6 digits', () => {
    expect(formatOTP('123')).toBe('123')
  })

  it('should not format more than 6 digits', () => {
    expect(formatOTP('123456789')).toBe('123456789')
  })

  it('should clean special characters before formatting', () => {
    expect(formatOTP('123-456')).toBe('123 456')
  })

  it('should handle empty string', () => {
    expect(formatOTP('')).toBe('')
  })

  it('should handle OTP with spaces', () => {
    expect(formatOTP('123 456')).toBe('123 456')
  })

  it('should handle OTP with dashes', () => {
    expect(formatOTP('123-456')).toBe('123 456')
  })

  it('should handle OTP with dots', () => {
    expect(formatOTP('123.456')).toBe('123 456')
  })
})

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes with clsx', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
  })

  it('should handle Tailwind class merging', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle null and undefined', () => {
    expect(cn('foo', null, undefined, 'bar')).toBe('foo bar')
  })

  it('should handle array input', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle object input', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })
})
