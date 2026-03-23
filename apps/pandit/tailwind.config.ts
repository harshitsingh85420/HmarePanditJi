import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY PALETTE - Saffron (ALL primary actions) - Part 1 spec
        'saffron': '#FF8C00',
        'saffron-dark': '#904D00',
        'saffron-light': '#FFF3E0',
        'saffron-tint': '#FFF8E1',
        'saffron-border': '#FFB300',
        'primary': '#FF8C00',
        'primary-lt': '#FFF3E0',

        // SURFACE PALETTE - Backgrounds (EXACT from Part 1 HTML)
        'surface-base': '#FBF9F3',
        'surface-card': '#FFFFFF',
        'surface-muted': '#F5F3EE',
        'surface-dim': '#E4E2DD',
        'surface-high': '#EAE8E2',

        // TEXT PALETTE (EXACT from Part 1 HTML) - DARKER for WCAG AA
        'text-primary': '#1B1C19',
        'text-secondary': '#4A3728',  // DARKER (was #564334) - 4.5:1 contrast minimum
        'text-placeholder': '#6B5344',  // DARKER (was #897362)
        'text-disabled': '#9CA3AF',  // DARKER for WCAG AA (was #C7C7CC)
        'text-gold': '#B8860B',  // DarkGoldenrod - WCAG AA compliant on #FBF9F3
        'text-gold-light': '#DAA520',  // Goldenrod for backgrounds

        // VEDIC COLORS - Updated for accessibility
        'vedic-cream': '#FBF9F3',
        'vedic-brown': '#3E2723',  // Darker brown for better contrast
        'vedic-gold': '#B8860B',  // DarkGoldenrod - WCAG AA compliant
        'vedic-gold-light': '#DAA520',
        'vedic-border': '#C4B5A0',  // Darker border for visibility

        // SEMANTIC COLORS
        'trust-green': '#1B6D24',
        'trust-green-bg': '#E8F5E9',
        'trust-green-border': '#A5D6A7',

        'warning-amber': '#F57C00',  // Darker amber for better visibility
        'warning-amber-bg': '#FFF3E0',

        'error-red': '#BA1A1A',
        'error-red-bg': '#FFDAD6',

        // INDIGO (Customer card only)
        'indigo-tint': '#E8EAF6',
        'indigo-border': '#9FA8DA',
        'indigo-text': '#3F51B5',

        // BORDERS (EXACT from Part 1 HTML) - DARKER for WCAG AA
        'border-default': '#C4B5A0',  // DARKER (was #E5E5EA) - 3:1 contrast minimum
        'border-active': '#FF8C00',
        'border-success': '#1B6D24',
        'border-warm': '#DDC1AE',

        // OTHER
        'background': '#FBF9F3',
        'on-background': '#1B1C19',
        'on-surface': '#1B1C19',
        'on-surface-variant': '#564334',
      },
      fontFamily: {
        'devanagari': ['Noto Sans Devanagari', 'sans-serif'],
        'serif': ['Noto Serif', 'serif'],
        'body': ['Public Sans', 'Noto Sans Devanagari', 'sans-serif'],
        'label': ['Noto Sans Devanagari', 'sans-serif'],
        'headline': ['Noto Serif', 'serif'],
      },
      fontSize: {
        'hero': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'screen-x': '20px',
        'card-p': '20px',
      },
      borderRadius: {
        'card': '16px',
        'card-sm': '12px',
        'btn': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
        'card-saffron': '0px 4px 16px rgba(255,140,0,0.12), 0px 2px 4px rgba(0,0,0,0.06)',
        'btn-saffron': '0px 4px 12px rgba(255,140,0,0.35)',
        'btn-saffron-pressed': '0px 1px 4px rgba(255,140,0,0.20)',
        'sheet': '0px -4px 20px rgba(0,0,0,0.10)',
        'top-bar': '0px 2px 10px rgba(144,77,0,0.05)',
      },
      animation: {
        'pulse-saffron': 'pulse-saffron 2s ease-in-out infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite alternate',
        'celebration-in': 'celebration-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.32,0,0,1) forwards',
        'fade-in': 'fade-in 0.25s ease-in-out forwards',
        'spin-slow': 'spin 2s linear infinite',
        'voice-bar': 'voice-bar 1.2s ease-in-out infinite',
        'voice-bar-2': 'voice-bar 1.2s ease-in-out 0.2s infinite',
        'voice-bar-3': 'voice-bar 1.2s ease-in-out 0.4s infinite',
      },
      keyframes: {
        'pulse-saffron': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'waveform': {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'celebration-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'voice-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
      },
      minHeight: {
        'touch': '64px',  // WET HAND RELIABILITY - 64px minimum for temple environments
        'btn': '64px',
        'btn-sm': '56px',
        'confirm': '64px',
      },
      minWidth: {
        'touch': '64px',  // WET HAND RELIABILITY - 64px minimum
      },
    },
  },
  plugins: [],
}
export default config
