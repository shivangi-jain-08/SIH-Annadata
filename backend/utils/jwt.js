const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = null) => {
  try {
    const options = {};
    if (expiresIn) {
      options.expiresIn = expiresIn;
    } else {
      options.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    logger.error('Token generation failed:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      logger.error('Token verification failed:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode failed:', error);
    return null;
  }
};

/**
 * Generate access and refresh token pair
 */
const generateTokenPair = (payload) => {
  const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '24h');
  const refreshToken = generateToken(
    { userId: payload.userId }, 
    process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  };
};

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateTokenPair,
  extractTokenFromHeader
};