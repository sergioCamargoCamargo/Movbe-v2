import { Analytics, ViewData, Demographics } from '@/lib/types/entities/analytics'

export interface IAnalyticsService {
  getUserAnalytics(userId: string): Promise<Analytics | null>
  recordView(videoId: string, userId?: string, watchTime?: number): Promise<boolean>
  getViewData(userId: string, timeRange: string): Promise<ViewData[]>
  getDemographics(userId: string): Promise<Demographics | null>
  exportAnalytics(userId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob>
  getTopVideos(userId: string, limit?: number): Promise<TopVideo[]>
  getRevenue(userId: string, timeRange: string): Promise<number>
}

interface TopVideo {
  id: string
  title: string
  views: number
  duration: string
  uploadDate: Date
}
