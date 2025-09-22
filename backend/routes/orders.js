const express = require('express');
const { body, query, param } = require('express-validator');

const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('sellerId')
    .isMongoId()
    .withMessage('Invalid seller ID format'),
  body('products')
    .isArray({ min: 1 })
    .withMessage('Products array is required and must contain at least one item'),
  body('products.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('products.*.quantity')
    .isFloat({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Delivery address cannot exceed 500 characters'),
  body('deliveryLocation')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Delivery location must be an array of [longitude, latitude]'),
  body('deliveryLocation.*')
    .optional()
    .isFloat()
    .withMessage('Location coordinates must be numbers'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Delivery date must be a valid date')
];

const cancelOrderValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
];

const orderIdValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID format')
];

const statusValidation = [
  param('status')
    .isIn(['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
];

const nearbyOrdersValidation = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters')
];

// Routes

// Get current user's orders
router.get('/my-orders',
  authenticate,
  orderController.getMyOrders
);

// getNearbyOrders removed - functionality simplified for prototype

// Get orders by status
router.get('/status/:status',
  authenticate,
  statusValidation,
  validateRequest,
  orderController.getOrdersByStatus
);

// Get order statistics
router.get('/stats',
  authenticate,
  orderController.getOrderStats
);

// Create new order
router.post('/',
  authenticate,
  authorize('vendor', 'consumer'),
  createOrderValidation,
  validateRequest,
  orderController.createOrder
);

// Get order by ID
router.get('/:orderId',
  authenticate,
  orderIdValidation,
  validateRequest,
  orderController.getOrderById
);

// Update order status
router.patch('/:orderId/status',
  authenticate,
  orderIdValidation,
  updateStatusValidation,
  validateRequest,
  orderController.updateOrderStatus
);

// Cancel order
router.patch('/:orderId/cancel',
  authenticate,
  orderIdValidation,
  cancelOrderValidation,
  validateRequest,
  orderController.cancelOrder
);

module.exports = router;