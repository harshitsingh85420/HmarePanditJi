// @ts-check

/**
 * @type {import('@sentry/nextjs').SentryBuildOptions}
 */
const sentryBuildOptions = {
  org: 'hmarepanditji',
  project: 'pandit-app',
  url: 'https://sentry.io/',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    name: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  },
  sourcemaps: {
    assets: ['./.next/**/*'],
  },
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelIntegrations: true,
}

module.exports = sentryBuildOptions
