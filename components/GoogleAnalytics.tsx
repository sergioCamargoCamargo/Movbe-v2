'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { initializeGA, GA_TRACKING_ID } from '@/lib/analytics/google-analytics'

export default function GoogleAnalytics() {
  useEffect(() => {
    if (GA_TRACKING_ID) {
      initializeGA()
    }
  }, [])

  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id='google-analytics'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
