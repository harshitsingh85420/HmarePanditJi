import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PRIMARY PALETTE - Saffron (EXACT values from HTML references)
        'primary': '#904D00',           // Dark saffron - main text/actions (on-primary-container)
        'primary-container': '#FF8C00', // Bright saffron - buttons (primary-container)
        'primary-fixed': '#FFDCC3',     // Light saffron - backgrounds
        'primary-fixed-dim': '#FFB77D',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#623200',
        'on-primary-fixed': '#2F1500',
        'on-primary-fixed-variant': '#6E3900',

        // SURFACE PALETTE - Backgrounds (EXACT from HTML)
        'surface-base': '#FBF9F3',           // Main background
        'surface-card': '#FFFFFF',           // Card surfaces
        'surface-container': '#F0EEE8',      // Container backgrounds
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F5F3EE',
        'surface-container-high': '#EAE8E2',
        'surface-container-highest': '#E4E2DD',
        'surface-dim': '#DBDAD4',
        'surface-bright': '#FBF9F3',

        // TEXT PALETTE (EXACT from HTML)
        'text-primary': '#1B1C19',      // Primary text (on-background/on-surface)
        'text-secondary': '#564334',    // Secondary text (on-surface-variant)
        'text-placeholder': '#897362',  // Input placeholders (outline)
        'text-disabled': '#C7C7CC',     // Disabled states

        // SEMANTIC COLORS (EXACT from HTML)
        'secondary': '#1B6D24',         // Green - success
        'secondary-container': '#A0F399',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#217128',
        'on-secondary-fixed': '#002204',
        'on-secondary-fixed-variant': '#005312',
        'secondary-fixed': '#A3F69C',
        'secondary-fixed-dim': '#88D982',

        'error': '#BA1A1A',             // Red - errors
        'error-container': '#FFDAD6',
        'on-error': '#FFFFFF',
        'on-error-container': '#93000A',

        'warning-amber': '#F89100',     // Amber - warnings
        'warning-amber-bg': '#FFF3E0',

        'tertiary': '#8C5000',          // Brown
        'tertiary-container': '#F89100',
        'tertiary-fixed': '#FFDCBF',
        'tertiary-fixed-dim': '#FFB874',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#5F3400',
        'on-tertiary-fixed': '#2D1600',
        'on-tertiary-fixed-variant': '#6A3B00',

        // BORDERS & OUTLINES (EXACT from HTML)
        'outline': '#897362',
        'outline-variant': '#DDC1AE',
        'border-default': '#E5E5EA',
        'border-active': '#FF8C00',
        'border-success': '#1B6D24',
        'border-warm': '#DDC1AE',

        // OTHER
        'background': '#FBF9F3',
        'on-background': '#1B1C19',
        'on-surface': '#1B1C19',
        'on-surface-variant': '#564334',
        'inverse-surface': '#30312D',
        'inverse-on-surface': '#F2F1EB',
        'inverse-primary': '#FFB77D',
        'surface-tint': '#904D00',
        'surface-variant': '#E4E2DD',

        // INDIGO (Customer card only)
        'indigo-tint': '#E8EAF6',
        'indigo-border': '#9FA8DA',
        'indigo-text': '#3F51B5',

        // TRUST COLORS
        'trust-green': '#1B6D24',
        'trust-green-bg': '#E8F5E9',
        'trust-green-border': '#A5D6A7',
      },
      fontFamily: {
        hind: ['Hind', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        serif: ['Noto Serif', 'serif'],
        body: ['Public Sans', 'Noto Sans Devanagari', 'sans-serif'],
        label: ['Noto Sans Devanagari', 'sans-serif'],
        headline: ['Noto Serif', 'serif'],
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
      keyframes: {
        'voice-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
        'waveform': {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'pulse-saffron': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
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
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'voice-bar': 'voice-bar 1.2s ease-in-out infinite',
        'voice-bar-2': 'voice-bar 1.2s ease-in-out 0.2s infinite',
        'voice-bar-3': 'voice-bar 1.2s ease-in-out 0.4s infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite alternate',
        'pulse-saffron': 'pulse-saffron 2s ease-in-out infinite',
        'celebration-in': 'celebration-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.32,0,0,1) forwards',
        'fade-in': 'fade-in 0.25s ease-in-out forwards',
        'spin-slow': 'spin-slow 2s linear infinite',
      },
      minHeight: {
        'touch': '52px',
        'btn': '56px',
        'btn-sm': '48px',
        'confirm': '60px',
      },
      minWidth: {
        'touch': '52px',
      },
    },
  },
  plugins: [],
}

export default config