const locationService = require('../services/locationService');
const logger = require('../utils/logger');

/**
 * Update vendor location
 */
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude must be numbers'
      });
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      });
    }

    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';
    const result = await locationService.updateVendorLocation(
      userId,
      longitude,
      latitude
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update location failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
};

/**
 * Get nearby vendors
 */
const getNearbyVendors = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const searchRadius = radius ? parseInt(radius) : 5000;

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates range'
      });
    }

    const vendors = await locationService.getNearbyVendors(lng, lat, searchRadius);

    res.json({
      success: true,
      message: 'Nearby vendors retrieved successfully',
      data: {
        vendors,
        count: vendors.length,
        searchLocation: [lng, lat],
        searchRadius
      }
    });
  } catch (error) {
    logger.error('Get nearby vendors failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve nearby vendors'
    });
  }
};

/**
 * Get nearby consumers
 */
const getNearbyConsumers = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const searchRadius = radius ? parseInt(radius) : 5000;

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates range'
      });
    }

    const consumers = await locationService.getNearbyConsumers(lng, lat, searchRadius);

    res.json({
      success: true,
      message: 'Nearby consumers retrieved successfully',
      data: {
        consumers,
        count: consumers.length,
        searchLocation: [lng, lat],
        searchRadius
      }
    });
  } catch (error) {
    logger.error('Get nearby consumers failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve nearby consumers'
    });
  }
};

/**
 * Remove vendor from active locations (go offline)
 */
const goOffline = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';
    const result = await locationService.removeVendorLocation(userId);

    res.json({
      success: true,
      message: 'Successfully went offline',
      data: result
    });
  } catch (error) {
    logger.error('Go offline failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to go offline'
    });
  }
};

/**
 * Get all active vendor locations (for admin/monitoring)
 */
const getActiveVendors = async (req, res) => {
  try {
    const vendors = await locationService.getActiveVendorLocations();

    res.json({
      success: true,
      message: 'Active vendor locations retrieved successfully',
      data: {
        vendors,
        count: vendors.length
      }
    });
  } catch (error) {
    logger.error('Get active vendors failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve active vendor locations'
    });
  }
};

/**
 * Get location service statistics
 */
const getLocationStats = async (req, res) => {
  try {
    const stats = await locationService.getLocationStats();

    res.json({
      success: true,
      message: 'Location statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    logger.error('Get location stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve location statistics'
    });
  }
};

/**
 * Calculate distance between two points
 */
const calculateDistance = async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({
        success: false,
        message: 'All coordinates (lat1, lon1, lat2, lon2) are required'
      });
    }

    const latitude1 = parseFloat(lat1);
    const longitude1 = parseFloat(lon1);
    const latitude2 = parseFloat(lat2);
    const longitude2 = parseFloat(lon2);

    if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
      return res.status(400).json({
        success: false,
        message: 'All coordinates must be valid numbers'
      });
    }

    const distance = locationService.calculateDistance(
      latitude1,
      longitude1,
      latitude2,
      longitude2
    );

    res.json({
      success: true,
      message: 'Distance calculated successfully',
      data: {
        distance: Math.round(distance), // Distance in meters
        distanceKm: Math.round(distance / 1000 * 100) / 100, // Distance in km (2 decimal places)
        from: [longitude1, latitude1],
        to: [longitude2, latitude2]
      }
    });
  } catch (error) {
    logger.error('Calculate distance failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate distance'
    });
  }
};

module.exports = {
  updateLocation,
  getNearbyVendors,
  getNearbyConsumers,
  goOffline,
  getActiveVendors,
  getLocationStats,
  calculateDistance
};