const firebaseAdmin = require('../config/firebase');
const { Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * Notification Service
 * Handles sending notifications via FCM and storing them in database
 */
class NotificationService {
  /**
   * Send notification to a single user
   */
  async sendToUser(userId, notification, data = {}, fcmToken = null) {
    try {
      // Store notification in database
      const notificationDoc = new Notification({
        userId,
        title: notification.title,
        message: notification.body, // Fix: use 'message' instead of 'body'
        data,
        type: data.type || 'general',
        isRead: false
      });

      await notificationDoc.save();

      // Send FCM notification if token is provided and FCM is enabled
      if (fcmToken && firebaseAdmin.isReady()) {
        try {
          const fcmResult = await firebaseAdmin.sendToDevice(fcmToken, notification, {
            ...data,
            notificationId: notificationDoc._id.toString()
          });

          // Update notification with FCM message ID
          notificationDoc.fcmMessageId = fcmResult.messageId;
          notificationDoc.fcmStatus = 'sent';
          await notificationDoc.save();

          logger.info('Notification sent successfully', {
            userId,
            notificationId: notificationDoc._id,
            fcmMessageId: fcmResult.messageId
          });
        } catch (fcmError) {
          logger.error('FCM notification failed:', fcmError);
          notificationDoc.fcmStatus = 'failed';
          notificationDoc.fcmError = fcmError.message;
          await notificationDoc.save();
        }
      }

      return {
        success: true,
        notificationId: notificationDoc._id,
        notification: notificationDoc
      };
    } catch (error) {
      logger.error('Send notification failed:', error);
      throw new Error('Failed to send notification');
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(userIds, notification, data = {}, fcmTokens = []) {
    try {
      const results = [];
      const notifications = [];

      // Create notifications in database
      for (const userId of userIds) {
        const notificationDoc = new Notification({
          userId,
          title: notification.title,
          body: notification.body,
          data,
          type: data.type || 'general',
          isRead: false
        });

        notifications.push(notificationDoc);
      }

      // Bulk insert notifications
      const savedNotifications = await Notification.insertMany(notifications);

      // Send FCM notifications if tokens are provided and FCM is enabled
      if (fcmTokens.length > 0 && firebaseAdmin.isReady()) {
        try {
          const fcmData = {
            ...data,
            batchId: Date.now().toString()
          };

          const fcmResult = await firebaseAdmin.sendToMultipleDevices(
            fcmTokens, 
            notification, 
            fcmData
          );

          logger.info('Batch notification sent', {
            totalUsers: userIds.length,
            fcmTokens: fcmTokens.length,
            successCount: fcmResult.successCount,
            failureCount: fcmResult.failureCount
          });

          results.push({
            success: true,
            fcmResult,
            notifications: savedNotifications
          });
        } catch (fcmError) {
          logger.error('Batch FCM notification failed:', fcmError);
          results.push({
            success: false,
            error: fcmError.message,
            notifications: savedNotifications
          });
        }
      } else {
        results.push({
          success: true,
          notifications: savedNotifications
        });
      }

      return results;
    } catch (error) {
      logger.error('Send batch notification failed:', error);
      throw new Error('Failed to send batch notification');
    }
  }

  /**
   * Send notification to a topic (e.g., all farmers, all vendors)
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      if (!firebaseAdmin.isReady()) {
        throw new Error('Firebase not initialized');
      }

      const fcmResult = await firebaseAdmin.sendToTopic(topic, notification, data);

      logger.info('Topic notification sent', {
        topic,
        messageId: fcmResult.messageId
      });

      return {
        success: true,
        messageId: fcmResult.messageId,
        topic
      };
    } catch (error) {
      logger.error('Send topic notification failed:', error);
      throw new Error('Failed to send topic notification');
    }
  }

  /**
   * Subscribe user to a topic
   */
  async subscribeToTopic(fcmTokens, topic) {
    try {
      if (!firebaseAdmin.isReady()) {
        throw new Error('Firebase not initialized');
      }

      const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
      const result = await firebaseAdmin.subscribeToTopic(tokens, topic);

      logger.info('Users subscribed to topic', {
        topic,
        successCount: result.successCount,
        failureCount: result.failureCount
      });

      return result;
    } catch (error) {
      logger.error('Subscribe to topic failed:', error);
      throw new Error('Failed to subscribe to topic');
    }
  }

  /**
   * Unsubscribe user from a topic
   */
  async unsubscribeFromTopic(fcmTokens, topic) {
    try {
      if (!firebaseAdmin.isReady()) {
        throw new Error('Firebase not initialized');
      }

      const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
      const result = await firebaseAdmin.unsubscribeFromTopic(tokens, topic);

      logger.info('Users unsubscribed from topic', {
        topic,
        successCount: result.successCount,
        failureCount: result.failureCount
      });

      return result;
    } catch (error) {
      logger.error('Unsubscribe from topic failed:', error);
      throw new Error('Failed to unsubscribe from topic');
    }
  }

  /**
   * Send order update notification
   */
  async sendOrderUpdate(userId, orderId, status, fcmToken = null) {
    const notification = {
      title: 'Order Update',
      body: `Your order #${orderId} is now ${status}`
    };

    const data = {
      type: 'order_update',
      orderId: orderId.toString(),
      status
    };

    return await this.sendToUser(userId, notification, data, fcmToken);
  }

  /**
   * Send vendor nearby notification
   */
  async sendVendorNearby(userId, vendorName, distance, fcmToken = null) {
    const notification = {
      title: 'Vendor Nearby',
      body: `${vendorName} is ${distance}m away from you`
    };

    const data = {
      type: 'vendor_nearby',
      vendorName,
      distance: distance.toString()
    };

    return await this.sendToUser(userId, notification, data, fcmToken);
  }

  /**
   * Send ML analysis complete notification
   */
  async sendMLComplete(userId, analysisType, result, fcmToken = null) {
    const notification = {
      title: 'Analysis Complete',
      body: `Your ${analysisType} analysis is ready`
    };

    const data = {
      type: 'ml_complete',
      analysisType,
      result: JSON.stringify(result)
    };

    return await this.sendToUser(userId, notification, data, fcmToken);
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(userId, title, body, fcmToken = null) {
    const notification = { title, body };
    const data = { type: 'system' };

    return await this.sendToUser(userId, notification, data, fcmToken);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      logger.error('Get user notifications failed:', error);
      throw new Error('Failed to retrieve notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      logger.error('Mark notification as read failed:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      logger.info('All notifications marked as read', {
        userId,
        modifiedCount: result.modifiedCount
      });

      return result;
    } catch (error) {
      logger.error('Mark all notifications as read failed:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
}

module.exports = new NotificationService();