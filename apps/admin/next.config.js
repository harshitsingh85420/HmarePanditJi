/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "standalone",
  transpilePackages: [
    "@hmarepanditji/ui",
    "@hmarepanditji/types",
    "@hmarepanditji/utils",
  ],

  // R10 — SECURITY HEADERS. This app had NONE: no headers() block, no
  // middleware (apps/pandit/src/middleware.ts is the repo's only one), no
  // platform fallback (apps/admin/vercel.json is build config only), and Next
  // 14 adds none by default.
  //
  // This is the panel that APPROVES KYC and RELEASES PAYOUTS, and without
  // X-Frame-Options it is framable: a logged-in admin lured to an attacker
  // page can be clickjacked into approving a payout or a verification.
  //
  // Copied from apps/pandit/next.config.js MINUS its microphone=(self) grant —
  // the ops panel has no voice surface, so it gets the closed allowlist.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
