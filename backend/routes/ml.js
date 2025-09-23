const express = require('express');
const { body, query, param } = require('express-validator');

const mlController = require('../controllers/mlController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');
const { mlLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const diseaseDetectionValidation = [
  body('cropType')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Crop type must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [longitude, latitude]'),
  body('location.*')
    .optional()
    .isFloat()
    .withMessage('Location coordinates must be numbers')
];

const farmerIdValidation = [
  param('farmerId')
    .isMongoId()
    .withMessage('Invalid farmer ID format')
];

const cropNameValidation = [
  param('cropName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Crop name must be between 2 and 100 characters')
];

const diseaseNameValidation = [
  param('diseaseName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Disease name must be between 2 and 100 characters')
];

const cropTypeValidation = [
  param('cropType')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Crop type must be between 2 and 100 characters')
];

const areaValidation = [
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

// Hardware Message Routes

// Get current user's hardware messages
router.get('/hardware-messages',
  mlController.getHardwareMessages
);

// Get latest hardware message for current user
router.get('/hardware-messages/latest',
  mlController.getLatestHardwareMessage
);

// Crop Recommendation Routes

// Get current user's crop recommendations
router.get('/crop-recommendations',
  mlController.getCropRecommendations
);

// Get latest crop recommendation for current user
router.get('/crop-recommendations/latest',
  mlController.getLatestCropRecommendation
);

// Disease Detection Routes

// Detect disease from uploaded image
router.post('/disease-detection',
  mlLimiter,
  uploadSingle('image'),
  diseaseDetectionValidation,
  validateRequest,
  mlController.detectDisease
);

// Get current user's disease reports
router.get('/disease-reports',
  mlController.getDiseaseReports
);

// Get disease reports by farmer ID
router.get('/disease-reports/farmer/:farmerId',
  farmerIdValidation,
  validateRequest,
  mlController.getDiseaseReportsByFarmer
);

// Get disease reports by disease name
router.get('/disease-reports/disease/:diseaseName',
  diseaseNameValidation,
  validateRequest,
  mlController.getDiseaseReportsByDisease
);

// ML Service Health
router.get('/health',
  mlController.getMLServiceHealth
);

module.exports = router;