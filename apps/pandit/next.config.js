/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // These are existing pre-built screens with Hindi text — unescaped quotes are intentional
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "@hmarepanditji/ui",
    "@hmarepanditji/types",
    "@hmarepanditji/utils",
  ],
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Allow nominatim for reverse geocoding & voice APIs
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(*), geolocation=(*)',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
