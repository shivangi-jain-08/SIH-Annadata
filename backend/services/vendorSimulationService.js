const { VendorSimulation } = require('../models');
const locationService = require('./locationService');
const logger = require('../utils/logger');

/**
 * Vendor Simulation Service
 * Handles creation and management of simulated vendors for testing proximity notifications
 */
class VendorSimulationService {
  constructor() {
    this.activeSimulations = new Map(); // simulationId -> interval
    this.updateInterval = 5000; // 5 seconds
    this.notificationCooldowns = new Map(); // Track recent notifications to prevent spam
    this.cooldownDuration = 300000; // 5 minutes cooldown between notifications for same vendor-consumer pair
    
    // Clean up old cooldown entries every 10 minutes
    setInterval(() => {
      this.cleanupCooldowns();
    }, 600000); // 10 minutes
  }

  /**
   * Create a new vendor simulation
   */
  async createSimulation(simulationData) {
    try {
      const {
        name,
        initialLocation,
        movementPattern = 'static',
        speed = 5,
        route = [],
        radius = 500,
        products = []
      } = simulationData;

      // Generate unique simulation ID
      const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Debug logging
      logger.info('Creating simulation with data:', {
        name,
        initialLocation,
        movementPattern,
        speed,
        route,
        radius,
        products
      });

      // Create simulation document
      const simulationDoc = {
        name,
        simulationId,
        currentLocation: {
          type: 'Point',
          coordinates: [initialLocation.longitude, initialLocation.latitude]
        },
        movementPattern,
        movementConfig: {
          speed,
          route: route && route.length > 0 ? route.map(point => ({
            coordinates: [point.longitude, point.latitude],
            waitTime: point.waitTime || 0
          })) : [],
          currentRouteIndex: 0,
          direction: Math.random() * 360, // Random initial direction
          radius,
          center: movementPattern === 'circular' ? [initialLocation.longitude, initialLocation.latitude] : null
        },
        products,
        isActive: true
      };

      logger.info('Simulation document prepared:', JSON.stringify(simulationDoc, null, 2));

      const simulation = new VendorSimulation(simulationDoc);
      await simulation.save();

      logger.info('Vendor simulation created', {
        simulationId,
        name,
        movementPattern,
        initialLocation
      });

      return {
        success: true,
        simulation: {
          simulationId: simulation.simulationId,
          name: simulation.name,
          currentLocation: simulation.currentLocation,
          movementPattern: simulation.movementPattern,
          isActive: simulation.isActive,
          createdAt: simulation.createdAt
        }
      };

    } catch (error) {
      logger.error('Failed to create vendor simulation', error);
      throw new Error('Failed to create vendor simulation');
    }
  }

  /**
   * Start simulation movement
   */
  async startSimulation(simulationId) {
    try {
      const simulation = await VendorSimulation.findOne({ simulationId, isActive: true });
      if (!simulation) {
        throw new Error('Simulation not found or inactive');
      }

      // Stop existing simulation if running
      this.stopSimulation(simulationId);

      // Start movement interval
      const interval = setInterval(async () => {
        try {
          await this.updateSimulationLocation(simulationId);
        } catch (updateError) {
          logger.error('Failed to update simulation location', {
            simulationId,
            error: updateError.message
          });
        }
      }, this.updateInterval);

      this.activeSimulations.set(simulationId, interval);

      logger.info('Vendor simulation started', { simulationId });

      return { success: true, message: 'Simulation started successfully' };

    } catch (error) {
      logger.error('Failed to start vendor simulation', error);
      throw new Error('Failed to start vendor simulation');
    }
  }

  /**
   * Stop simulation movement
   */
  stopSimulation(simulationId) {
    try {
      const interval = this.activeSimulations.get(simulationId);
      if (interval) {
        clearInterval(interval);
        this.activeSimulations.delete(simulationId);
        logger.info('Vendor simulation stopped', { simulationId });
      }

      return { success: true, message: 'Simulation stopped successfully' };

    } catch (error) {
      logger.error('Failed to stop vendor simulation', error);
      throw new Error('Failed to stop vendor simulation');
    }
  }

  /**
   * Update simulation location based on movement pattern
   */
  async updateSimulationLocation(simulationId) {
    try {
      const simulation = await VendorSimulation.findOne({ simulationId, isActive: true });
      if (!simulation) {
        // Simulation no longer exists or is inactive, stop it
        this.stopSimulation(simulationId);
        return;
      }

      // Calculate time delta since last update
      const now = new Date();
      const lastUpdate = simulation.lastLocationUpdate || simulation.createdAt;
      const deltaTimeSeconds = (now - lastUpdate) / 1000;

      // Get next location based on movement pattern
      const nextLocation = simulation.getNextLocation(deltaTimeSeconds);

      // Update simulation location
      await simulation.updateLocation(nextLocation.longitude, nextLocation.latitude);

      // Trigger proximity check for simulated vendor
      try {
        const proximityService = require('./proximityService');
        // Create a mock vendor object for proximity detection
        const mockVendor = {
          _id: simulation._id,
          name: simulation.name,
          role: 'vendor',
          isActive: true
        };
        
        // We'll call proximity detection directly with the simulation as a mock vendor
        await this.checkSimulationProximity(simulation, nextLocation.longitude, nextLocation.latitude);
      } catch (proximityError) {
        logger.error('Proximity check failed for simulation', {
          simulationId,
          error: proximityError.message
        });
      }

      logger.debug('Simulation location updated', {
        simulationId,
        location: [nextLocation.longitude, nextLocation.latitude],
        pattern: simulation.movementPattern
      });

    } catch (error) {
      logger.error('Failed to update simulation location', {
        simulationId,
        error: error.message
      });
    }
  }

  /**
   * Manually update simulation location
   */
  async updateLocation(simulationId, longitude, latitude) {
    try {
      const simulation = await VendorSimulation.findOne({ simulationId, isActive: true });
      if (!simulation) {
        throw new Error('Simulation not found or inactive');
      }

      // Update simulation location
      await simulation.updateLocation(longitude, latitude);

      // Trigger proximity check for simulated vendor
      try {
        await this.checkSimulationProximity(simulation, longitude, latitude);
      } catch (proximityError) {
        logger.error('Proximity check failed for simulation', {
          simulationId,
          error: proximityError.message
        });
      }

      logger.info('Simulation location manually updated', {
        simulationId,
        location: [longitude, latitude]
      });

      return {
        success: true,
        location: [longitude, latitude],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to manually update simulation location', error);
      throw new Error('Failed to update simulation location');
    }
  }

  /**
   * Get simulation details
   */
  async getSimulation(simulationId) {
    try {
      const simulation = await VendorSimulation.findOne({ simulationId });
      if (!simulation) {
        throw new Error('Simulation not found');
      }

      const isRunning = this.activeSimulations.has(simulationId);

      return {
        success: true,
        simulation: {
          simulationId: simulation.simulationId,
          name: simulation.name,
          currentLocation: simulation.currentLocation,
          movementPattern: simulation.movementPattern,
          movementConfig: simulation.movementConfig,
          products: simulation.products,
          isActive: simulation.isActive,
          isRunning,
          totalDistanceTraveled: simulation.totalDistanceTraveled,
          createdAt: simulation.createdAt,
          lastLocationUpdate: simulation.lastLocationUpdate
        }
      };

    } catch (error) {
      logger.error('Failed to get simulation details', error);
      throw new Error('Failed to retrieve simulation details');
    }
  }

  /**
   * List all simulations
   */
  async listSimulations() {
    try {
      const simulations = await VendorSimulation.find({})
        .sort({ createdAt: -1 })
        .select('simulationId name currentLocation movementPattern isActive createdAt lastLocationUpdate totalDistanceTraveled');

      const simulationList = simulations.map(sim => ({
        simulationId: sim.simulationId,
        name: sim.name,
        currentLocation: sim.currentLocation,
        movementPattern: sim.movementPattern,
        isActive: sim.isActive,
        isRunning: this.activeSimulations.has(sim.simulationId),
        totalDistanceTraveled: sim.totalDistanceTraveled,
        createdAt: sim.createdAt,
        lastLocationUpdate: sim.lastLocationUpdate
      }));

      return {
        success: true,
        simulations: simulationList,
        totalCount: simulations.length,
        activeCount: simulations.filter(s => s.isActive).length,
        runningCount: simulationList.filter(s => s.isRunning).length
      };

    } catch (error) {
      logger.error('Failed to list simulations', error);
      throw new Error('Failed to retrieve simulations list');
    }
  }

  /**
   * Delete simulation
   */
  async deleteSimulation(simulationId) {
    try {
      // Stop simulation if running
      this.stopSimulation(simulationId);

      // Delete from database
      const result = await VendorSimulation.deleteOne({ simulationId });
      
      if (result.deletedCount === 0) {
        throw new Error('Simulation not found');
      }

      logger.info('Vendor simulation deleted', { simulationId });

      return { success: true, message: 'Simulation deleted successfully' };

    } catch (error) {
      logger.error('Failed to delete vendor simulation', error);
      throw new Error('Failed to delete vendor simulation');
    }
  }

  /**
   * Stop all simulations
   */
  stopAllSimulations() {
    try {
      for (const [simulationId, interval] of this.activeSimulations.entries()) {
        clearInterval(interval);
        logger.info('Stopped simulation', { simulationId });
      }
      
      this.activeSimulations.clear();
      
      return { 
        success: true, 
        message: 'All simulations stopped successfully' 
      };

    } catch (error) {
      logger.error('Failed to stop all simulations', error);
      throw new Error('Failed to stop all simulations');
    }
  }

  /**
   * Get simulation statistics
   */
  async getSimulationStats() {
    try {
      const stats = await VendorSimulation.aggregate([
        {
          $group: {
            _id: null,
            totalSimulations: { $sum: 1 },
            activeSimulations: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            totalDistance: { $sum: '$totalDistanceTraveled' },
            averageDistance: { $avg: '$totalDistanceTraveled' },
            patternStats: {
              $push: '$movementPattern'
            }
          }
        }
      ]);

      const patternCounts = {};
      if (stats.length > 0 && stats[0].patternStats) {
        stats[0].patternStats.forEach(pattern => {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        });
      }

      const result = {
        totalSimulations: stats.length > 0 ? stats[0].totalSimulations : 0,
        activeSimulations: stats.length > 0 ? stats[0].activeSimulations : 0,
        runningSimulations: this.activeSimulations.size,
        totalDistanceTraveled: stats.length > 0 ? Math.round(stats[0].totalDistance) : 0,
        averageDistanceTraveled: stats.length > 0 ? Math.round(stats[0].averageDistance) : 0,
        movementPatterns: patternCounts,
        updateInterval: this.updateInterval
      };

      return result;

    } catch (error) {
      logger.error('Failed to get simulation statistics', error);
      throw new Error('Failed to retrieve simulation statistics');
    }
  }

  /**
   * Check if notification should be sent (cooldown check)
   */
  shouldSendNotification(vendorId, consumerId) {
    const key = `${vendorId}-${consumerId}`;
    const lastNotification = this.notificationCooldowns.get(key);
    const now = Date.now();
    
    if (!lastNotification || (now - lastNotification) > this.cooldownDuration) {
      this.notificationCooldowns.set(key, now);
      return true;
    }
    
    return false;
  }

  /**
   * Clean up old cooldown entries (called periodically)
   */
  cleanupCooldowns() {
    const now = Date.now();
    for (const [key, timestamp] of this.notificationCooldowns.entries()) {
      if ((now - timestamp) > this.cooldownDuration) {
        this.notificationCooldowns.delete(key);
      }
    }
  }

  /**
   * Reset notification cooldowns (for testing)
   */
  resetNotificationCooldowns() {
    this.notificationCooldowns.clear();
    logger.info('Notification cooldowns reset');
  }

  /**
   * Check proximity for simulated vendor and send notifications
   */
  async checkSimulationProximity(simulation, longitude, latitude) {
    try {
      const { User } = require('../models');
      const notificationService = require('./notificationService');
      const socketHandler = require('../socket/socketHandler');

      // Find nearby consumers within 2km radius
      const maxSearchRadius = 2000; // 2km for testing
      const nearbyConsumers = await User.findEligibleForProximityNotifications(
        longitude, 
        latitude, 
        maxSearchRadius
      );

      logger.info('Simulation proximity check', {
        simulationId: simulation.simulationId,
        vendorName: simulation.name,
        coordinates: [longitude, latitude],
        consumersFound: nearbyConsumers.length
      });

      // Debug logging
      console.log('=== PROXIMITY CHECK DEBUG ===');
      console.log('Simulation:', simulation.simulationId, 'at', [longitude, latitude]);
      console.log('Found consumers:', nearbyConsumers.length);
      console.log('Consumers:', nearbyConsumers.map(c => ({ 
        id: c._id, 
        name: c.name, 
        location: c.location,
        notificationPrefs: c.notificationPreferences 
      })));

      for (const consumer of nearbyConsumers) {
        try {
          // Calculate distance
          const distance = this.calculateDistance(
            consumer.location.coordinates[1], // consumer latitude
            consumer.location.coordinates[0], // consumer longitude
            latitude, // vendor latitude
            longitude  // vendor longitude
          );

          // Check if consumer should receive notification
          if (!consumer.shouldReceiveProximityNotifications(distance)) {
            continue;
          }

          // Check cooldown to prevent notification spam - MOVED TO BEFORE ALL NOTIFICATIONS
          if (!this.shouldSendNotification(simulation._id.toString(), consumer._id.toString())) {
            logger.debug('Notification skipped due to cooldown', {
              simulationId: simulation.simulationId,
              consumerId: consumer._id,
              distance: Math.round(distance)
            });
            continue;
          }

          // Debug: Log when notification is actually being sent
          console.log('🔔 SENDING NOTIFICATION:', {
            vendor: simulation.name,
            consumer: consumer.name,
            distance: Math.round(distance),
            timestamp: new Date().toISOString()
          });

          // Send notification (database)
          const notification = {
            title: 'Vendor Nearby (Simulation)',
            body: `${simulation.name} is ${Math.round(distance)}m away • This is a test simulation`
          };

          const data = {
            type: 'vendor_nearby',
            vendorId: simulation._id.toString(),
            vendorName: simulation.name,
            distance: Math.round(distance).toString(),
            isSimulation: true,
            simulationId: simulation.simulationId
          };

          await notificationService.sendToUser(consumer._id, notification, data);

          // Send real-time notification via Socket.io (only if cooldown passed)
          if (socketHandler.getIO()) {
            socketHandler.getIO().to(`user:${consumer._id}`).emit('vendor-nearby', {
              type: 'vendor-nearby',
              vendorId: simulation._id.toString(),
              vendorName: simulation.name,
              distance: Math.round(distance),
              isSimulation: true,
              simulationId: simulation.simulationId,
              timestamp: new Date().toISOString()
            });
          }

          logger.info('Simulation proximity notification sent', {
            simulationId: simulation.simulationId,
            consumerId: consumer._id,
            distance: Math.round(distance)
          });

        } catch (consumerError) {
          logger.error('Failed to process consumer for simulation proximity', {
            simulationId: simulation.simulationId,
            consumerId: consumer._id,
            error: consumerError.message
          });
        }
      }

      // Broadcast vendor location update to all consumers so they can see the vendor on the map
      if (socketHandler.getIO()) {
        const locationData = {
          vendorId: simulation._id.toString(),
          vendorName: simulation.name,
          coordinates: [longitude, latitude],
          isActive: true,
          isSimulation: true,
          simulationId: simulation.simulationId,
          timestamp: new Date().toISOString()
        };

        socketHandler.getIO().to('role:consumer').emit('vendor-location-updated', locationData);

        logger.debug('Simulation location broadcasted to consumers', {
          simulationId: simulation.simulationId,
          coordinates: [longitude, latitude]
        });
      }

    } catch (error) {
      logger.error('Simulation proximity check failed', {
        simulationId: simulation.simulationId,
        error: error.message
      });
    }
  }

  /**
   * Calculate distance between two points (helper method)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Cleanup old inactive simulations
   */
  async cleanupOldSimulations(hoursOld = 24) {
    try {
      const result = await VendorSimulation.cleanupOld(hoursOld);
      
      logger.info('Cleaned up old simulations', {
        deletedCount: result.deletedCount,
        hoursOld
      });

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Cleaned up ${result.deletedCount} old simulations`
      };

    } catch (error) {
      logger.error('Failed to cleanup old simulations', error);
      throw new Error('Failed to cleanup old simulations');
    }
  }
}

// Create singleton instance
const vendorSimulationService = new VendorSimulationService();

module.exports = vendorSimulationService;