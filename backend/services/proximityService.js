const { User } = require('../models');
const locationService = require('./locationService');
const notificationService = require('./notificationService');
const socketHandler = require('../socket/socketHandler');
const logger = require('../utils/logger');

/**
 * Proximity Detection Service
 * Handles proximity-based notifications when vendors are near consumers
 */
class ProximityService {
  constructor() {
    this.recentNotifications = new Map(); // Track recent notifications to prevent spam
    this.notificationCooldown = 5 * 60 * 1000; // 5 minutes cooldown between notifications
    this.loggedInvalidVendors = new Set(); // Track logged invalid vendors to prevent flooding
  }

  /**
   * Check proximity and notify consumers when a vendor updates location
   */
  async checkProximityAndNotify(vendorId, longitude, latitude) {
    try {
      logger.info('Starting proximity check', {
        vendorId,
        coordinates: [longitude, latitude]
      });

      // Get vendor information
      const vendor = await User.findById(vendorId).select('name role isActive');
      if (!vendor || vendor.role !== 'vendor' || !vendor.isActive) {
        // Only log this warning once per vendor ID to prevent flooding
        if (!this.loggedInvalidVendors) {
          this.loggedInvalidVendors = new Set();
        }
        if (!this.loggedInvalidVendors.has(vendorId)) {
          logger.warn('Invalid vendor for proximity check', { vendorId, vendor });
          this.loggedInvalidVendors.add(vendorId);
        }
        return { success: false, reason: 'Invalid vendor' };
      }

      // Find nearby consumers eligible for notifications
      const maxSearchRadius = 5000; // 5km maximum search radius
      const nearbyConsumers = await User.findEligibleForProximityNotifications(
        longitude, 
        latitude, 
        maxSearchRadius
      );

      logger.info('Found nearby consumers', {
        vendorId,
        consumerCount: nearbyConsumers.length
      });

      const notificationResults = [];

      for (const consumer of nearbyConsumers) {
        try {
          // Calculate actual distance
          const distance = locationService.calculateDistance(
            consumer.location.coordinates[1], // consumer latitude
            consumer.location.coordinates[0], // consumer longitude
            latitude, // vendor latitude
            longitude  // vendor longitude
          );

          // Check if consumer should receive notification based on their preferences
          if (!consumer.shouldReceiveProximityNotifications(distance)) {
            logger.debug('Consumer not eligible for notification', {
              consumerId: consumer._id,
              distance,
              preferences: consumer.notificationPreferences?.proximityNotifications
            });
            continue;
          }

          // Check cooldown to prevent spam
          const notificationKey = `${vendorId}-${consumer._id}`;
          const lastNotification = this.recentNotifications.get(notificationKey);
          if (lastNotification && (Date.now() - lastNotification) < this.notificationCooldown) {
            logger.debug('Notification in cooldown period', {
              vendorId,
              consumerId: consumer._id,
              lastNotification: new Date(lastNotification)
            });
            continue;
          }

          // Send proximity notification
          const notificationResult = await this.sendProximityNotification(
            consumer,
            vendor,
            distance,
            longitude,
            latitude
          );

          if (notificationResult.success) {
            // Update cooldown tracker
            this.recentNotifications.set(notificationKey, Date.now());
            
            // Send real-time notification via Socket.io
            this.broadcastProximityNotification(consumer._id, vendor, distance);
          }

          notificationResults.push({
            consumerId: consumer._id,
            distance: Math.round(distance),
            notificationSent: notificationResult.success,
            notificationId: notificationResult.notificationId
          });

        } catch (consumerError) {
          logger.error('Failed to process consumer for proximity notification', {
            vendorId,
            consumerId: consumer._id,
            error: consumerError.message
          });
        }
      }

      // Clean up old cooldown entries (older than cooldown period)
      this.cleanupCooldownTracker();

      logger.info('Proximity check completed', {
        vendorId,
        totalConsumers: nearbyConsumers.length,
        notificationsSent: notificationResults.filter(r => r.notificationSent).length
      });

      return {
        success: true,
        vendorId,
        vendorName: vendor.name,
        coordinates: [longitude, latitude],
        consumersFound: nearbyConsumers.length,
        notificationResults
      };

    } catch (error) {
      logger.error('Proximity check failed', {
        vendorId,
        coordinates: [longitude, latitude],
        error: error.message
      });
      throw new Error('Proximity check failed');
    }
  }

  /**
   * Send proximity notification to a consumer
   */
  async sendProximityNotification(consumer, vendor, distance, vendorLongitude, vendorLatitude) {
    try {
      // Get vendor's available products
      const { Product } = require('../models');
      const availableProducts = await Product.find({
        sellerId: vendor._id,
        isActive: true,
        availableQuantity: { $gt: 0 }
      }).limit(5).select('name category price unit');

      // Enhanced notification with more details
      const distanceInMeters = Math.round(distance);
      const estimatedArrival = this.calculateEstimatedArrival(distance);
      const productNames = availableProducts.map(p => p.name).slice(0, 3);

      const notification = {
        title: 'Vendor Nearby',
        body: productNames.length > 0 
          ? `${vendor.name} is ${distanceInMeters}m away with ${productNames.join(', ')}${productNames.length < availableProducts.length ? ' and more' : ''}`
          : `${vendor.name} is ${distanceInMeters}m away • Estimated arrival: ${estimatedArrival}`
      };

      const data = {
        type: 'vendor_nearby',
        vendorId: vendor._id.toString(),
        vendorName: vendor.name,
        distance: distanceInMeters.toString(),
        estimatedArrival,
        products: availableProducts.map(p => ({
          id: p._id.toString(),
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit
        })),
        productCount: availableProducts.length,
        vendorLocation: {
          longitude: vendorLongitude,
          latitude: vendorLatitude
        },
        consumerLocation: {
          longitude: consumer.location.coordinates[0],
          latitude: consumer.location.coordinates[1]
        },
        timestamp: new Date().toISOString()
      };

      // Use existing notification service
      const result = await notificationService.sendToUser(
        consumer._id,
        notification,
        data
      );

      logger.info('Proximity notification sent', {
        consumerId: consumer._id,
        vendorId: vendor._id,
        distance: distanceInMeters,
        productCount: availableProducts.length,
        notificationId: result.notificationId
      });

      return result;

    } catch (error) {
      logger.error('Failed to send proximity notification', {
        consumerId: consumer._id,
        vendorId: vendor._id,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast real-time proximity notification via Socket.io
   */
  async broadcastProximityNotification(consumerId, vendor, distance) {
    try {
      if (!socketHandler.getIO()) {
        logger.warn('Socket.io not available for real-time notification');
        return;
      }

      // Get vendor's available products for real-time notification
      const { Product } = require('../models');
      const availableProducts = await Product.find({
        sellerId: vendor._id,
        isActive: true,
        availableQuantity: { $gt: 0 }
      }).limit(3).select('name category price unit');

      const proximityData = {
        type: 'vendor-nearby',
        vendorId: vendor._id.toString(),
        vendorName: vendor.name,
        distance: Math.round(distance),
        products: availableProducts.map(p => ({
          id: p._id.toString(),
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit
        })),
        productCount: availableProducts.length,
        hasProducts: availableProducts.length > 0,
        timestamp: new Date().toISOString()
      };

      // Send to specific consumer
      socketHandler.getIO().to(`user:${consumerId}`).emit('vendor-nearby', proximityData);

      logger.debug('Real-time proximity notification broadcasted', {
        consumerId,
        vendorId: vendor._id,
        distance: Math.round(distance),
        productCount: availableProducts.length
      });

    } catch (error) {
      logger.error('Failed to broadcast proximity notification', {
        consumerId,
        vendorId: vendor._id,
        error: error.message
      });
    }
  }

  /**
   * Calculate estimated arrival time based on distance
   */
  calculateEstimatedArrival(distanceInMeters) {
    // Assume average walking speed of 5 km/h for vendors
    const walkingSpeedKmh = 5;
    const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600; // meters per second
    
    const timeInSeconds = distanceInMeters / walkingSpeedMs;
    const timeInMinutes = Math.ceil(timeInSeconds / 60);

    if (timeInMinutes < 1) {
      return 'Less than 1 minute';
    } else if (timeInMinutes === 1) {
      return '1 minute';
    } else if (timeInMinutes < 60) {
      return `${timeInMinutes} minutes`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Clean up old cooldown entries to prevent memory leaks
   */
  cleanupCooldownTracker() {
    const now = Date.now();
    const cutoffTime = now - this.notificationCooldown;

    for (const [key, timestamp] of this.recentNotifications.entries()) {
      if (timestamp < cutoffTime) {
        this.recentNotifications.delete(key);
      }
    }
  }

  /**
   * Get proximity statistics
   */
  async getProximityStats() {
    try {
      const stats = {
        activeCooldowns: this.recentNotifications.size,
        cooldownPeriodMinutes: this.notificationCooldown / (60 * 1000)
      };

      // Get consumer notification preferences stats
      const consumerStats = await User.aggregate([
        { $match: { role: 'consumer', isActive: true } },
        {
          $group: {
            _id: null,
            totalConsumers: { $sum: 1 },
            proximityEnabled: {
              $sum: {
                $cond: [
                  { $eq: ['$notificationPreferences.proximityNotifications.enabled', true] },
                  1,
                  0
                ]
              }
            },
            doNotDisturbEnabled: {
              $sum: {
                $cond: [
                  { $eq: ['$notificationPreferences.doNotDisturb', true] },
                  1,
                  0
                ]
              }
            },
            averageRadius: {
              $avg: '$notificationPreferences.proximityNotifications.radius'
            }
          }
        }
      ]);

      if (consumerStats.length > 0) {
        Object.assign(stats, consumerStats[0]);
        delete stats._id;
      }

      return stats;

    } catch (error) {
      logger.error('Failed to get proximity stats', error);
      throw new Error('Failed to retrieve proximity statistics');
    }
  }

  /**
   * Manual proximity check for testing
   */
  async manualProximityCheck(vendorId, consumerLocation) {
    try {
      const vendor = await User.findById(vendorId).select('name location role isActive');
      if (!vendor || vendor.role !== 'vendor' || !vendor.isActive) {
        throw new Error('Invalid vendor');
      }

      if (!vendor.location || !vendor.location.coordinates) {
        throw new Error('Vendor location not available');
      }

      const distance = locationService.calculateDistance(
        consumerLocation.latitude,
        consumerLocation.longitude,
        vendor.location.coordinates[1], // vendor latitude
        vendor.location.coordinates[0]  // vendor longitude
      );

      return {
        vendorId: vendor._id,
        vendorName: vendor.name,
        vendorLocation: vendor.location.coordinates,
        consumerLocation: [consumerLocation.longitude, consumerLocation.latitude],
        distance: Math.round(distance),
        estimatedArrival: this.calculateEstimatedArrival(distance)
      };

    } catch (error) {
      logger.error('Manual proximity check failed', error);
      throw new Error('Manual proximity check failed');
    }
  }
}

// Create singleton instance
const proximityService = new ProximityService();

module.exports = proximityService;