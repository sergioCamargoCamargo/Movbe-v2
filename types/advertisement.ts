import { UserType } from './user'

export interface Advertisement {
  id: string
  title: string
  description: string
  imageUrl: string
  ctaText: string
  sponsor: string
  type: AdType
  size: AdSize
  targetAudience?: string[]
  isActive: boolean
  clickCount: number
  impressionCount: number
}

export type AdType = 'banner' | 'video' | 'interactive' | 'watermark'
export type AdSize = 'small' | 'medium' | 'large' | 'fullwidth'

export interface ContactForm {
  name: string
  email: string
  userType: UserType
  subject: string
  message: string
  submittedAt: Date
  status: 'pending' | 'in_progress' | 'resolved'
}
