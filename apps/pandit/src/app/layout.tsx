import type { Metadata, Viewport } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import StoreProvider from '@/components/StoreProvider'

// Force ALL routes to be dynamically rendered (no static generation)
// This is required for Zustand store compatibility and error boundaries
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

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
  themeColor: '#FF8C00',
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
      <body className="font-hind bg-surface-base text-text-primary antialiased">
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          <StoreProvider>
            {children}
          </StoreProvider>
        </div>
      </body>
    </html>
  )
}
