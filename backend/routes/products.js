const express = require('express');
const { body, query, param } = require('express-validator');

const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { uploadMultiple } = require('../middleware/upload');

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
  productController.getMyProducts
);

// Create new product
router.post('/',
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
  productIdValidation,
  validateRequest,
  productController.deleteProduct
);

// Update product quantity
router.patch('/:productId/quantity',
  productIdValidation,
  quantityValidation,
  validateRequest,
  productController.updateProductQuantity
);

module.exports = router;