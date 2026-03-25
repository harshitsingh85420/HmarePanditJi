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
  // FIX: Skip generating static error pages that have issues with Html component
  onDemandEntries: {
    // Keep pages in memory longer
    maxInactiveAge: 60 * 1000,
  },
}

module.exports = nextConfig
