import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY PALETTE
        'primary': '#F09942',
        'primary-dk': '#DC6803',
        'primary-lt': '#FEF3C7',

        // SURFACE PALETTE
        'surface-base': '#FFFBF5',
        'surface-card': '#FFFFFF',
        'surface-muted': '#F5F3EE',
        'surface-dim': '#E4E2DD',
        'surface-high': '#EAE8E2',

        // TEXT PALETTE
        'text-primary': '#1B1C19',
        'text-secondary': '#564334',
        'text-placeholder': '#897362',
        'text-disabled': '#C7C7CC',
        'text-gold': '#B8860B',
        'text-gold-light': '#DAA520',

        // VEDIC COLORS
        'vedic-cream': '#FFFBF5',
        'vedic-brown': '#2D1B00',
        'vedic-brown-2': '#6B4F2A',
        'vedic-gold': '#9B7B52',
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
      minHeight: {
        'touch': '72px',
        'btn': '72px',
        'confirm': '72px',
        'input': '72px',
      },
      minWidth: {
        'touch': '72px',
        'btn': '72px',
      },
    },
  },
  plugins: [],
}

export default config
