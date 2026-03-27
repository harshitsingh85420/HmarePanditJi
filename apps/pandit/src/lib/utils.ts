import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hindi number word mappings (includes Bhojpuri and Maithili variants)
export const NUMBER_WORDS: Record<string, string> = {
  // 1 - Hindi/Bhojpuri/Maithili/English
  'ek': '1',
  'aik': '1',
  'one': '1',
  'एक': '1',
  // 2 - Hindi/Bhojpuri/Maithili/English
  'do': '2',
  'two': '2',
  'दो': '2',
  'doh': '2',
  'dus': '2',
  // 3 - Hindi/Bhojpuri/Maithili/English
  'teen': '3',
  'three': '3',
  'तीन': '3',
  'tin': '3',
  // 4 - Hindi/Bhojpuri/Maithili/English
  'char': '4',
  'chaar': '4',
  'four': '4',
  'चार': '4',
  'chari': '4',
  'chaur': '4',
  // 5 - Hindi/Bhojpuri/Maithili/English
  'paanch': '5',
  'paaanch': '5',
  'five': '5',
  'पांच': '5',
  'panch': '5',
  // 6 - Hindi/Bhojpuri/Maithili/English
  'chhah': '6',
  'chhe': '6',
  'six': '6',
  'छह': '6',
  'che': '6',
  // 7 - Hindi/Bhojpuri/Maithili/English
  'saat': '7',
  'seven': '7',
  'सात': '7',
  'sat': '7',
  // 8 - Hindi/Bhojpuri/Maithili/English
  'aath': '8',
  'eight': '8',
  'आठ': '8',
  'ath': '8',
  // 9 - Hindi/Bhojpuri/Maithili/English
  'nau': '9',
  'nine': '9',
  'नौ': '9',
  'naua': '9',
  'nawan': '9',
  'नऊ': '9',
  'नउ': '9',
  // 0 - Hindi/Bhojpuri/Maithili/English
  'shoonya': '0',
  'zero': '0',
  'sifar': '0',
  'शून्य': '0',
  'siphar': '0',
  'सिफर': '0',
  // Maithili specific
  'चारि': '4',
}

// Preamble words to strip
export const PREAMBLE_WORDS = ['mera', 'hamara', 'number', 'ye', 'is', 'meri', 'apna']

export function normalizeNumberInput(transcript: string): string {
  let text = transcript.toLowerCase().trim()

  // Strip preambles
  for (const preamble of PREAMBLE_WORDS) {
    if (text.startsWith(preamble + ' ')) {
      text = text.replace(preamble + ' ', '').trim()
    }
  }

  // Strip country code prefix
  text = text.replace(/^(\+91|91|plus 91|plus nyanve)\s*/, '')

  // Convert words to numbers
  const words = text.split(/\s+/)
  const digits = words.map(word => NUMBER_WORDS[word] || word).join('')

  // Extract only digits
  const numericOnly = digits.replace(/[^0-9]/g, '')

  // Handle if 10 digits found
  if (numericOnly.length === 10) return numericOnly
  if (numericOnly.length === 12 && numericOnly.startsWith('91')) return numericOnly.slice(2)

  return numericOnly
}

export function normalizeOtpInput(transcript: string): string {
  let text = transcript.toLowerCase().trim()

  // Strip preambles
  text = text.replace(/^(otp|mera otp|code|verification code)\s*/i, '')

  const words = text.split(/\s+/)
  const digits = words.map(w => NUMBER_WORDS[w] || w).join('')
  return digits.replace(/[^0-9]/g, '')
}

export function normalizeYesNo(transcript: string): 'yes' | 'no' | null {
  const text = transcript.toLowerCase().trim()

  // Use word boundary matching to avoid false positives
  // Check for NO first to handle conflicting inputs like "haan nahi"
  const NO_WORDS = ['nahi', 'nahin', 'no', 'nhi', 'naa', 'badlen', 'galat', 'नहीं', 'नही']
  for (const word of NO_WORDS) {
    // Use Unicode-aware word boundary matching
    const regex = new RegExp(`(^|\\s)${word}($|\\s)`, 'i')
    if (regex.test(text)) return 'no'
  }

  const YES_WORDS = ['haan', 'ha', 'yes', 'haa', 'bilkul', 'sahi', 'theek', 'हाँ', 'हां', 'जी हाँ']
  for (const word of YES_WORDS) {
    const regex = new RegExp(`(^|\\s)${word}($|\\s)`, 'i')
    if (regex.test(text)) return 'yes'
  }

  return null
}

// Format mobile number with spaces
export function formatMobileNumber(number: string): string {
  const cleaned = number.replace(/[^0-9]/g, '')
  if (cleaned.length !== 10) return cleaned
  return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
}

// Format OTP with spaces
export function formatOTP(otp: string): string {
  const cleaned = otp.replace(/[^0-9]/g, '')
  if (cleaned.length !== 6) return cleaned
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
}
