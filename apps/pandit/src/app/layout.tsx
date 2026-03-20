import type { Metadata, Viewport } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import GlobalProviders from '../components/GlobalProviders'

const hind = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HmarePanditJi — Pandit App',
  description: 'App Pandit ke liye hai, Pandit App ke liye nahi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HmarePanditJi',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F09942',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi" className={hind.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-hind bg-vedic-cream text-vedic-brown antialiased">
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          <GlobalProviders>
            {children}
          </GlobalProviders>
        </div>
      </body>
    </html>
  )
}
