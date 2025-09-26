const express = require('express');
const { body, query } = require('express-validator');

const locationController = require('../controllers/locationController');
const { authenticate: auth, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { VendorLocation } = require('../models');

const router = express.Router();

// Validation rules
const updateLocationValidation = [
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
];

const nearbyValidation = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters')
];

const distanceValidation = [
  query('lat1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('lat1 must be between -90 and 90'),
  query('lon1')
    .isFloat({ min: -180, max: 180 })
    .withMessage('lon1 must be between -180 and 180'),
  query('lat2')
    .isFloat({ min: -90, max: 90 })
    .withMessage('lat2 must be between -90 and 90'),
  query('lon2')
    .isFloat({ min: -180, max: 180 })
    .withMessage('lon2 must be between -180 and 180')
];

const proximityCheckValidation = [
  body('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID format'),
  body('consumerLocation')
    .isObject()
    .withMessage('Consumer location is required'),
  body('consumerLocation.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Consumer longitude must be between -180 and 180'),
  body('consumerLocation.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Consumer latitude must be between -90 and 90')
];

const notificationPreferencesValidation = [
  body('proximityNotifications')
    .optional()
    .isObject()
    .withMessage('Proximity notifications must be an object'),
  body('proximityNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean'),
  body('proximityNotifications.radius')
    .optional()
    .isInt({ min: 100, max: 5000 })
    .withMessage('Radius must be between 100 and 5000 meters'),
  body('proximityNotifications.quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),
  body('proximityNotifications.quietHours.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('proximityNotifications.quietHours.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('doNotDisturb')
    .optional()
    .isBoolean()
    .withMessage('Do not disturb must be a boolean')
];

// Routes

// Update vendor location
router.post('/update',
  updateLocationValidation,
  validateRequest,
  locationController.updateLocation
);

// Get nearby vendors
router.get('/nearby-vendors',
  nearbyValidation,
  validateRequest,
  locationController.getNearbyVendors
);

// Get nearby consumers
router.get('/nearby-consumers',
  nearbyValidation,
  validateRequest,
  locationController.getNearbyConsumers
);

// Go offline (remove from active locations)
router.delete('/offline',
  locationController.goOffline
);

// Get all active vendor locations (for monitoring)
router.get('/active-vendors',
  locationController.getActiveVendors
);

// Get location service statistics
router.get('/stats',
  locationController.getLocationStats
);

// Calculate distance between two points
router.get('/distance',
  distanceValidation,
  validateRequest,
  locationController.calculateDistance
);

// Get consumer notification preferences
router.get('/consumer-preferences',
  locationController.getConsumerPreferences
);

// Update consumer notification preferences
router.put('/consumer-preferences',
  notificationPreferencesValidation,
  validateRequest,
  locationController.updateConsumerPreferences
);

// Manual proximity check (for testing)
router.post('/proximity-check',
  proximityCheckValidation,
  validateRequest,
  locationController.manualProximityCheck
);

// Get proximity service statistics
router.get('/proximity-stats',
  locationController.getProximityStats
);

// Get vendor status
router.get('/vendor-status', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    let vendorLocation = await VendorLocation.findOne({ vendorId })
      .populate('vendorId', 'name phone email');
    
    if (!vendorLocation) {
      // Return default status if no record exists
      return res.json({
        success: true,
        data: {
          vendorId,
          isOnline: false,
          deliveryRadius: 2000,
          acceptingOrders: true,
          location: null,
          onlineSince: null,
          currentSessionDuration: 0,
          rating: 0,
          completedDeliveries: 0,
          totalOnlineTime: 0
        },
        message: 'Vendor status retrieved successfully'
      });
    }
    
    res.json({
      success: true,
      data: {
        vendorId: vendorLocation.vendorId._id,
        vendorName: vendorLocation.vendorId.name,
        isOnline: vendorLocation.isOnline,
        deliveryRadius: vendorLocation.deliveryRadius,
        acceptingOrders: vendorLocation.acceptingOrders,
        location: vendorLocation.location,
        onlineSince: vendorLocation.onlineSince,
        currentSessionDuration: vendorLocation.currentSessionDuration,
        rating: vendorLocation.rating,
        completedDeliveries: vendorLocation.completedDeliveries,
        totalOnlineTime: vendorLocation.totalOnlineTime,
        lastLocationUpdate: vendorLocation.lastLocationUpdate
      },
      message: 'Vendor status retrieved successfully'
    });
  } catch (error) {
    console.error('Get vendor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vendor status',
      error: error.message
    });
  }
});

// Update vendor status (online/offline for consumer deliveries)
router.patch('/vendor-status', auth, async (req, res) => {
  try {
    const { isOnline, deliveryRadius, acceptingOrders, longitude, latitude } = req.body;
    const vendorId = req.user._id;
    
    // Find or create vendor location record
    let vendorLocation = await VendorLocation.findOne({ vendorId });
    
    if (!vendorLocation) {
      // Create new vendor location record
      if (isOnline && (!longitude || !latitude)) {
        return res.status(400).json({
          success: false,
          message: 'Location coordinates are required to go online'
        });
      }
      
      vendorLocation = new VendorLocation({
        vendorId,
        location: isOnline ? {
          type: 'Point',
          coordinates: [longitude, latitude]
        } : undefined,
        isOnline: isOnline || false,
        deliveryRadius: deliveryRadius || 2000,
        acceptingOrders: acceptingOrders !== undefined ? acceptingOrders : true
      });
    } else {
      // Update existing vendor location
      if (isOnline !== undefined) {
        if (isOnline && longitude && latitude) {
          await vendorLocation.goOnline(longitude, latitude);
        } else if (!isOnline) {
          await vendorLocation.goOffline();
        }
      }
      
      if (deliveryRadius !== undefined || acceptingOrders !== undefined) {
        await vendorLocation.updateDeliverySettings({
          deliveryRadius,
          acceptingOrders
        });
      }
    }
    
    await vendorLocation.save();
    
    // Populate vendor information
    await vendorLocation.populate('vendorId', 'name phone email');
    
    res.json({
      success: true,
      data: {
        vendorId: vendorLocation.vendorId._id,
        vendorName: vendorLocation.vendorId.name,
        isOnline: vendorLocation.isOnline,
        deliveryRadius: vendorLocation.deliveryRadius,
        acceptingOrders: vendorLocation.acceptingOrders,
        location: vendorLocation.location,
        onlineSince: vendorLocation.onlineSince,
        currentSessionDuration: vendorLocation.currentSessionDuration,
        rating: vendorLocation.rating,
        completedDeliveries: vendorLocation.completedDeliveries
      },
      message: 'Vendor status updated successfully'
    });
  } catch (error) {
    console.error('Update vendor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor status',
      error: error.message
    });
  }
});

// Get delivery opportunities (consumers waiting for delivery in vendor's area)
router.get('/delivery-opportunities', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    let { latitude, longitude, radius = 5000 } = req.query;
    
    // Get vendor location if not provided
    if (!latitude || !longitude) {
      const vendorLocation = await VendorLocation.findOne({ vendorId });
      if (!vendorLocation || !vendorLocation.isOnline) {
        return res.status(400).json({
          success: false,
          message: 'Vendor must be online with location to get delivery opportunities'
        });
      }
      longitude = vendorLocation.location.coordinates[0];
      latitude = vendorLocation.location.coordinates[1];
      radius = vendorLocation.deliveryRadius;
    }
    
    // Find nearby consumers with pending orders or potential customers
    const { User, Order } = require('../models');
    
    // Find nearby consumers
    const nearbyConsumers = await User.findNearby(
      parseFloat(longitude), 
      parseFloat(latitude), 
      parseInt(radius)
    ).where('role').equals('consumer');
    
    // Find pending orders from nearby consumers
    const consumerIds = nearbyConsumers.map(c => c._id);
    const pendingOrders = await Order.find({
      buyerId: { $in: consumerIds },
      status: { $in: ['pending', 'confirmed'] },
      sellerId: { $ne: vendorId } // Exclude vendor's own orders
    }).populate('buyerId', 'name phone location')
     .populate('products.productId', 'name category price unit')
     .limit(10)
     .sort({ createdAt: -1 });
    
    const opportunities = [];
    
    // Add pending orders as high priority opportunities
    for (const order of pendingOrders) {
      if (order.buyerId && order.buyerId.location) {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          order.buyerId.location.coordinates[1],
          order.buyerId.location.coordinates[0]
        );
        
        opportunities.push({
          id: order._id.toString(),
          type: 'pending_order',
          consumerName: order.buyerId.name,
          consumerId: order.buyerId._id,
          location: {
            latitude: order.buyerId.location.coordinates[1],
            longitude: order.buyerId.location.coordinates[0]
          },
          distance: Math.round(distance),
          orderValue: order.totalAmount || 0,
          items: order.products.map(p => p.name || 'Unknown item'),
          estimatedDeliveryTime: calculateDeliveryTime(distance),
          priority: distance < 1000 ? 'high' : distance < 2000 ? 'medium' : 'low',
          orderDate: order.createdAt
        });
      }
    }
    
    // Add potential customers (consumers who haven't ordered recently)
    const recentOrderConsumers = new Set(pendingOrders.map(o => o.buyerId._id.toString()));
    const potentialCustomers = nearbyConsumers.filter(c => 
      !recentOrderConsumers.has(c._id.toString()) && 
      c.location && c.location.coordinates
    ).slice(0, 5);
    
    for (const consumer of potentialCustomers) {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        consumer.location.coordinates[1],
        consumer.location.coordinates[0]
      );
      
      opportunities.push({
        id: `potential-${consumer._id}`,
        type: 'potential_customer',
        consumerName: consumer.name,
        consumerId: consumer._id,
        location: {
          latitude: consumer.location.coordinates[1],
          longitude: consumer.location.coordinates[0]
        },
        distance: Math.round(distance),
        preferredItems: ['Fresh vegetables', 'Fruits'], // Could be enhanced with user preferences
        estimatedDeliveryTime: calculateDeliveryTime(distance),
        priority: distance < 500 ? 'high' : distance < 1500 ? 'medium' : 'low'
      });
    }
    
    // Sort by priority and distance
    opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.distance - b.distance;
    });
    
    res.json({
      success: true,
      data: opportunities.slice(0, 10), // Limit to top 10 opportunities
      message: 'Delivery opportunities retrieved successfully'
    });
  } catch (error) {
    console.error('Get delivery opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery opportunities',
      error: error.message
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// Helper function to calculate estimated delivery time
function calculateDeliveryTime(distanceInMeters) {
  const walkingSpeedKmh = 5; // Average walking speed
  const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600;
  const timeInSeconds = distanceInMeters / walkingSpeedMs;
  const timeInMinutes = Math.ceil(timeInSeconds / 60);

  if (timeInMinutes < 1) return 'Less than 1 minute';
  if (timeInMinutes === 1) return '1 minute';
  if (timeInMinutes < 60) return `${timeInMinutes} minutes`;
  
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

// Notify consumers about vendor proximity
router.post('/notify-proximity', auth, async (req, res) => {
  try {
    const { latitude, longitude, message, products } = req.body;
    const vendorId = req.user._id;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Vendor location is required'
      });
    }
    
    // Find nearby consumers (mock implementation)
    const nearbyConsumers = [
      {
        id: '1',
        name: 'Consumer 1',
        distance: 200,
        notificationSent: true
      },
      {
        id: '2',
        name: 'Consumer 2',
        distance: 350,
        notificationSent: true
      }
    ];
    
    res.json({
      success: true,
      data: {
        vendorId,
        location: { latitude, longitude },
        notificationsSent: nearbyConsumers.length,
        consumers: nearbyConsumers
      },
      message: 'Proximity notifications sent successfully'
    });
  } catch (error) {
    console.error('Notify proximity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send proximity notifications',
      error: error.message
    });
  }
});

module.exports = router;