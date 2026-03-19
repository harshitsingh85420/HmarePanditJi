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
        // PRIMARY PALETTE - Saffron (ALL primary actions)
        'saffron':          '#FF8C00',
        'saffron-dark':     '#CC7000',
        'saffron-light':    '#FFF3E0',
        'saffron-tint':     '#FFF8E1',
        'saffron-border':   '#FFB300',

        // SURFACE PALETTE - Backgrounds
        'surface-base':     '#FFFDF7',  // Main background (warm off-white)
        'surface-card':     '#FFFFFF',  // Card surfaces
        'surface-muted':    '#F5F3EE',  // Muted containers
        'surface-dim':      '#F0EEE8',  // Dimmed containers
        'surface-high':     '#EAE8E2',  // High emphasis containers

        // TEXT PALETTE
        'text-primary':     '#1C1C1E',  // Near-black body text
        'text-secondary':   '#636366',  // Muted descriptions
        'text-placeholder': '#AEAEB2',  // Input placeholders
        'text-disabled':    '#C7C7CC',  // Disabled states

        // SEMANTIC COLORS
        'trust-green':      '#2E7D32',  // Success, savings, verified
        'trust-green-bg':   '#E8F5E9',  // Light green background
        'trust-green-border':'#A5D6A7', // Green borders

        'warning-amber':    '#FF9500',  // Network warnings (NOT errors)
        'warning-amber-bg': '#FFF3E0',  // Amber light background

        'error-red':        '#D32F2F',  // Critical errors ONLY
        'error-red-bg':     '#FFDAD6',  // Error backgrounds

        // INDIGO (Customer card only - never use for Pandit flows)
        'indigo-tint':      '#E8EAF6',
        'indigo-border':    '#9FA8DA',
        'indigo-text':      '#3F51B5',

        // BORDERS
        'border-default':   '#E5E5EA',
        'border-active':    '#FF8C00',
        'border-success':   '#2E7D32',
        'border-warm':      '#DDC1AE',
      },
      fontFamily: {
        'devanagari': ['Noto Sans Devanagari', 'sans-serif'],
        'serif': ['Noto Serif', 'serif'],
        'body': ['Public Sans', 'Noto Sans Devanagari', 'sans-serif'],
        'label': ['Public Sans', 'sans-serif'],
      },
      fontSize: {
        'hero':   ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title':  ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'body':   ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm':['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label':  ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'micro':  ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'screen-x': '20px',  // Horizontal screen margin
        'card-p':   '20px',  // Card padding
      },
      borderRadius: {
        'card':    '16px',
        'card-sm': '12px',
        'btn':     '12px',
        'pill':    '9999px',
      },
      boxShadow: {
        'card':     '0px 2px 8px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
        'card-saffron': '0px 4px 16px rgba(255,140,0,0.12), 0px 2px 4px rgba(0,0,0,0.06)',
        'btn-saffron':  '0px 4px 12px rgba(255,140,0,0.35)',
        'btn-saffron-pressed': '0px 1px 4px rgba(255,140,0,0.20)',
        'sheet':    '0px -4px 20px rgba(0,0,0,0.10)',
        'top-bar':  '0px 2px 10px rgba(144,77,0,0.05)',
      },
      animation: {
        'pulse-saffron':   'pulse-saffron 2s ease-in-out infinite',
        'waveform':        'waveform 1.2s ease-in-out infinite alternate',
        'celebration-in':  'celebration-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'sheet-up':        'sheet-up 0.32s cubic-bezier(0.32,0,0,1) forwards',
        'fade-in':         'fade-in 0.25s ease-in-out forwards',
        'spin-slow':       'spin 2s linear infinite',
      },
      keyframes: {
        'pulse-saffron': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':       { opacity: '1',  transform: 'scale(1.05)' },
        },
        'waveform': {
          '0%':   { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'celebration-in': {
          '0%':   { transform: 'scale(0)',   opacity: '0' },
          '70%':  { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'sheet-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      minHeight: {
        'touch': '52px',   // Minimum touch target
        'btn':   '56px',   // Primary button height
        'btn-sm':'48px',   // Secondary button height
        'confirm':'60px',  // Confirmation pair buttons
      },
      minWidth: {
        'touch': '52px',
      },
    },
  },
  plugins: [],
}
export default config
