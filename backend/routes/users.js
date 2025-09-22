const express = require('express');
const { body, query, param } = require('express-validator');

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [longitude, latitude]'),
  body('location.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Location coordinates must be valid numbers')
];

const updateLocationValidation = [
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
];

const nearbyUsersValidation = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters'),
  query('role')
    .optional()
    .isIn(['farmer', 'vendor', 'consumer'])
    .withMessage('Role must be farmer, vendor, or consumer')
];

const searchUsersValidation = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  query('role')
    .optional()
    .isIn(['farmer', 'vendor', 'consumer'])
    .withMessage('Role must be farmer, vendor, or consumer')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const roleValidation = [
  param('role')
    .isIn(['farmer', 'vendor', 'consumer'])
    .withMessage('Role must be farmer, vendor, or consumer')
];

// Routes

// Get current user profile
router.get('/profile',
  authenticate,
  userController.getProfile
);

// Update current user profile
router.put('/profile',
  authenticate,
  updateProfileValidation,
  validateRequest,
  userController.updateProfile
);

// Update current user location
router.put('/location',
  authenticate,
  updateLocationValidation,
  validateRequest,
  userController.updateLocation
);

// Get user by ID (public info)
router.get('/:userId',
  authenticate,
  userIdValidation,
  validateRequest,
  userController.getUserById
);

// Get nearby users
router.get('/nearby/search',
  authenticate,
  nearbyUsersValidation,
  validateRequest,
  userController.getNearbyUsers
);

// Search users
router.get('/search/query',
  authenticate,
  searchUsersValidation,
  validateRequest,
  userController.searchUsers
);

// Get users by role
router.get('/role/:role',
  authenticate,
  roleValidation,
  validateRequest,
  userController.getUsersByRole
);

// Get user statistics (admin only - for future use)
router.get('/admin/stats',
  authenticate,
  // authorize('admin'), // Commented out since we don't have admin role yet
  userController.getUserStats
);

module.exports = router;