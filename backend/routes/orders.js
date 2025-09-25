const express = require('express');
const { body, query, param } = require('express-validator');

const orderController = require('../controllers/orderController');
const { authenticate: auth, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { Order } = require('../models');

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
  auth,
  orderController.getMyOrders
);

// Get orders by status
router.get('/status/:status',
  auth,
  statusValidation,
  validateRequest,
  orderController.getOrdersByStatus
);

// Get order statistics
router.get('/stats',
  auth,
  orderController.getOrderStats
);

// Create new order
router.post('/',
  auth,
  createOrderValidation,
  validateRequest,
  orderController.createOrder
);

// Get order by ID
router.get('/:orderId',
  auth,
  orderIdValidation,
  validateRequest,
  orderController.getOrderById
);

// Update order status
router.patch('/:orderId/status',
  auth,
  orderIdValidation,
  updateStatusValidation,
  validateRequest,
  orderController.updateOrderStatus
);

// Cancel order
router.patch('/:orderId/cancel',
  auth,
  orderIdValidation,
  cancelOrderValidation,
  validateRequest,
  orderController.cancelOrder
);

// Get nearby orders for vendors (orders from consumers in their delivery area)
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Find orders from consumers within the specified radius
    const nearbyOrders = await Order.find({
      status: { $in: ['pending', 'confirmed'] },
      deliveryLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .populate('buyerId', 'name phone')
    .populate('products.productId', 'name category')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({
      success: true,
      data: nearbyOrders,
      message: `Found ${nearbyOrders.length} nearby orders`
    });
  } catch (error) {
    console.error('Get nearby orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby orders',
      error: error.message
    });
  }
});

// Get consumer orders for vendor fulfillment
router.get('/consumer-orders', auth, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    
    // Get orders where vendor can fulfill (based on location and product availability)
    let query = {
      // Orders from consumers looking for products
      buyerId: { $exists: true },
      status: status || { $in: ['pending', 'confirmed'] }
    };
    
    const consumerOrders = await Order.find(query)
      .populate('buyerId', 'name phone location')
      .populate('products.productId', 'name category price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: consumerOrders,
      message: 'Consumer orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get consumer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumer orders',
      error: error.message
    });
  }
});

// Order messaging endpoints
const messageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'location'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

// Send message in order context
router.post('/:orderId/messages',
  auth,
  orderIdValidation,
  messageValidation,
  validateRequest,
  orderController.sendOrderMessage
);

// Get order conversation
router.get('/:orderId/messages',
  auth,
  orderIdValidation,
  validateRequest,
  orderController.getOrderMessages
);

// Mark messages as read
router.put('/:orderId/messages/read',
  auth,
  orderIdValidation,
  validateRequest,
  orderController.markMessagesAsRead
);

// Get unread message counts
router.get('/messages/unread-counts',
  auth,
  orderController.getUnreadMessageCounts
);

module.exports = router;