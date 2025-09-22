const express = require('express');
const { body, query, param } = require('express-validator');

const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const sendNotificationValidation = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('type')
    .isIn(['order_update', 'vendor_nearby', 'ml_complete', 'system'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  body('deliveryMethod')
    .optional()
    .isIn(['push', 'sms', 'both'])
    .withMessage('Delivery method must be push, sms, or both')
];

const orderUpdateValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  body('status')
    .isIn(['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('orderDetails')
    .optional()
    .isObject()
    .withMessage('Order details must be an object')
];

const vendorNearbyValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('vendorInfo')
    .isObject()
    .withMessage('Vendor info is required'),
  body('vendorInfo.vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID format'),
  body('vendorInfo.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vendor name is required'),
  body('vendorInfo.distance')
    .optional()
    .isNumeric()
    .withMessage('Distance must be a number')
];

const mlCompleteValidation = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('analysisType')
    .isIn(['soil', 'disease'])
    .withMessage('Analysis type must be soil or disease'),
  body('reportId')
    .isMongoId()
    .withMessage('Invalid report ID format')
];

const systemNotificationValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

const testNotificationValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['order_update', 'vendor_nearby', 'ml_complete', 'system'])
    .withMessage('Invalid notification type')
];

const notificationIdValidation = [
  param('notificationId')
    .isMongoId()
    .withMessage('Invalid notification ID format')
];

// Routes

// Get current user's notifications
router.get('/',
  authenticate,
  notificationController.getNotifications
);

// Get notification statistics
router.get('/stats',
  authenticate,
  notificationController.getNotificationStats
);

// Send a general notification
router.post('/send',
  authenticate,
  sendNotificationValidation,
  validateRequest,
  notificationController.sendNotification
);

// Send order update notification
router.post('/order-update',
  authenticate,
  orderUpdateValidation,
  validateRequest,
  notificationController.sendOrderUpdate
);

// Send vendor nearby notification
router.post('/vendor-nearby',
  authenticate,
  vendorNearbyValidation,
  validateRequest,
  notificationController.sendVendorNearby
);

// Send ML analysis complete notification
router.post('/ml-complete',
  authenticate,
  mlCompleteValidation,
  validateRequest,
  notificationController.sendMLComplete
);

// Send system notification
router.post('/system',
  authenticate,
  systemNotificationValidation,
  validateRequest,
  notificationController.sendSystemNotification
);

// Test notification (for development)
router.post('/test',
  authenticate,
  testNotificationValidation,
  validateRequest,
  notificationController.testNotification
);

// Mark notification as read
router.patch('/:notificationId/read',
  authenticate,
  notificationIdValidation,
  validateRequest,
  notificationController.markAsRead
);

// Mark all notifications as read
router.patch('/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

// Retry failed notifications (admin function)
router.post('/retry-failed',
  authenticate,
  // authorize('admin'), // Commented out since we don't have admin role yet
  notificationController.retryFailedNotifications
);

module.exports = router;