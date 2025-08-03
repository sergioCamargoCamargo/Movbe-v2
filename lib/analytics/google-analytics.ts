// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
    dataLayer: unknown[]
  }
}

export const GA_TRACKING_ID = 'G-B4QXKFRJLZ'

// Initialize Google Analytics
export const initializeGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track video events
export const trackVideoEvent = (
  action: 'play' | 'pause' | 'ended' | 'seek',
  videoId: string,
  duration?: number,
  currentTime?: number
) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: 'Video',
      event_label: videoId,
      video_duration: duration,
      video_current_time: currentTime,
    })
  }
}

// Track user interactions
export const trackUserInteraction = (
  action: string,
  element: string,
  details?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      event_label: element,
      custom_parameters: details,
    })
  }
}

// Track authentication events
export const trackAuthEvent = (
  action:
    | 'login'
    | 'register'
    | 'logout'
    | '2fa_required'
    | '2fa_setup_start'
    | '2fa_setup_complete'
    | '2fa_disabled'
    | '2fa_verification_success'
    | '2fa_cancelled'
    | '2fa_verification_cancelled',
  method?: string
) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: 'Authentication',
      method: method,
    })
  }
}

// Track search events
export const trackSearchEvent = (searchTerm: string, resultCount?: number) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      event_category: 'Search',
      custom_parameters: {
        result_count: resultCount,
      },
    })
  }
}

// Track upload events
export const trackUploadEvent = (
  action: 'start' | 'complete' | 'error',
  fileSize?: number,
  duration?: number
) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: 'Upload',
      custom_parameters: {
        file_size: fileSize,
        video_duration: duration,
      },
    })
  }
}

// Track subscription events
export const trackSubscriptionEvent = (action: 'subscribe' | 'unsubscribe', channelId: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: 'Subscription',
      event_label: channelId,
    })
  }
}

// Track share events
export const trackShareEvent = (
  platform: string,
  contentType: 'video' | 'profile',
  contentId: string
) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', 'share', {
      event_category: 'Social',
      method: platform,
      content_type: contentType,
      item_id: contentId,
    })
  }
}

// Track performance events
export const trackPerformanceEvent = (metric: string, value: number, label?: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: value,
      event_category: 'Performance',
      event_label: label,
    })
  }
}

// Track errors
export const trackError = (error: string, location: string, fatal: boolean = false) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: fatal,
      event_category: 'Error',
      event_label: location,
    })
  }
}
