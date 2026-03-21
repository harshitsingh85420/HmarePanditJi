/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
