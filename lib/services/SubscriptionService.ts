import { Subscription, SubscriptionRelation, SubscriptionStats } from '../../types'
import { ISubscriptionService } from '../interfaces/ISubscriptionService'
import { FirebaseRepository } from '../repositories/FirebaseRepository'

export class SubscriptionService implements ISubscriptionService {
  private subscriptionRepository: FirebaseRepository<Subscription>

  constructor() {
    this.subscriptionRepository = new FirebaseRepository<Subscription>('subscriptions')
  }

  async subscribe(channelId: string, subscriberId: string): Promise<void> {
    if (channelId === subscriberId) {
      throw new Error('Cannot subscribe to yourself')
    }

    const existingSubscription = await this.getSubscriptionDoc(channelId, subscriberId)
    if (existingSubscription) {
      throw new Error('Already subscribed')
    }

    const subscription: Omit<Subscription, 'id'> = {
      channelId,
      subscriberId,
      subscribedAt: new Date(),
    }

    await this.subscriptionRepository.add(subscription)
  }

  async unsubscribe(channelId: string, subscriberId: string): Promise<void> {
    const subscription = await this.getSubscriptionDoc(channelId, subscriberId)
    if (!subscription) {
      throw new Error('Not subscribed')
    }

    await this.subscriptionRepository.delete(subscription.id!)
  }

  async isSubscribed(channelId: string, subscriberId: string): Promise<boolean> {
    const subscription = await this.getSubscriptionDoc(channelId, subscriberId)
    return subscription !== null
  }

  async getSubscriptionRelation(
    channelId: string,
    subscriberId: string
  ): Promise<SubscriptionRelation> {
    const subscription = await this.getSubscriptionDoc(channelId, subscriberId)

    if (subscription) {
      return {
        isSubscribed: true,
        subscribedAt: subscription.subscribedAt,
      }
    }

    return {
      isSubscribed: false,
    }
  }

  async getSubscribers(channelId: string): Promise<Subscription[]> {
    return await this.subscriptionRepository.findAll({
      where: [{ field: 'channelId', operator: '==', value: channelId }],
      orderBy: [{ field: 'subscribedAt', direction: 'desc' }],
    })
  }

  async getSubscriptions(subscriberId: string): Promise<Subscription[]> {
    return await this.subscriptionRepository.findAll({
      where: [{ field: 'subscriberId', operator: '==', value: subscriberId }],
      orderBy: [{ field: 'subscribedAt', direction: 'desc' }],
    })
  }

  async getSubscriberCount(channelId: string): Promise<number> {
    const subscribers = await this.getSubscribers(channelId)
    return subscribers.length
  }

  async getSubscriptionCount(subscriberId: string): Promise<number> {
    const subscriptions = await this.getSubscriptions(subscriberId)
    return subscriptions.length
  }

  async getSubscriptionStats(userId: string): Promise<SubscriptionStats> {
    const [subscriberCount, subscriptionCount] = await Promise.all([
      this.getSubscriberCount(userId),
      this.getSubscriptionCount(userId),
    ])

    return {
      subscriberCount,
      subscriptionCount,
    }
  }

  private async getSubscriptionDoc(
    channelId: string,
    subscriberId: string
  ): Promise<Subscription | null> {
    const subscriptions = await this.subscriptionRepository.findAll({
      where: [
        { field: 'channelId', operator: '==', value: channelId },
        { field: 'subscriberId', operator: '==', value: subscriberId },
      ],
      limit: 1,
    })

    return subscriptions.length > 0 ? subscriptions[0] : null
  }
}
