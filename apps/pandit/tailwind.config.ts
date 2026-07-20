import type { Config } from 'tailwindcss'

const config: Config = {
  // `relative: true` resolves these globs against THIS config file, not the
  // process CWD — so `next dev` started from the monorepo root (launch.json)
  // still finds src/** and emits the full utility CSS, identical to prod.
  content: {
    relative: true,
    files: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}',
      '../../packages/utils/src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  },
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
        // NOTE the `saffron` key is a legacy NAME, not the hue: its value is
        // SINDOOR #B23A1A, which is what the design canon actually uses
        // (design/canon/हमारे पंडित जी.dc.html — #b23a1a is its most-used
        // colour, 99 occurrences; the saffron #904d00 of the older /prompts
        // Stitch set appears there ZERO times). Renaming the key would touch
        // every class in the app for no visual gain, so the name stays and
        // this comment carries the truth. See DESIGN.md / CONFLICT_RULINGS.md.
        // cream == CHANDAN, gold == PITAL brass, leaf == TULSI money green,
        // softgrey == DHOOP.
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
        chandan:'#FFF6E9',   // on-sindoor text + warm screen tint (mockup)
        // Sand tones — card borders, dividers, inactive tracks (mockup export).
        // 100 = #EADFCE, canon's INPUT hairline (`1.5px solid #EADFCE`, ×10 —
        // the most-repeated field border in the whole artboard set).
        sand:   { DEFAULT:'#F0DFC4', 100:'#EADFCE', 200:'#E7DCC9', 300:'#E4D6C1', 400:'#C9BBA6' },
        // CANON SURFACE TINTS — every one of these is a literal that recurs
        // across artboards but had no token, so screens were hard-coding it
        // (or, more often, silently flattening to a nearby colour).
        //   cardtint  — the FAR stop of canon's card gradient. Canon's card is
        //               never a flat fill: linear-gradient(140deg,#FFFDF8,#FFF0DC).
        //   peach     — warm tile fill, pairs with saffron-50 (#FDEEE7)
        //   goldpale  — the "pending / awaiting" chip field
        //   leafpale  — leaf-card border (money + success surfaces)
        //   parchment — the muted/disabled row fill (opacity .8-.9 rows)
        cardtint:  '#FFF0DC',
        peach:     '#FFF3E2',
        goldpale:  '#FBF0D8',
        leafpale:  '#BFE3CC',
        parchment: '#FBF7EF',
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
        // V1: anusvara-correct display face (Yatra One retired — it drew ं onto the next cluster)
        display: ['var(--font-noto)', 'var(--font-tiro)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
        canvas: '28px',
        // CANON RADIUS VOCABULARY (294 uses, and it is only four numbers):
        //   18px ×57 — CTAs and stat tiles          -> cta / tile
        //   16px ×46 — fields, list rows, chips-box -> field (== btn, kept
        //              separate so a later canon correction to one does not
        //              silently move the other)
        //   22px ×7  — THE raised card surface       -> surface
        //   999px    — pills                         -> chip
        // The app only had 20/16/28, so nothing sat on canon's 18 or 22 and
        // every CTA read 2px tighter than the artboard.
        surface: '22px',
        tile: '18px',
        cta: '18px',
        field: '16px',
        chip: '999px',
      },
      // CANON GRADIENT VOCABULARY. Canon's depth comes from multi-stop
      // gradients + layered shadows, never from structure — but NONE of these
      // existed as tokens, so every surface in the app was a flat fill.
      backgroundImage: {
        // THE card surface. 140deg is canon's card angle and #FFF0DC its far
        // stop; neither string appeared anywhere in apps/pandit before this.
        cardsurface: 'linear-gradient(140deg,#FFFDF8,#FFF0DC)',
        // CTA fills
        sindoor:      'linear-gradient(180deg,#C44A22,#B23A1A)',
        'sindoor-dg': 'linear-gradient(135deg,#B23A1A,#7A250E)',
        // Orbs / lamps — the radial that draws a lit brass or clay object
        'orb-diya':  'radial-gradient(circle at 50% 35%,#FFE9B8,#F2A02C 60%,#B23A1A)',
        'orb-brass': 'radial-gradient(circle at 40% 35%,#FFEBA8,#E7B54A 55%,#B8860B)',
        'orb-bell':  'radial-gradient(ellipse at 50% 26%,#F6D585,#B8860B 68%,#7d5c0f)',
        // Tinted tiles
        'tile-peach': 'linear-gradient(135deg,#FFF3E2,#FDEEE7)',
        'tile-leaf':  'linear-gradient(135deg,#DDE9D2,#C9DAB9)',
        'tile-sage':  'linear-gradient(135deg,#E7F0DD,#DCE8CF)',
        // Ornament
        'gold-shine': 'linear-gradient(90deg,#E7B54A 20%,#FFF6DE 50%,#E7B54A 80%)',
        'night':      'linear-gradient(150deg,#2A1B3D,#4a2e2a)',
        'night-warm': 'linear-gradient(150deg,#2A1B3D,#5E1C0A)',
        // The page field itself — canon lays a huge soft radial behind content
        'page-warm':  'radial-gradient(1400px 700px at 40% -100px,#F6EDD9,#E7D6B8 70%)',
        'halo-sindoor': 'radial-gradient(circle,rgba(178,58,26,.18),transparent 70%)',
      },
      // CANON SHADOW VOCABULARY (counted from design/canon/हमारे पंडित जी):
      //   0 6px 16px rgba(178,58,26,.3)  ×16 — THE raised-sindoor lift
      //   0 2px 8px  rgba(90,46,32,.12)  ×10 — the resting card
      //   0 8px 20px rgba(30,122,70,.35) ×2  — money/success, lifted highest
      // The app's btn sat at 4px/14px: 2px lower and 2px tighter than the
      // signature lift, which is why CTAs read flatter than the artboard
      // everywhere at once. Same colour, same opacity — only the geometry
      // was short, so this is a pure depth correction, not a restyle.
      boxShadow: {
        card: '0 2px 8px rgba(90,46,32,0.12)',
        btn: '0 6px 16px rgba(178,58,26,0.30)',
        // success/money CTAs sit highest in canon — the leaf equivalent
        'btn-leaf': '0 8px 20px rgba(30,122,70,0.35)',

        // ── The rest of canon's shadow vocabulary, previously untokenised ──
        // THE RAISED CARD. `card` above (2px/8px) is canon's small circular
        // ICON-button shadow (all 10 of its uses are 42-44px circles); the
        // actual card surface in frame 12 carries 6px/16px @ .10. The app had
        // been using the icon shadow on full-width cards, which is why cards
        // read as printed-on rather than laid-on.
        surface:        '0 6px 16px rgba(90,46,32,0.10)',
        soft:           '0 4px 12px rgba(90,46,32,0.08)',
        lift:           '0 10px 24px rgba(90,46,32,0.16)',
        deep:           '0 8px 22px rgba(0,0,0,0.28)',
        // upward lift under the thali nav
        nav:            '0 -3px 12px rgba(90,46,32,0.08)',
        // sindoor family
        chip:           '0 5px 12px rgba(178,58,26,0.22)',
        'btn-hero':     '0 8px 22px rgba(178,58,26,0.40)',
        'sindoor-soft': '0 5px 14px rgba(178,58,26,0.16)',
        'sindoor-deep': '0 10px 24px rgba(122,37,14,0.35)',
        // the ONE inset in canon: a lit brass object catching light on top
        'orb-brass':    'inset 0 5px 8px rgba(255,255,255,0.45), 0 8px 14px rgba(90,46,32,0.32)',
        // genda glow — canon's "this is alight" halo (7px and 8px both occur)
        'glow-genda':   '0 0 8px rgba(242,160,44,0.7)',
        'glow-genda-sm':'0 0 7px rgba(242,160,44,0.7)',
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
