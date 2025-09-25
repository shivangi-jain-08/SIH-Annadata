const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['farmer', 'vendor', 'consumer'])
    .withMessage('Role must be farmer, vendor, or consumer'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [longitude, latitude]'),
  body('location.*')
    .optional()
    .isFloat()
    .withMessage('Location coordinates must be numbers'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', 
  authLimiter,
  registerValidation,
  validateRequest,
  authController.register
);

router.post('/login',
  authLimiter,
  loginValidation,
  validateRequest,
  authController.login
);

router.post('/logout',
  authController.logout
);

router.get('/verify-token',
  authenticate,
  authController.verifyTokenEndpoint
);

router.get('/profile',
  authController.getProfile
);

module.exports = router;