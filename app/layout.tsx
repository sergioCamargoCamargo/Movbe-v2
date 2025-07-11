import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { ClientLayout } from '@/components/ClientLayout'
import { StoreProvider } from '@/components/StoreProvider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

import './globals.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://mobve.com'),
  title: 'MOBVE - Plataforma de Videos para Creadores',
  description:
    'MOBVE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
  keywords: [
    'videos',
    'streaming',
    'creadores',
    'contenido',
    'entertainment',
    'MOBVE',
    'plataforma',
    'monetización',
  ],
  authors: [{ name: 'MOBVE Team' }],
  creator: 'MOBVE',
  publisher: 'MOBVE',
  generator: 'Next.js',
  applicationName: 'MOBVE',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://mobve.com',
    siteName: 'MOBVE',
    title: 'MOBVE - Plataforma de Videos para Creadores',
    description:
      'MOBVE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MOBVE - Plataforma de Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MOBVE',
    creator: '@MOBVE',
    title: 'MOBVE - Plataforma de Videos para Creadores',
    description:
      'MOBVE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }],
    //   { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    //   { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    // ],
    // apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    // other: [
    //   {
    //     rel: 'mask-icon',
    //     url: '/safari-pinned-tab.svg',
    //     color: '#1a1a1a',
    //   },
  },
  manifest: '/site.webmanifest',
  category: 'entertainment',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <StoreProvider>
          <AuthProvider>
            <SidebarProvider>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
