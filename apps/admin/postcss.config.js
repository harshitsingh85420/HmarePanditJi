// Tailwind's PostCSS plugin resolves `tailwind.config.ts` from the process
// CWD by default — which breaks when `next dev`/`next build` is launched from
// the monorepo root: it silently finds NO config and emits zero utilities.
// The admin panel then renders with 47 CSS rules — no table borders, no
// badges, no spacing — and nothing fails, because missing CSS is not an error.
// apps/pandit already pins its config for this reason; admin now matches.
const path = require('path');

module.exports = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.ts') },
    autoprefixer: {},
  },
};
