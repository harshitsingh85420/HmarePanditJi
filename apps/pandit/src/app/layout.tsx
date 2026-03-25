import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'HmarePanditJi — Pandit Partner',
  description: 'Join HmarePanditJi as a verified Pandit partner',
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
  themeColor: '#FBF9F3',
  viewportFit: 'cover',
}

// FIX: Force dynamic rendering to prevent Zustand store access during static generation
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi" className="light" suppressHydrationWarning>
      <body className="bg-surface-base font-body text-text-primary selection:bg-saffron-light antialiased">
        <div className="min-h-dvh max-w-[430px] mx-auto bg-surface-base relative">
          <ClientProviders>{children}</ClientProviders>
        </div>
      </body>
    </html>
  )
}
