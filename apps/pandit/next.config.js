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
}

module.exports = nextConfig
