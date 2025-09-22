const { body, query, param } = require('express-validator');

/**
 * Common validation rules
 */
const commonValidations = {
  // MongoDB ObjectId validation
  mongoId: (field) => 
    param(field).isMongoId().withMessage(`Invalid ${field} format`),

  // Email validation
  email: (field = 'email') =>
    body(field).isEmail().normalizeEmail().withMessage('Please provide a valid email'),

  // Phone validation
  phone: (field = 'phone') =>
    body(field).isMobilePhone().withMessage('Please provide a valid phone number'),

  // Password validation
  password: (field = 'password') =>
    body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name validation
  name: (field = 'name', min = 2, max = 100) =>
    body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`),

  // Role validation
  role: (field = 'role') =>
    body(field)
      .isIn(['farmer', 'vendor', 'consumer'])
      .withMessage('Role must be farmer, vendor, or consumer'),

  // Coordinates validation
  coordinates: (field = 'location') =>
    body(field)
      .isArray({ min: 2, max: 2 })
      .withMessage('Location must be an array of [longitude, latitude]'),

  coordinateValues: (field = 'location') =>
    body(`${field}.*`)
      .isFloat({ min: -180, max: 180 })
      .withMessage('Location coordinates must be valid numbers'),

  // Longitude validation
  longitude: (field = 'longitude') =>
    query(field)
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),

  // Latitude validation
  latitude: (field = 'latitude') =>
    query(field)
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),

  // Distance validation
  distance: (field = 'maxDistance') =>
    query(field)
      .optional()
      .isInt({ min: 100, max: 100000 })
      .withMessage('Distance must be between 100 and 100000 meters'),

  // Price validation
  price: (field = 'price') =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),

  // Quantity validation
  quantity: (field = 'quantity') =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a positive number'),

  // Category validation
  category: (field = 'category') =>
    body(field)
      .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'herbs', 'dairy', 'other'])
      .withMessage('Invalid category'),

  // Unit validation
  unit: (field = 'unit') =>
    body(field)
      .isIn(['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle'])
      .withMessage('Invalid unit'),

  // Order status validation
  orderStatus: (field = 'status') =>
    body(field)
      .isIn(['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),

  // Notification type validation
  notificationType: (field = 'type') =>
    body(field)
      .isIn(['order_update', 'vendor_nearby', 'ml_complete', 'system'])
      .withMessage('Invalid notification type'),

  // Delivery method validation
  deliveryMethod: (field = 'deliveryMethod') =>
    body(field)
      .optional()
      .isIn(['push', 'sms', 'both'])
      .withMessage('Delivery method must be push, sms, or both'),

  // Text field validation
  text: (field, min = 1, max = 1000) =>
    body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`),

  // Optional text field validation
  optionalText: (field, max = 500) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max })
      .withMessage(`${field} cannot exceed ${max} characters`),

  // Date validation
  date: (field) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid date`),

  // Boolean validation
  boolean: (field) =>
    body(field)
      .optional()
      .isBoolean()
      .withMessage(`${field} must be a boolean value`),

  // Array validation
  array: (field, min = 1) =>
    body(field)
      .isArray({ min })
      .withMessage(`${field} must be an array with at least ${min} item(s)`),

  // URL validation
  url: (field) =>
    body(field)
      .optional()
      .isURL()
      .withMessage(`${field} must be a valid URL`),

  // Search query validation
  searchQuery: (field = 'q') =>
    query(field)
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be between 2 and 100 characters'),

  // Pagination validation
  page: (field = 'page') =>
    query(field)
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

  limit: (field = 'limit') =>
    query(field)
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
};

/**
 * Validation rule sets for different entities
 */
const validationSets = {
  // User registration validation
  userRegistration: [
    commonValidations.email(),
    commonValidations.phone(),
    commonValidations.password(),
    commonValidations.role(),
    commonValidations.name(),
    commonValidations.coordinates(),
    commonValidations.coordinateValues(),
    commonValidations.optionalText('address')
  ],

  // User login validation
  userLogin: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Profile update validation
  profileUpdate: [
    commonValidations.name().optional(),
    commonValidations.phone().optional(),
    commonValidations.optionalText('address'),
    commonValidations.coordinates().optional(),
    commonValidations.coordinateValues().optional()
  ],

  // Location update validation
  locationUpdate: [
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90')
  ],

  // Product creation validation
  productCreation: [
    commonValidations.name('name', 2, 200),
    commonValidations.optionalText('description', 1000),
    commonValidations.category(),
    commonValidations.price(),
    commonValidations.unit(),
    commonValidations.quantity('availableQuantity'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    commonValidations.coordinates().optional(),
    commonValidations.coordinateValues().optional(),
    commonValidations.date('harvestDate'),
    commonValidations.date('expiryDate')
  ],

  // Order creation validation
  orderCreation: [
    commonValidations.mongoId('sellerId'),
    commonValidations.array('products'),
    body('products.*.productId').isMongoId().withMessage('Invalid product ID format'),
    body('products.*.quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
    commonValidations.optionalText('deliveryAddress'),
    commonValidations.coordinates('deliveryLocation').optional(),
    commonValidations.coordinateValues('deliveryLocation').optional(),
    commonValidations.optionalText('notes')
  ],

  // Notification creation validation
  notificationCreation: [
    commonValidations.mongoId('userId').optional(),
    commonValidations.notificationType(),
    commonValidations.text('title', 1, 200),
    commonValidations.text('message', 1, 1000),
    body('data').optional().isObject().withMessage('Data must be an object'),
    commonValidations.deliveryMethod()
  ],

  // Search validation
  search: [
    commonValidations.searchQuery(),
    commonValidations.page(),
    commonValidations.limit()
  ],

  // Nearby search validation
  nearbySearch: [
    commonValidations.longitude(),
    commonValidations.latitude(),
    commonValidations.distance(),
    commonValidations.page(),
    commonValidations.limit()
  ],

  // Pagination validation
  pagination: [
    commonValidations.page(),
    commonValidations.limit()
  ]
};

/**
 * Custom validation functions
 */
const customValidators = {
  // Validate coordinates array
  isValidCoordinates: (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }
    
    const [longitude, latitude] = coordinates;
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    );
  },

  // Validate MongoDB ObjectId
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  // Validate image URL
  isValidImageUrl: (url) => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url);
  },

  // Validate phone number (basic)
  isValidPhoneNumber: (phone) => {
    return /^\+?[\d\s-()]+$/.test(phone);
  },

  // Validate email format
  isValidEmail: (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  },

  // Validate password strength
  isStrongPassword: (password) => {
    return password.length >= 6 && 
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  }
};

module.exports = {
  commonValidations,
  validationSets,
  customValidators
};