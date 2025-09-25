const express = require('express');
const { body, param, query } = require('express-validator');

const { validateRequest } = require('../middleware/validation');
const vendorSimulationService = require('../services/vendorSimulationService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const createSimulationValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('initialLocation')
    .isObject()
    .withMessage('Initial location is required'),
  body('initialLocation.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('initialLocation.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('movementPattern')
    .optional()
    .isIn(['static', 'linear', 'circular', 'random'])
    .withMessage('Movement pattern must be static, linear, circular, or random'),
  body('speed')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Speed must be between 0.1 and 50 km/h'),
  body('radius')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('Radius must be between 10 and 5000 meters'),
  body('route')
    .optional()
    .isArray()
    .withMessage('Route must be an array'),
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array')
];

const updateLocationValidation = [
  param('simulationId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Simulation ID is required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
];

const simulationIdValidation = [
  param('simulationId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Simulation ID is required')
];

// Routes

/**
 * Create a new vendor simulation
 */
router.post('/simulate-vendor', 
  createSimulationValidation,
  validateRequest,
  async (req, res) => {
    try {
      const result = await vendorSimulationService.createSimulation(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Vendor simulation created successfully',
        data: result.simulation
      });
    } catch (error) {
      logger.error('Create simulation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create vendor simulation'
      });
    }
  }
);

/**
 * Update simulation location
 */
router.put('/simulate-vendor/:simulationId/location',
  updateLocationValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { simulationId } = req.params;
      const { longitude, latitude } = req.body;
      
      const result = await vendorSimulationService.updateLocation(
        simulationId, 
        longitude, 
        latitude
      );
      
      res.json({
        success: true,
        message: 'Simulation location updated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Update simulation location failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update simulation location'
      });
    }
  }
);

/**
 * Start simulation movement
 */
router.post('/simulate-vendor/:simulationId/start',
  simulationIdValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { simulationId } = req.params;
      
      const result = await vendorSimulationService.startSimulation(simulationId);
      
      res.json({
        success: true,
        message: 'Simulation started successfully',
        data: { simulationId, status: 'running' }
      });
    } catch (error) {
      logger.error('Start simulation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start simulation'
      });
    }
  }
);

/**
 * Stop simulation movement
 */
router.post('/simulate-vendor/:simulationId/stop',
  simulationIdValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { simulationId } = req.params;
      
      const result = vendorSimulationService.stopSimulation(simulationId);
      
      res.json({
        success: true,
        message: 'Simulation stopped successfully',
        data: { simulationId, status: 'stopped' }
      });
    } catch (error) {
      logger.error('Stop simulation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to stop simulation'
      });
    }
  }
);

/**
 * Get simulation details
 */
router.get('/simulate-vendor/:simulationId',
  simulationIdValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { simulationId } = req.params;
      
      const result = await vendorSimulationService.getSimulation(simulationId);
      
      res.json({
        success: true,
        message: 'Simulation details retrieved successfully',
        data: result.simulation
      });
    } catch (error) {
      logger.error('Get simulation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve simulation details'
      });
    }
  }
);

/**
 * List all simulations
 */
router.get('/simulate-vendor',
  async (req, res) => {
    try {
      const result = await vendorSimulationService.listSimulations();
      
      res.json({
        success: true,
        message: 'Simulations retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('List simulations failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve simulations'
      });
    }
  }
);

/**
 * Delete simulation
 */
router.delete('/simulate-vendor/:simulationId',
  simulationIdValidation,
  validateRequest,
  async (req, res) => {
    try {
      const { simulationId } = req.params;
      
      const result = await vendorSimulationService.deleteSimulation(simulationId);
      
      res.json({
        success: true,
        message: 'Simulation deleted successfully',
        data: { simulationId }
      });
    } catch (error) {
      logger.error('Delete simulation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete simulation'
      });
    }
  }
);

/**
 * Stop all simulations
 */
router.post('/simulate-vendor/stop-all',
  async (req, res) => {
    try {
      const result = vendorSimulationService.stopAllSimulations();
      
      res.json({
        success: true,
        message: 'All simulations stopped successfully',
        data: result
      });
    } catch (error) {
      logger.error('Stop all simulations failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to stop all simulations'
      });
    }
  }
);

/**
 * Get simulation statistics
 */
router.get('/simulate-vendor/stats',
  async (req, res) => {
    try {
      const stats = await vendorSimulationService.getSimulationStats();
      
      res.json({
        success: true,
        message: 'Simulation statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      logger.error('Get simulation stats failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve simulation statistics'
      });
    }
  }
);

/**
 * Cleanup old simulations
 */
router.delete('/simulate-vendor/cleanup',
  async (req, res) => {
    try {
      const hoursOld = parseInt(req.query.hours) || 24;
      const result = await vendorSimulationService.cleanupOldSimulations(hoursOld);
      
      res.json({
        success: true,
        message: 'Old simulations cleaned up successfully',
        data: result
      });
    } catch (error) {
      logger.error('Cleanup simulations failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup old simulations'
      });
    }
  }
);

/**
 * Reset notification cooldowns (for testing)
 */
router.post('/simulate-vendor/reset-cooldowns',
  async (req, res) => {
    try {
      vendorSimulationService.resetNotificationCooldowns();
      
      res.json({
        success: true,
        message: 'Notification cooldowns reset successfully'
      });
    } catch (error) {
      logger.error('Reset cooldowns failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset notification cooldowns'
      });
    }
  }
);

module.exports = router;