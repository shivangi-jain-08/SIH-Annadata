const express = require('express');
const { body, query } = require('express-validator');

const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');
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

// Routes

// Update vendor location (vendors only)
router.post('/update',
  authenticate,
  authorize('vendor'),
  updateLocationValidation,
  validateRequest,
  locationController.updateLocation
);

// Get nearby vendors (consumers and vendors)
router.get('/nearby-vendors',
  authenticate,
  authorize('consumer', 'vendor'),
  nearbyValidation,
  validateRequest,
  locationController.getNearbyVendors
);

// Get nearby consumers (vendors only)
router.get('/nearby-consumers',
  authenticate,
  authorize('vendor'),
  nearbyValidation,
  validateRequest,
  locationController.getNearbyConsumers
);

// Go offline (remove from active locations)
router.delete('/offline',
  authenticate,
  authorize('vendor'),
  locationController.goOffline
);

// Get all active vendor locations (for monitoring)
router.get('/active-vendors',
  authenticate,
  locationController.getActiveVendors
);

// Get location service statistics
router.get('/stats',
  authenticate,
  locationController.getLocationStats
);

// Calculate distance between two points
router.get('/distance',
  authenticate,
  distanceValidation,
  validateRequest,
  locationController.calculateDistance
);

module.exports = router;