const express = require('express');
const { body, query, param } = require('express-validator');

const productController = require('../controllers/productController');
const { authenticate: auth, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { uploadMultiple } = require('../middleware/upload');
const { Product, Order } = require('../models');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('unit')
    .isIn(['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle'])
    .withMessage('Invalid unit'),
  body('availableQuantity')
    .isFloat({ min: 0 })
    .withMessage('Available quantity must be a positive number'),
  body('minimumOrderQuantity')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [longitude, latitude]'),
  body('location.*')
    .optional()
    .isFloat()
    .withMessage('Location coordinates must be numbers'),
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Harvest date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('unit')
    .optional()
    .isIn(['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle'])
    .withMessage('Invalid unit'),
  body('availableQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Available quantity must be a positive number'),
  body('minimumOrderQuantity')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [longitude, latitude]'),
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Harvest date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID format')
];

const categoryValidation = [
  param('category')
    .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'other'])
    .withMessage('Invalid category')
];

const searchValidation = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters')
];

const quantityValidation = [
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number')
];

// Routes

// Get all products with filters
router.get('/',
  productController.getProducts
);

// Search products
router.get('/search',
  searchValidation,
  validateRequest,
  productController.searchProducts
);

// Get products by category
router.get('/category/:category',
  categoryValidation,
  validateRequest,
  productController.getProductsByCategory
);

// Get current user's products
router.get('/my-products',
  auth,
  productController.getMyProducts
);

// Create new product
router.post('/',
  auth,
  uploadMultiple('images', 5),
  createProductValidation,
  validateRequest,
  (req, res, next) => {
    // Add uploaded image URLs to request body
    if (req.fileUrls && req.fileUrls.length > 0) {
      req.body.images = req.fileUrls;
    }
    next();
  },
  productController.createProduct
);

// Get product by ID
router.get('/:productId',
  productIdValidation,
  validateRequest,
  productController.getProductById
);

// Update product
router.put('/:productId',
  auth,
  productIdValidation,
  uploadMultiple('images', 5),
  updateProductValidation,
  validateRequest,
  (req, res, next) => {
    // Add uploaded image URLs to request body if new images were uploaded
    if (req.fileUrls && req.fileUrls.length > 0) {
      req.body.images = req.fileUrls;
    }
    next();
  },
  productController.updateProduct
);

// Delete product
router.delete('/:productId',
  auth,
  productIdValidation,
  validateRequest,
  productController.deleteProduct
);

// Update product quantity
router.patch('/:productId/quantity',
  auth,
  productIdValidation,
  quantityValidation,
  validateRequest,
  productController.updateProductQuantity
);

// Get products available for consumers (vendor inventory for consumer sales)
router.get('/for-consumers', auth, async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, radius = 5000 } = req.query;
    
    let query = {
      isActive: true,
      availableQuantity: { $gt: 0 },
      // Products from vendors (not farmers)
      sellerId: { $exists: true }
    };
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Location-based filtering if provided
    if (location) {
      const [longitude, latitude] = location.split(',').map(parseFloat);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }
    
    const products = await Product.find(query)
      .populate('sellerId', 'name phone location')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: { products },
      message: 'Consumer products retrieved successfully'
    });
  } catch (error) {
    console.error('Get consumer products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumer products',
      error: error.message
    });
  }
});

// Update product availability for consumer sales
router.patch('/:productId/availability', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { availableQuantity, isActive } = req.body;
    
    // Find product and verify ownership
    const product = await Product.findOne({
      _id: productId,
      sellerId: req.user._id
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized'
      });
    }
    
    // Update availability
    if (availableQuantity !== undefined) {
      product.availableQuantity = availableQuantity;
    }
    
    if (isActive !== undefined) {
      product.isActive = isActive;
    }
    
    product.updatedAt = new Date();
    await product.save();
    
    res.json({
      success: true,
      data: product,
      message: 'Product availability updated successfully'
    });
  } catch (error) {
    console.error('Update product availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product availability',
      error: error.message
    });
  }
});

// Get vendor's consumer sales statistics
router.get('/consumer-sales-stats', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Get all orders where this vendor sold to consumers
    const consumerOrders = await Order.find({
      sellerId: vendorId,
      // Assuming we can identify consumer orders vs farmer orders
      // This might need adjustment based on your data model
    });
    
    const stats = {
      totalConsumerOrders: consumerOrders.length,
      pendingOrders: consumerOrders.filter(o => o.status === 'pending').length,
      confirmedOrders: consumerOrders.filter(o => o.status === 'confirmed').length,
      deliveredOrders: consumerOrders.filter(o => o.status === 'delivered').length,
      totalRevenue: consumerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      
      // Monthly stats
      monthlyOrders: consumerOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const currentMonth = new Date();
        return orderDate.getMonth() === currentMonth.getMonth() && 
               orderDate.getFullYear() === currentMonth.getFullYear();
      }).length,
      
      monthlyRevenue: consumerOrders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          const currentMonth = new Date();
          return orderDate.getMonth() === currentMonth.getMonth() && 
                 orderDate.getFullYear() === currentMonth.getFullYear() &&
                 o.status === 'delivered';
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Consumer sales statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get consumer sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumer sales statistics',
      error: error.message
    });
  }
});

module.exports = router;