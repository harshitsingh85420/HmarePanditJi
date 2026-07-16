// Tailwind's PostCSS plugin resolves `tailwind.config.ts` from the process
// CWD by default — which breaks when `next dev` is launched from the monorepo
// root (launch.json): it silently finds NO config and emits zero utilities.
// Pin the config path to THIS package so dev CSS === prod CSS from any CWD.
const path = require('path');

module.exports = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.ts') },
    autoprefixer: {},
  },
};
