export interface Analytics {
  userId: string
  totalViews: number
  totalVideos: number
  totalSubscribers: number
  averageWatchTime: number
  topVideos: TopVideo[]
  viewHistory: ViewData[]
  demographics: Demographics
}

export interface TopVideo {
  id: string
  title: string
  views: number
  duration: string
  uploadDate: Date
}

export interface ViewData {
  date: string
  views: number
  users: number
  watchTime: number
}

export interface Demographics {
  ageGroups: AgeGroup[]
  locations: Location[]
  devices: Device[]
}

export interface AgeGroup {
  range: string
  percentage: number
  count: number
}

export interface Location {
  country: string
  percentage: number
  count: number
}

export interface Device {
  type: 'mobile' | 'desktop' | 'tablet'
  percentage: number
  count: number
}
