import type { Metadata, Viewport } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import AppShell from '../components/AppShell'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={hind.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-hind bg-vedic-cream text-vedic-brown antialiased">
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  )
}
