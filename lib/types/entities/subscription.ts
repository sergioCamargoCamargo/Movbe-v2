export interface Subscription {
  id?: string
  channelId: string
  subscriberId: string
  subscribedAt: Date
}

export interface SubscriptionStats {
  subscriberCount: number
  subscriptionCount: number
}

export interface SubscriptionRelation {
  isSubscribed: boolean
  subscribedAt?: Date
}
