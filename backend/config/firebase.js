const admin = require('firebase-admin');
const logger = require('../utils/logger');

class FirebaseAdmin {
  constructor() {
    this.app = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize() {
    try {
      // Check if FCM is enabled
      if (process.env.FEATURES_FCM_ENABLED !== 'true') {
        logger.info('FCM is disabled, skipping Firebase initialization');
        return null;
      }

      // Check if already initialized
      if (this.isInitialized && this.app) {
        return this.app;
      }

      let serviceAccount;

      // Option 1: Use service account key file path
      if (process.env.FCM_SERVICE_ACCOUNT_KEY_PATH) {
        try {
          serviceAccount = require(`../${process.env.FCM_SERVICE_ACCOUNT_KEY_PATH}`);
          logger.info('Using Firebase service account key file');
        } catch (error) {
          logger.warn('Failed to load service account key file:', error.message);
        }
      }

      // Option 2: Use individual environment variables
      if (!serviceAccount) {
        if (process.env.FCM_PROJECT_ID && process.env.FCM_PRIVATE_KEY && process.env.FCM_CLIENT_EMAIL) {
          serviceAccount = {
            type: 'service_account',
            project_id: process.env.FCM_PROJECT_ID,
            private_key_id: process.env.FCM_PRIVATE_KEY_ID,
            private_key: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FCM_CLIENT_EMAIL,
            client_id: process.env.FCM_CLIENT_ID,
            auth_uri: process.env.FCM_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
            token_uri: process.env.FCM_TOKEN_URI || 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: process.env.FCM_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs'
          };
          logger.info('Using Firebase service account from environment variables');
        }
      }

      if (!serviceAccount) {
        throw new Error('Firebase service account credentials not found');
      }

      // Initialize Firebase Admin
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      this.isInitialized = true;
      logger.info('Firebase Admin SDK initialized successfully', {
        projectId: serviceAccount.project_id
      });

      return this.app;
    } catch (error) {
      logger.error('Firebase initialization failed:', error);
      this.isInitialized = false;
      
      // Don't throw error in development to allow server to start
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      
      return null;
    }
  }

  /**
   * Get Firebase Admin app instance
   */
  getApp() {
    if (!this.isInitialized) {
      return this.initialize();
    }
    return this.app;
  }

  /**
   * Get Firebase Messaging instance
   */
  getMessaging() {
    const app = this.getApp();
    if (!app) {
      throw new Error('Firebase not initialized');
    }
    return admin.messaging(app);
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(token, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.send(message);
      logger.info('Notification sent successfully', {
        messageId: response,
        token: token.substring(0, 20) + '...'
      });

      return { success: true, messageId: response };
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.sendMulticast(message);
      logger.info('Batch notification sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      logger.error('Failed to send batch notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      const messaging = this.getMessaging();
      
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await messaging.send(message);
      logger.info('Topic notification sent successfully', {
        messageId: response,
        topic
      });

      return { success: true, messageId: response };
    } catch (error) {
      logger.error('Failed to send topic notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens, topic) {
    try {
      const messaging = this.getMessaging();
      const response = await messaging.subscribeToTopic(tokens, topic);
      
      logger.info('Tokens subscribed to topic', {
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return response;
    } catch (error) {
      logger.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const messaging = this.getMessaging();
      const response = await messaging.unsubscribeFromTopic(tokens, topic);
      
      logger.info('Tokens unsubscribed from topic', {
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return response;
    } catch (error) {
      logger.error('Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  /**
   * Check if Firebase is initialized and ready
   */
  isReady() {
    return this.isInitialized && this.app !== null;
  }
}

// Create singleton instance
const firebaseAdmin = new FirebaseAdmin();

module.exports = firebaseAdmin;