import { Analytics, ViewData, Demographics, Video } from '@/types'

export interface IAnalyticsService {
  getUserAnalytics(userId: string): Promise<Analytics | null>
  recordView(videoId: string, userId?: string, watchTime?: number): Promise<boolean>
  getViewData(userId: string, timeRange: string): Promise<ViewData[]>
  getDemographics(userId: string): Promise<Demographics | null>
  exportAnalytics(userId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob>
  getTopVideos(userId: string, limit?: number): Promise<Video[]>
  getRevenue(userId: string, timeRange: string): Promise<number>
}