import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Subscription } from '@/types/video'

export class SubscriptionService {
  private readonly subscriptionsCollection = 'subscriptions'
  private readonly usersCollection = 'users'

  async checkSubscription(subscriberId: string, channelId: string): Promise<boolean> {
    try {
      const subscriptionQuery = query(
        collection(db, this.subscriptionsCollection),
        where('subscriberId', '==', subscriberId),
        where('channelId', '==', channelId),
        where('status', '==', 'active')
      )

      const querySnapshot = await getDocs(subscriptionQuery)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false
    }
  }

  async subscribeToChannel(subscriberId: string, channelId: string): Promise<Subscription> {
    try {
      // Check if already subscribed
      const isSubscribed = await this.checkSubscription(subscriberId, channelId)
      if (isSubscribed) {
        throw new Error('Already subscribed to this channel')
      }

      // Get channel name
      const channelDoc = await getDoc(doc(db, this.usersCollection, channelId))
      const channelName = channelDoc.exists() 
        ? channelDoc.data().displayName || channelDoc.data().email || 'Canal'
        : 'Canal'

      const subscriptionData = {
        subscriberId,
        channelId,
        channelName,
        subscribedAt: serverTimestamp(),
        notificationsEnabled: true,
        status: 'active'
      }

      const docRef = await addDoc(collection(db, this.subscriptionsCollection), subscriptionData)

      return {
        id: docRef.id,
        subscriberId,
        channelId,
        channelName,
        subscribedAt: new Date(),
        notificationsEnabled: true,
        status: 'active'
      }
    } catch (error) {
      console.error('Error subscribing to channel:', error)
      throw new Error('Failed to subscribe to channel')
    }
  }

  async unsubscribeFromChannel(subscriberId: string, channelId: string): Promise<void> {
    try {
      const subscriptionQuery = query(
        collection(db, this.subscriptionsCollection),
        where('subscriberId', '==', subscriberId),
        where('channelId', '==', channelId),
        where('status', '==', 'active')
      )

      const querySnapshot = await getDocs(subscriptionQuery)
      
      if (querySnapshot.empty) {
        throw new Error('No active subscription found')
      }

      // Delete all matching subscriptions (should be only one)
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, this.subscriptionsCollection, docSnapshot.id))
      )

      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error unsubscribing from channel:', error)
      throw new Error('Failed to unsubscribe from channel')
    }
  }

  async getUserSubscriptions(subscriberId: string): Promise<Subscription[]> {
    try {
      const subscriptionsQuery = query(
        collection(db, this.subscriptionsCollection),
        where('subscriberId', '==', subscriberId),
        where('status', '==', 'active')
      )

      const querySnapshot = await getDocs(subscriptionsQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate() || new Date()
      } as Subscription))
    } catch (error) {
      console.error('Error fetching user subscriptions:', error)
      throw new Error('Failed to fetch subscriptions')
    }
  }

  async getChannelSubscribers(channelId: string): Promise<Subscription[]> {
    try {
      const subscribersQuery = query(
        collection(db, this.subscriptionsCollection),
        where('channelId', '==', channelId),
        where('status', '==', 'active')
      )

      const querySnapshot = await getDocs(subscribersQuery)
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate() || new Date()
      } as Subscription))
    } catch (error) {
      console.error('Error fetching channel subscribers:', error)
      throw new Error('Failed to fetch subscribers')
    }
  }

  async getSubscriberCount(channelId: string): Promise<number> {
    try {
      const subscribers = await this.getChannelSubscribers(channelId)
      return subscribers.length
    } catch (error) {
      console.error('Error getting subscriber count:', error)
      return 0
    }
  }
}
