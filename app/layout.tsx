import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { ClientLayout } from '@/components/ClientLayout'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { I18nProvider } from '@/components/I18nProvider'
import { StoreProvider } from '@/components/StoreProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://movbe.com'),
  title: 'MOVBE - Plataforma de Videos para Creadores',
  description:
    'MOVBE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
  keywords: [
    'videos',
    'streaming',
    'creadores',
    'contenido',
    'entertainment',
    'MOVBE',
    'plataforma',
    'monetización',
  ],
  authors: [{ name: 'MOVBE Team' }],
  creator: 'MOVBE',
  publisher: 'MOVBE',
  generator: 'Next.js',
  applicationName: 'MOVBE',
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
    url: 'https://movbe.com',
    siteName: 'MOVBE',
    title: 'MOVBE - Plataforma de Videos para Creadores',
    description:
      'MOVBE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MOVBE - Plataforma de Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MOVBE',
    creator: '@MOVBE',
    title: 'MOVBE - Plataforma de Videos para Creadores',
    description:
      'MOVBE es la plataforma definitiva para creadores de contenido. Publica videos sin restricciones, conecta con tu audiencia y monetiza tu contenido.',
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
    <html lang='es' suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden overflow-y-auto`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <I18nProvider>
              <AuthProvider>
                <SidebarProvider>
                  <ClientLayout>{children}</ClientLayout>
                  <Toaster />
                </SidebarProvider>
              </AuthProvider>
            </I18nProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
