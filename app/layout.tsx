import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Movbe',
  description: 'Your video platform',
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: '/logo_black.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=5' />
        <link
          rel='stylesheet'
          type='text/css'
          href='https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css'
        />
        <link
          rel='stylesheet'
          type='text/css'
          href='https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css'
        />
        <script
          src='https://cdn.jsdelivr.net/npm/react-slick@0.29.0/dist/react-slick.min.js'
          async
        ></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
