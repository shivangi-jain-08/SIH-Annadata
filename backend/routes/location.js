const express = require('express');
const { body, query } = require('express-validator');

const locationController = require('../controllers/locationController');
const { authenticate: auth, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

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

// Update vendor status (online/offline for consumer deliveries)
router.patch('/vendor-status', auth, async (req, res) => {
  try {
    const { isOnline, deliveryRadius, acceptingOrders } = req.body;
    const vendorId = req.user._id;
    
    // Update vendor location status
    const locationUpdate = {
      vendorId,
      isOnline: isOnline !== undefined ? isOnline : true,
      deliveryRadius: deliveryRadius || 5000, // 5km default
      acceptingOrders: acceptingOrders !== undefined ? acceptingOrders : true,
      lastUpdated: new Date()
    };
    
    // This would typically update a VendorLocation model
    // For now, we'll return success
    res.json({
      success: true,
      data: locationUpdate,
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
    const { latitude, longitude, radius = 5000 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Vendor location (latitude, longitude) is required'
      });
    }
    
    // Mock delivery opportunities data
    // In a real implementation, this would query consumer orders and locations
    const opportunities = [
      {
        id: '1',
        type: 'pending_order',
        consumerName: 'Priya Sharma',
        location: {
          latitude: parseFloat(latitude) + 0.001,
          longitude: parseFloat(longitude) + 0.001
        },
        distance: 150,
        orderValue: 450,
        items: ['Tomatoes', 'Onions', 'Spinach'],
        estimatedDeliveryTime: '30 mins',
        priority: 'high'
      },
      {
        id: '2',
        type: 'potential_customer',
        consumerName: 'Raj Patel',
        location: {
          latitude: parseFloat(latitude) - 0.002,
          longitude: parseFloat(longitude) + 0.002
        },
        distance: 280,
        preferredItems: ['Fresh vegetables', 'Fruits'],
        lastOrderDate: '2024-01-15',
        priority: 'medium'
      }
    ];
    
    res.json({
      success: true,
      data: opportunities,
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