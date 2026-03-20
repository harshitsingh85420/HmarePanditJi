Run: node -e "const { createCanvas } = require('canvas'); const c = createCanvas(192,192); const ctx = c.getContext('2d'); ctx.fillStyle='#FF8C00'; ctx.fillRect(0,0,192,192); ctx.fillStyle='white'; ctx.font='bold 120px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🪔',96,96); require('fs').writeFileSync('public/icon-192.png', c.toBuffer('image/png'));"
(Note: canvas npm package needed: npm install canvas)
OR just create 192×192 and 512×512 orange placeholder PNGs manually.

STEP 2 - Add performance optimizations to next.config.js:

Replace next.config.js with:

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },

  // Font optimization (inline fonts for faster load)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // Compression
  compress: true,

  // Headers for security and PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
}

module.exports = nextConfig

STEP 3 - Final production build test:
npm run build
npm run start

Test at localhost:3000 on Chrome mobile emulation.
Test offline behavior (Chrome DevTools > Network tab > Offline).
Verify session state persists across page refreshes.

STEP 4 - Performance checklist (verify each):
[ ] Homepage loads in < 3 seconds on 3G
[ ] First Contentful Paint < 1.5 seconds  
[ ] All images have width and height attributes
[ ] Fonts loaded without layout shift
[ ] Touch targets ≥ 52×52px
[ ] No horizontal scrolling on 360px viewport
[ ] Voice button activates on tap (requires HTTPS in production)
[ ] Zustand state persists across hard refresh
[ ] Back button on Android navigates correctly
[ ] Session save notice appears and auto-dismisses

STEP 5 - Generate Lighthouse report:
In Chrome DevTools > Lighthouse > Mobile
Target scores:
- Performance: > 75
- Accessibility: > 90
- Best Practices: > 90
- PWA: > 50

Fix the top 3 issues Lighthouse reports.

Report all items that could not be fixed and the reason why.
```

---

# APPENDIX: DEBUGGING PROMPTS

## IF VOICE RECOGNITION FAILS:
```
Fix the voice recognition issue in HmarePanditJi. The useVoice hook is not working because:
[paste the exact error]

IMPORTANT CONTEXT:
- The Web Speech API requires HTTPS in production. For localhost development it works on Chrome without HTTPS.
- Safari has limited Web Speech API support — this is expected.
- Android Chrome requires the user to tap a button to start recognition (cannot auto-start without user gesture).
- The fix must: [describe what should happen]
```

## IF ZUSTAND PERSIST BREAKS:
```
Fix the Zustand persistence in HmarePanditJi. The registration data is not persisting between page refreshes.

Current store code: [paste the store]
Expected behavior: Registration data should persist in localStorage for 7 days.
Actual behavior: [describe what's happening]

Do not change the store interface. Only fix the persistence configuration.
```

## IF TYPESCRIPT COMPILATION FAILS:
```
Fix this TypeScript error in HmarePanditJi without changing the logic:

Error: [paste exact error message with file path and line number]

File content: [paste relevant file section]

Constraints:
- Do not change the component's external interface (props)
- Do not add 'as any' type assertions
- Fix with proper typing only
```

## IF FRAMER MOTION ANIMATIONS LAG:
```
The animations in HmarePanditJi are lagging on low-end Android devices.
Optimize these specific animations for 30fps performance on Android devices with 2GB RAM:

Current animation: [paste animation code]
Screen where it appears: [screen name]

Required optimizations:
1. Use transform and opacity only (GPU-accelerated properties)
2. Add will-change: transform where appropriate
3. Use layoutId for shared element transitions
4. Reduce animation complexity
Keep the visual result identical to the design spec.