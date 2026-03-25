/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "standalone", // Disabled for Windows dev - causes symlink permission errors
  transpilePackages: [
    "@hmarepanditji/ui",
    "@hmarepanditji/types",
    "@hmarepanditji/utils",
  ],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'zustand'],
  },
  // FIX: Use server rendering for error pages to avoid static generation issues
  // This is a known Next.js 14 App Router bug with static export
  onDemandEntries: {
    // Keep pages in memory longer
    maxInactiveAge: 60 * 1000,
  },
  // Disable static export to avoid the "<Html> imported outside _document" error
  // Error pages will be rendered dynamically
  output: 'standalone',
}

module.exports = nextConfig
