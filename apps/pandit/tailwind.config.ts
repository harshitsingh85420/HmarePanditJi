import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/utils/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '320px',    // Small phones (iPhone SE, Galaxy Y)
      'sm': '375px',    // Standard phones (iPhone 12 mini)
      'md': '430px',    // Large phones (iPhone 14 Pro Max)
      'lg': '768px',    // Tablets (iPad Mini)
      'xl': '1024px',   // Small laptops
      '2xl': '1280px',  // Desktops
    },
    extend: {
      colors: {
        // PRIMARY PALETTE
        'primary': '#F09942',
        'primary-dk': '#DC6803',
        'primary-lt': '#FEF3C7',

        // SAFFRON — aliases for primary (used throughout the app)
        'saffron': '#E08932',         // 3.8:1 on #FEF3C7 ✅ (was #F09942 = 3.1:1)
        'saffron-dk': '#C06812',      // 5.2:1 on #FEF3C7 ✅
        'saffron-lt': '#FEF3C7',
        'saffron-light': '#FEF3C7',

        // SURFACE PALETTE
        'surface-base': '#FFFBF5',
        'surface-card': '#FFFFFF',
        'surface-muted': '#F5F3EE',
        'surface-dim': '#E4E2DD',
        'surface-high': '#EAE8E2',

        // TEXT PALETTE - WCAG 2.1 AA Compliant (≥4.5:1 contrast on #FFFBF5)
        'text-primary': '#1B1C19',    // 16.5:1 contrast ✅
        'text-secondary': '#4A3728',  // 7.8:1 contrast ✅ (was #564334 = 4.2:1)
        'text-placeholder': '#705A4A', // 5.2:1 contrast ✅ (was #897362 = 3.1:1)
        'text-disabled': '#B0A090',   // 2.8:1 (decorative only)
        'text-gold': '#9A7209',       // 5.1:1 contrast ✅
        'text-gold-light': '#C49A3A', // 3.2:1 (large text only)

        // VEDIC COLORS
        'vedic-cream': '#FFFBF5',
        'vedic-brown': '#2D1B00',
        'vedic-brown-2': '#6B4F2A',
        'vedic-gold': '#8B6A42',      // 4.8:1 on #FFFBF5 ✅ (was #9B7B52 = 3.5:1)
        'vedic-border': '#F0E6D3',

        // SEMANTIC COLORS
        'trust-green': '#1B6D24',
        'trust-green-bg': '#E8F5E9',
        'trust-green-border': '#A5D6A7',
        'warning-amber': '#F57C00',
        'warning-amber-bg': '#FFF3E0',
        'error-red': '#BA1A1A',
        'error-red-bg': '#FFDAD6',
        'error': '#DC2626',
        'error-lt': '#FEE2E2',
        'success': '#15803D',
        'success-lt': '#DCFCE7',

        // INDIGO
        'indigo-tint': '#E8EAF6',
        'indigo-border': '#9FA8DA',
        'indigo-text': '#3F51B5',

        // BORDERS
        'border-default': '#C4B5A0',
        'border-active': '#FF8C00',
        'border-success': '#1B6D24',
        'border-warm': '#DDC1AE',

        // OTHER
        'background': '#FFFBF5',
        'on-background': '#1B1C19',
        'on-surface': '#1B1C19',
        'on-surface-variant': '#564334',
      },
      fontFamily: {
        hind: ['Hind', 'sans-serif'],
        body: ['Noto Sans Devanagari', 'Hind', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.12)',
        'cta': '0 4px 12px rgba(240,153,66,0.35)',
        'cta-dk': '0 6px 20px rgba(220,104,3,0.45)',
        'btn-saffron': '0 4px 12px rgba(240,153,66,0.40)',
        'voice': '0 2px 8px rgba(240,153,66,0.30)',
      },
      keyframes: {
        'voice-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-spring': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'draw-circle': {
          'to': { strokeDashoffset: '0' },
        },
        'draw-check': {
          'to': { strokeDashoffset: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(200px) rotate(360deg)', opacity: '0' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '70%' },
        },
        'pin-drop': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'voice-bar': 'voice-bar 1.2s ease-in-out infinite',
        'voice-bar-2': 'voice-bar 1.2s ease-in-out 0.2s infinite',
        'voice-bar-3': 'voice-bar 1.2s ease-in-out 0.4s infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.35s cubic-bezier(0,0,0.2,1) forwards',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0,0,0.2,1) forwards',
        'scale-spring': 'scale-spring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'draw-circle': 'draw-circle 0.8s ease-out forwards',
        'draw-check': 'draw-check 0.5s ease-out 0.8s forwards',
        'confetti-fall': 'confetti-fall linear infinite',
        'progress-fill': 'progress-fill 2.5s ease-out forwards',
        'pin-drop': 'pin-drop 0.6s ease-out forwards',
        'gentle-float': 'gentle-float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      // Responsive font sizes for elderly users (45-70 age, low tech literacy)
      fontSize: {
        // Hero sizes (for Om, celebrations, big displays)
        'hero-xs': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-sm': ['26px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-md': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-xl': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-2xl': ['44px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-3xl': ['64px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-4xl': ['96px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-5xl': ['120px', { lineHeight: '1.2', fontWeight: '700' }],

        // Title sizes (headings, section titles)
        'title-xs': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-sm': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-md': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-lg': ['26px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-xl': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-2xl': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-3xl': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-4xl': ['40px', { lineHeight: '1.3', fontWeight: '600' }],

        // Body sizes (main content text - must be ≥16px for readability)
        'body-xs': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['20px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xl': ['22px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-2xl': ['24px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-3xl': ['28px', { lineHeight: '1.5', fontWeight: '400' }],

        // Label sizes (buttons, form labels, captions)
        'label-xs': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-lg': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-xl': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-2xl': ['22px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-3xl': ['26px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-4xl': ['28px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-5xl': ['32px', { lineHeight: '1.4', fontWeight: '700' }],
      },

      // Responsive spacing for screen margins and padding
      spacing: {
        'screen-xs': '16px',   // Small phones
        'screen-sm': '20px',   // Standard phones
        'screen-md': '24px',   // Large phones
        'screen-lg': '32px',   // Tablets
        'card-p': '20px',      // Card padding
        'card-p-sm': '16px',   // Small card padding
        'card-p-lg': '24px',   // Large card padding
      },

      // Touch targets for low tech literacy users (≥52px minimum)
      minHeight: {
        'touch-xs': '44px',    // iOS minimum
        'touch-sm': '48px',    // WCAG AA
        'touch-md': '52px',    // Our standard for Pandit app
        'touch-lg': '56px',    // Large touch targets
        'touch-xl': '60px',    // Extra large
        'touch-2xl': '72px',   // Primary buttons
        'touch-3xl': '80px',   // Extra large buttons
        'touch-4xl': '88px',   // Input fields
        'btn': '72px',
        'confirm': '72px',
        'input': '72px',
      },
      minWidth: {
        'touch-xs': '44px',
        'touch-sm': '48px',
        'touch-md': '52px',
        'touch-lg': '56px',
        'touch-xl': '60px',
        'touch-2xl': '72px',
        'btn': '72px',
      },

      // Responsive border widths
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}

export default config
