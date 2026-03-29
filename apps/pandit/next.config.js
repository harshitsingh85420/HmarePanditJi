const { withSentryConfig } = require('@sentry/nextjs')
const sentryBuildOptions = require('./sentry.client.config.js')

// Bundle analyzer for performance optimization
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@hmarepanditji/ui',
    '@hmarepanditji/types',
    '@hmarepanditji/utils',
  ],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'zustand', 'lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Performance hints for bundle size
    if (!isServer) {
      config.performance = {
        hints: 'warning',
        maxAssetSize: 500000, // 500KB target
        maxEntrypointSize: 500000,
      }
    }
    return config
  },
}

module.exports = withBundleAnalyzer(withSentryConfig(nextConfig, sentryBuildOptions))
