import { Notification, NotificationType } from '@/types'

export interface INotificationService {
  getUserNotifications(userId: string): Promise<Notification[]>
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<Notification>
  markAsRead(notificationId: string): Promise<boolean>
  markAllAsRead(userId: string): Promise<boolean>
  deleteNotification(notificationId: string): Promise<boolean>
  sendPushNotification(userId: string, notification: Notification): Promise<boolean>
  sendEmailNotification(userId: string, notification: Notification): Promise<boolean>
}
