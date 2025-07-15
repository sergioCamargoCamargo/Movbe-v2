import { Subscription, SubscriptionRelation, SubscriptionStats } from '../../types'

export interface ISubscriptionService {
  subscribe(channelId: string, subscriberId: string): Promise<void>
  unsubscribe(channelId: string, subscriberId: string): Promise<void>
  isSubscribed(channelId: string, subscriberId: string): Promise<boolean>
  getSubscriptionRelation(channelId: string, subscriberId: string): Promise<SubscriptionRelation>
  getSubscribers(channelId: string): Promise<Subscription[]>
  getSubscriptions(subscriberId: string): Promise<Subscription[]>
  getSubscriberCount(channelId: string): Promise<number>
  getSubscriptionCount(subscriberId: string): Promise<number>
  getSubscriptionStats(userId: string): Promise<SubscriptionStats>
}
