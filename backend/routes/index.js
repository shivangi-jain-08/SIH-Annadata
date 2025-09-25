const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const marketplaceRoutes = require('./marketplace');
const mlRoutes = require('./ml');
const locationRoutes = require('./location');
const notificationRoutes = require('./notifications');
const testingRoutes = require('./testing');
const testUserRoutes = require('../create_test_user_endpoint');

const router = express.Router();

// Health check endpoint
const { healthCheck } = require('../middleware/errorHandler');
router.get('/health', healthCheck);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/ml', mlRoutes);
router.use('/location', locationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/testing', testingRoutes);
router.use('/test-setup', testUserRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Annadata Backend API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/register': 'Register a new user',
        'POST /auth/login': 'Login user',
        'POST /auth/logout': 'Logout user (requires auth)',
        'GET /auth/verify-token': 'Verify JWT token (requires auth)',
        'GET /auth/profile': 'Get user profile (requires auth)'
      },
      users: {
        'GET /users/profile': 'Get current user profile (requires auth)',
        'PUT /users/profile': 'Update current user profile (requires auth)',
        'PUT /users/location': 'Update current user location (requires auth)',
        'GET /users/:userId': 'Get user by ID (requires auth)',
        'GET /users/nearby/search': 'Get nearby users (requires auth)',
        'GET /users/search/query': 'Search users (requires auth)',
        'GET /users/role/:role': 'Get users by role (requires auth)',
        'GET /users/admin/stats': 'Get user statistics (requires auth)'
      },
      products: {
        'GET /products': 'Get all products with filters (requires auth)',
        'GET /products/search': 'Search products (requires auth)',
        'GET /products/category/:category': 'Get products by category (requires auth)',
        'GET /products/my-products': 'Get current user products (requires auth, farmer/vendor)',
        'POST /products': 'Create new product (requires auth, farmer/vendor)',
        'GET /products/:productId': 'Get product by ID (requires auth)',
        'PUT /products/:productId': 'Update product (requires auth, farmer/vendor)',
        'DELETE /products/:productId': 'Delete product (requires auth, farmer/vendor)',
        'PATCH /products/:productId/quantity': 'Update product quantity (requires auth, farmer/vendor)'
      },
      orders: {
        'GET /orders/my-orders': 'Get current user orders (requires auth)',
        'GET /orders/nearby': 'Get nearby orders (requires auth, vendor)',
        'GET /orders/status/:status': 'Get orders by status (requires auth)',
        'GET /orders/stats': 'Get order statistics (requires auth)',
        'POST /orders': 'Create new order (requires auth, vendor/consumer)',
        'GET /orders/:orderId': 'Get order by ID (requires auth)',
        'PATCH /orders/:orderId/status': 'Update order status (requires auth)',
        'PATCH /orders/:orderId/cancel': 'Cancel order (requires auth)'
      },
      ml: {
        'GET /ml/hardware-messages': 'Get current user hardware messages (requires auth, farmer)',
        'GET /ml/hardware-messages/latest': 'Get latest hardware message (requires auth, farmer)',
        'GET /ml/crop-recommendations': 'Get current user crop recommendations (requires auth, farmer)',
        'GET /ml/crop-recommendations/latest': 'Get latest crop recommendation (requires auth, farmer)',
        'GET /ml/soil-reports': 'Get current user soil reports (requires auth, farmer)',
        'GET /ml/soil-reports/latest': 'Get latest soil report (requires auth, farmer)',
        'GET /ml/soil-reports/farmer/:farmerId': 'Get soil reports by farmer (requires auth)',
        'GET /ml/soil-reports/crop/:cropName': 'Get soil reports by crop (requires auth)',
        'GET /ml/soil-reports/area': 'Get soil reports in area (requires auth)',
        'POST /ml/disease-detection': 'Detect plant disease (requires auth, farmer)',
        'GET /ml/disease-reports': 'Get current user disease reports (requires auth, farmer)',
        'GET /ml/disease-reports/farmer/:farmerId': 'Get disease reports by farmer (requires auth)',
        'GET /ml/disease-reports/disease/:diseaseName': 'Get disease reports by disease (requires auth)',
        'GET /ml/disease-reports/crop/:cropType': 'Get disease reports by crop (requires auth)',
        'GET /ml/health': 'Check ML service health (requires auth)'
      },
      location: {
        'POST /location/update': 'Update vendor location (requires auth, vendor)',
        'GET /location/nearby-vendors': 'Get nearby vendors (requires auth, consumer/vendor)',
        'GET /location/nearby-consumers': 'Get nearby consumers (requires auth, vendor)',
        'DELETE /location/offline': 'Go offline (requires auth, vendor)',
        'GET /location/active-vendors': 'Get active vendor locations (requires auth)',
        'GET /location/stats': 'Get location statistics (requires auth)',
        'GET /location/distance': 'Calculate distance between points (requires auth)'
      },
      notifications: {
        'GET /notifications': 'Get current user notifications (requires auth)',
        'GET /notifications/stats': 'Get notification statistics (requires auth)',
        'POST /notifications/send': 'Send notification (requires auth)',
        'POST /notifications/order-update': 'Send order update notification (requires auth)',
        'POST /notifications/vendor-nearby': 'Send vendor nearby notification (requires auth)',
        'POST /notifications/ml-complete': 'Send ML complete notification (requires auth)',
        'POST /notifications/system': 'Send system notification (requires auth)',
        'POST /notifications/test': 'Send test notification (requires auth)',
        'PATCH /notifications/:notificationId/read': 'Mark notification as read (requires auth)',
        'PATCH /notifications/mark-all-read': 'Mark all notifications as read (requires auth)',
        'POST /notifications/retry-failed': 'Retry failed notifications (requires auth)'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    }
  });
});

module.exports = router;