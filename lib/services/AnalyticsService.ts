import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { IAnalyticsService } from '@/lib/types'
import { Analytics, ViewData, Demographics, TopVideo } from '@/lib/types/entities/analytics'

export class AnalyticsService implements IAnalyticsService {
  async getUserAnalytics(userId: string): Promise<Analytics | null> {
    try {
      // Get user profile for basic stats
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) return null

      const userData = userDoc.data()

      // Get view analytics
      const viewData = await this.getViewData(userId, '30d')
      const totalViews = viewData.reduce((sum, day) => sum + day.views, 0)

      // Get demographics
      const demographics = await this.getDemographics(userId)

      // Get top videos
      const topVideos = await this.getTopVideos(userId, 5)

      // Calculate average watch time from recent views
      const avgWatchTime = await this.calculateAverageWatchTime(userId)

      return {
        userId,
        totalViews: userData.totalViews || totalViews,
        totalVideos: userData.videoCount || 0,
        totalSubscribers: userData.subscriberCount || 0,
        averageWatchTime: avgWatchTime,
        topVideos,
        viewHistory: viewData,
        demographics: demographics || {
          ageGroups: [],
          locations: [],
          devices: [],
        },
      }
    } catch {
      // Error getting user analytics
      return null
    }
  }

  async recordView(videoId: string, userId?: string, watchTime?: number): Promise<boolean> {
    try {
      const viewData = {
        videoId,
        userId: userId || null,
        watchTime: watchTime || 0,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      }

      // Record the view
      await addDoc(collection(db, 'videoViews'), viewData)

      // Update video view count
      const videoRef = doc(db, 'videos', videoId)
      await updateDoc(videoRef, {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      })

      // Update user total views if user is authenticated
      if (userId) {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          totalViews: increment(1),
        })
      }

      return true
    } catch {
      // Error recording view
      return false
    }
  }

  async getViewData(userId: string, timeRange: string): Promise<ViewData[]> {
    try {
      const days = this.getTimeRangeDays(timeRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get user's videos first
      const videosQuery = query(collection(db, 'videos'), where('uploaderId', '==', userId))
      const videosSnap = await getDocs(videosQuery)
      const videoIds = videosSnap.docs.map(doc => doc.id)

      if (videoIds.length === 0) {
        return this.generateEmptyViewData(days)
      }

      // Get views for user's videos in batches to avoid compound index
      const allViews: Array<Record<string, unknown>> = []

      // Process videos in batches of 10 (Firestore 'in' limit)
      for (let i = 0; i < videoIds.length; i += 10) {
        const batch = videoIds.slice(i, i + 10)
        const viewsQuery = query(
          collection(db, 'videoViews'),
          where('videoId', 'in', batch),
          limit(200) // Limit per batch
        )

        const viewsSnap = await getDocs(viewsQuery)
        const batchViews = viewsSnap.docs
          .map(doc => doc.data())
          .filter(view => {
            const viewDate = view.timestamp?.toDate?.() || new Date((view.date as string) || '')
            return viewDate >= startDate
          })

        allViews.push(...batchViews)
      }

      // Sort by timestamp descending (client-side)
      const views = allViews.sort((a, b) => {
        const aTimestamp = a.timestamp as { toDate?: () => Date } | undefined
        const bTimestamp = b.timestamp as { toDate?: () => Date } | undefined
        const aDate = aTimestamp?.toDate?.() || new Date((a.date as string) || '')
        const bDate = bTimestamp?.toDate?.() || new Date((b.date as string) || '')
        return bDate.getTime() - aDate.getTime()
      })

      // Group views by date
      const viewsByDate = new Map<
        string,
        { views: number; users: Set<string>; watchTime: number }
      >()

      views.forEach(view => {
        const timestamp = view.timestamp as { toDate?: () => Date } | undefined
        const date =
          (view.date as string) ||
          new Date(timestamp?.toDate?.() || new Date()).toISOString().split('T')[0]
        const existing = viewsByDate.get(date) || { views: 0, users: new Set(), watchTime: 0 }

        existing.views++
        if (view.userId) existing.users.add(view.userId as string)
        existing.watchTime += (view.watchTime as number) || 0

        viewsByDate.set(date, existing)
      })

      // Generate array for the requested time range
      const result: ViewData[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayData = viewsByDate.get(dateStr) || { views: 0, users: new Set(), watchTime: 0 }

        result.push({
          date: dateStr,
          views: dayData.views,
          users: dayData.users.size,
          watchTime: dayData.watchTime,
        })
      }

      return result
    } catch {
      // Error getting view data
      return this.generateEmptyViewData(this.getTimeRangeDays(timeRange))
    }
  }

  async getDemographics(userId: string): Promise<Demographics | null> {
    try {
      // Get user's videos
      const videosQuery = query(collection(db, 'videos'), where('uploaderId', '==', userId))
      const videosSnap = await getDocs(videosQuery)
      const videoIds = videosSnap.docs.map(doc => doc.id)

      if (videoIds.length === 0) return null

      // Get views with user data for demographics
      // Split into multiple queries to avoid compound index requirements
      const allViews: Array<Record<string, unknown>> = []

      // Process videos in batches of 10 (Firestore 'in' limit)
      for (let i = 0; i < videoIds.length; i += 10) {
        const batch = videoIds.slice(i, i + 10)
        const viewsQuery = query(
          collection(db, 'videoViews'),
          where('videoId', 'in', batch),
          limit(100) // Limit per batch
        )

        const viewsSnap = await getDocs(viewsQuery)
        const batchViews = viewsSnap.docs.map(doc => doc.data()).filter(view => view.userId) // Filter for users only

        allViews.push(...batchViews)
      }

      const userIds = [...new Set(allViews.map(view => view.userId as string).filter(Boolean))]

      // TODO: Implement real demographics collection
      // To implement real demographics, you would need to:
      // 1. Add age, location, deviceType fields to user profiles during registration
      // 2. Collect device info from user-agent or client detection
      // 3. Query user profiles for viewers and aggregate the data
      // 4. Store demographic data in videoViews collection for faster queries
      //
      // Example implementation:
      // const userProfiles = await getDocs(query(collection(db, 'users'), where('uid', 'in', userIds)))
      // const demographics = aggregateDemographics(userProfiles.docs.map(doc => doc.data()))

      if (userIds.length === 0) {
        return {
          ageGroups: [],
          locations: [],
          devices: [],
        }
      }

      // Return null to indicate demographics are not available yet
      // instead of fake data
      return null
    } catch {
      // Error getting demographics
      return null
    }
  }

  async exportAnalytics(userId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const analytics = await this.getUserAnalytics(userId)

    if (format === 'json') {
      return new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' })
    }

    if (format === 'csv') {
      const csv = this.convertToCSV(analytics)
      return new Blob([csv], { type: 'text/csv' })
    }

    // PDF export would require additional library
    throw new Error('PDF export not implemented yet')
  }

  async getTopVideos(userId: string, videoLimit = 10): Promise<TopVideo[]> {
    try {
      const videosQuery = query(collection(db, 'videos'), where('uploaderId', '==', userId))

      const videosSnap = await getDocs(videosQuery)

      // Sort and limit on client side to avoid index issues
      const videos = videosSnap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title || 'Sin título',
          views: data.viewCount || 0,
          duration: this.formatDuration(data.duration || 0),
          uploadDate: data.uploadDate ? data.uploadDate.toDate() : new Date(),
        }
      })

      // Sort by views descending and limit
      return videos.sort((a, b) => b.views - a.views).slice(0, videoLimit)
    } catch {
      // Error getting top videos
      return []
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  async getRevenue(userId: string, timeRange: string): Promise<number> {
    try {
      // This would integrate with payment/monetization system
      // For now, return calculated revenue based on views
      const viewData = await this.getViewData(userId, timeRange)
      const totalViews = viewData.reduce((sum, day) => sum + day.views, 0)

      // Estimate: $1-3 per 1000 views (realistic YouTube-like rates)
      const revenuePerThousandViews = 2.5
      return (totalViews / 1000) * revenuePerThousandViews
    } catch {
      // Error getting revenue
      return 0
    }
  }

  private async calculateAverageWatchTime(userId: string): Promise<number> {
    try {
      const videosQuery = query(collection(db, 'videos'), where('uploaderId', '==', userId))
      const videosSnap = await getDocs(videosQuery)
      const videoIds = videosSnap.docs.map(doc => doc.id)

      if (videoIds.length === 0) return 0

      // Get views in batches to avoid compound index
      const allWatchTimes: number[] = []

      // Process videos in batches of 10 (Firestore 'in' limit)
      for (let i = 0; i < videoIds.length; i += 10) {
        const batch = videoIds.slice(i, i + 10)
        const viewsQuery = query(
          collection(db, 'videoViews'),
          where('videoId', 'in', batch),
          limit(100) // Limit per batch
        )

        const viewsSnap = await getDocs(viewsQuery)
        const batchWatchTimes = viewsSnap.docs
          .map(doc => doc.data().watchTime || 0)
          .filter(watchTime => watchTime > 0)

        allWatchTimes.push(...batchWatchTimes)
      }

      const watchTimes = allWatchTimes

      if (watchTimes.length === 0) return 0

      const total = watchTimes.reduce((sum, time) => sum + time, 0)
      return Math.round(total / watchTimes.length)
    } catch {
      // Error calculating average watch time
      return 0
    }
  }

  private getTimeRangeDays(timeRange: string): number {
    switch (timeRange) {
      case '24h':
        return 1
      case '7d':
        return 7
      case '30d':
        return 30
      case '90d':
        return 90
      case '1y':
        return 365
      default:
        return 7
    }
  }

  private generateEmptyViewData(days: number): ViewData[] {
    const result: ViewData[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      result.push({
        date: date.toISOString().split('T')[0],
        views: 0,
        users: 0,
        watchTime: 0,
      })
    }
    return result
  }

  private convertToCSV(analytics: Analytics | null): string {
    if (!analytics) return ''

    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Views', analytics.totalViews.toString()],
      ['Total Videos', analytics.totalVideos.toString()],
      ['Total Subscribers', analytics.totalSubscribers.toString()],
      ['Average Watch Time (seconds)', analytics.averageWatchTime.toString()],
    ]

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }
}
