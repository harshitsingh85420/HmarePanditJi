export const ROUTES = {
  HOME: '/',
  IDENTITY: '/identity',
  REFERRAL: '/referral',
  LANGUAGE: '/language',
  WELCOME: '/welcome',
  MIC_PERMISSION: '/permissions/mic',
  MIC_DENIED: '/permissions/mic-denied',
  LOCATION_PERMISSION: '/permissions/location',
  NOTIFICATION_PERMISSION: '/permissions/notifications',
  MOBILE: '/mobile',
  OTP: '/otp',
  PROFILE: '/profile',
  COMPLETE: '/complete',
  HELP: '/help',
} as const

// Registration step to route mapping
export const STEP_TO_ROUTE: Record<string, string> = {
  language: ROUTES.LANGUAGE,
  welcome: ROUTES.WELCOME,
  mic_permission: ROUTES.MIC_PERMISSION,
  location_permission: ROUTES.LOCATION_PERMISSION,
  notification_permission: ROUTES.NOTIFICATION_PERMISSION,
  mobile: ROUTES.MOBILE,
  otp: ROUTES.OTP,
  profile: ROUTES.PROFILE,
}

// Voice questions for each step
export const VOICE_QUESTIONS: Record<string, string> = {
  mobile: 'Kripya apna 10 digit mobile number boliye ya type karein.',
  otp: 'Aapka OTP kya hai? Kripya OTP boliye ya type karein.',
  name: 'Aapka naam kya hai? Pandit Ji ka poora naam boliye.',
  city: 'Aap kis shehar mein hain? Apna shehar ka naam boliye.',
}

// Celebrations messages per step
export const CELEBRATION_NAMES: Record<string, string> = {
  mobile: 'Mobile Number',
  otp: 'OTP Verification',
  profile: 'Profile Details',
  complete: 'Registration',
}
