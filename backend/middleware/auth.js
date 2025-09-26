const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Simple authentication middleware - uses user ID as token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    let user;
    
    // Handle mock tokens for testing
    if (token.startsWith('mock-token-')) {
      const userId = token.split('-')[2];
      user = await User.findById(userId).select('-password');
    } else {
      // For now, token is just the user ID
      user = await User.findById(token).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Authorization middleware - checks user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const user = await User.findById(token).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user owns resource
 */
const checkOwnership = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get resource user ID from request params, body, or resource object
    let resourceUserId;
    
    if (req.resource && req.resource[resourceUserField]) {
      resourceUserId = req.resource[resourceUserField].toString();
    } else if (req.params[resourceUserField]) {
      resourceUserId = req.params[resourceUserField];
    } else if (req.body[resourceUserField]) {
      resourceUserId = req.body[resourceUserField];
    }

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ownership cannot be determined'
      });
    }

    if (resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not resource owner'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership
};