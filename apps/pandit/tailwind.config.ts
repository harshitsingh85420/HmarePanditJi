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
        // AARTI IDENTITY — key names unchanged so no class renames are needed.
        // saffron == SINDOOR (primary), cream == CHANDAN, gold == PITAL brass,
        // leaf == TULSI money green, softgrey == DHOOP.
        saffron: {
          DEFAULT:'#B23A1A',
          50:'#FDEEE7', 100:'#FAD8C9', 200:'#F4B096', 300:'#EC8663',
          400:'#D95F38', 500:'#B23A1A',
          600:'#962F13', 700:'#7A250E', 800:'#5E1C0A', 900:'#471507',
        },
        cream:  '#FAF3E6',
        temple: {
          500:'#5A2E20', 600:'#47241A', 700:'#341A13',
        },
        leaf: {
          100:'#E4F3E9', 500:'#1E7A46', 700:'#155C34',
        },
        gold:   '#E7B54A',
        ink:    '#3A1F1B',
        softgrey:'#8A6F5C',
        danger: '#C2321E',
        genda:  '#F2A02C',
        brassdark: '#B8860B',
        card:   '#FFFDF8',
        // FESTIVE ACCENTS (Pratham Aarti) — illustration canvases, chips,
        // progress dots, celebration moments ONLY. Never body text or CTAs.
        rani:   '#D81B60',
        neel:   '#1B7F8E',
        kesar:  '#FF9E2C',
        gulal:  '#F06292',
        ratriviolet: '#2A1B3D',
      },
      fontFamily: {
        hindi: ['var(--font-tiro)', 'var(--font-noto)', 'sans-serif'],
        display: ['var(--font-yatra)', 'var(--font-tiro)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
        canvas: '28px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(90,46,32,0.10)',
        btn: '0 4px 14px rgba(178,58,26,0.30)',
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
