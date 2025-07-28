'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  trackPageView,
  trackEvent,
  trackVideoEvent,
  trackUserInteraction,
  trackAuthEvent,
  trackSearchEvent,
  trackUploadEvent,
  trackSubscriptionEvent,
  trackShareEvent,
  trackPerformanceEvent,
  trackError,
} from '@/lib/analytics/google-analytics'

export const useAnalytics = () => {
  const pathname = usePathname()

  // Track page views
  const trackPage = useCallback(
    (title?: string) => {
      trackPageView(pathname, title)
    },
    [pathname]
  )

  // Track custom events
  const trackCustomEvent = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      trackEvent(action, category, label, value)
    },
    []
  )

  // Track video events
  const trackVideo = useCallback(
    (
      action: 'play' | 'pause' | 'ended' | 'seek',
      videoId: string,
      duration?: number,
      currentTime?: number
    ) => {
      trackVideoEvent(action, videoId, duration, currentTime)
    },
    []
  )

  // Track user interactions
  const trackInteraction = useCallback(
    (action: string, element: string, details?: Record<string, unknown>) => {
      trackUserInteraction(action, element, details)
    },
    []
  )

  // Track authentication events
  const trackAuth = useCallback((action: 'login' | 'register' | 'logout', method?: string) => {
    trackAuthEvent(action, method)
  }, [])

  // Track search events
  const trackSearch = useCallback((searchTerm: string, resultCount?: number) => {
    trackSearchEvent(searchTerm, resultCount)
  }, [])

  // Track upload events
  const trackUpload = useCallback(
    (action: 'start' | 'complete' | 'error', fileSize?: number, duration?: number) => {
      trackUploadEvent(action, fileSize, duration)
    },
    []
  )

  // Track subscription events
  const trackSubscription = useCallback(
    (action: 'subscribe' | 'unsubscribe', channelId: string) => {
      trackSubscriptionEvent(action, channelId)
    },
    []
  )

  // Track share events
  const trackShare = useCallback(
    (platform: string, contentType: 'video' | 'profile', contentId: string) => {
      trackShareEvent(platform, contentType, contentId)
    },
    []
  )

  // Track performance events
  const trackPerformance = useCallback((metric: string, value: number, label?: string) => {
    trackPerformanceEvent(metric, value, label)
  }, [])

  // Track errors
  const trackAppError = useCallback((error: string, location: string, fatal: boolean = false) => {
    trackError(error, location, fatal)
  }, [])

  return {
    trackPage,
    trackCustomEvent,
    trackVideo,
    trackInteraction,
    trackAuth,
    trackSearch,
    trackUpload,
    trackSubscription,
    trackShare,
    trackPerformance,
    trackAppError,
  }
}
