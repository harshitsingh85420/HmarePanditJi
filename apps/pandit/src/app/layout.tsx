import type { Metadata, Viewport } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

// SSR FIX: Load StoreHydration only on client to prevent localStorage access during SSR
const StoreHydrationClient = dynamic(() => import('@/components/StoreHydrationClient').then(mod => mod.StoreHydrationClient), {
  ssr: false,
})

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
    <html lang="hi" className={hind.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-hind bg-vedic-cream text-vedic-brown antialiased" suppressHydrationWarning>
        {/* SSR FIX: Hydrate Zustand persist stores after initial render - CLIENT SIDE ONLY */}
        <StoreHydrationClient />
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
