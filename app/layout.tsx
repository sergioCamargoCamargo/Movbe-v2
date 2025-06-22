import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YourTube',
  description: 'Your video platform',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
