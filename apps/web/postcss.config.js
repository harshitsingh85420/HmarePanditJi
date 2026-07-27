// Tailwind's PostCSS plugin resolves `tailwind.config.ts` from the process
// CWD by default — built or served from the monorepo root it finds NO config,
// emits zero utilities, and the app renders unstyled. A missing stylesheet is
// not a build error, so this fails silently. Pin the path (as apps/pandit and
// apps/admin do) so dev CSS === prod CSS from any working directory.
const path = require('path');

module.exports = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.ts') },
    autoprefixer: {},
  },
};
