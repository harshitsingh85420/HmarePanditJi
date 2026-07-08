import type { Metadata, Viewport } from 'next'
import { Tiro_Devanagari_Hindi, Noto_Sans_Devanagari, Yatra_One } from 'next/font/google'
import './globals.css'
import NextDynamic from 'next/dynamic'

// SSR FIX: Force dynamic rendering for all pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

// SSR FIX: Load StoreHydration only on client to prevent localStorage access during SSR
const StoreHydrationClient = NextDynamic(() => import('@/components/StoreHydrationClient').then(mod => mod.StoreHydrationClient), {
  ssr: false,
})

const tiroDevanagari = Tiro_Devanagari_Hindi({
  weight: '400',
  subsets: ['devanagari', 'latin'],
  variable: '--font-tiro',
  display: 'swap',
})

// Display face — Yatra One is ONLY for the greeting name line, money values,
// and celebration titles (readability law: never body text, labels, buttons).
const yatraOne = Yatra_One({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  variable: '--font-yatra',
})

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto',
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
  themeColor: '#B23A1A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi" className={`${tiroDevanagari.variable} ${notoDevanagari.variable} ${yatraOne.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-hindi text-ink bg-cream text-[18px] leading-[1.6] antialiased" suppressHydrationWarning>
        {/* SSR FIX: Hydrate Zustand persist stores after initial render - CLIENT SIDE ONLY */}
        <StoreHydrationClient />
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
