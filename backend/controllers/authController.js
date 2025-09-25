const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, phone, password, role, name, location, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user data
    const userData = {
      email,
      phone,
      password,
      role,
      name,
      address
    };

    // Add location if provided
    if (location && location.length === 2) {
      userData.location = {
        type: 'Point',
        coordinates: location
      };
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Update last login
    await user.updateLastLogin();

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
          location: user.location,
          address: user.address,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        token: user._id.toString() // Simple token for now
      }
    });
  } catch (error) {
    logger.error('Registration failed:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
          location: user.location,
          address: user.address,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token: user._id.toString() // Simple token for now
      }
    });
  } catch (error) {
    logger.error('Login failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we'll just return success
    
    logger.info('User logged out', {
      userId: req.user._id,
      email: req.user.email
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Verify token
 */
const verifyTokenEndpoint = async (req, res) => {
  try {
    // Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
    }

    // If we reach here, the token is valid (middleware already verified it)
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          phone: req.user.phone,
          name: req.user.name,
          role: req.user.role,
          location: req.user.location,
          address: req.user.address,
          isActive: req.user.isActive,
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          phone: req.user.phone,
          name: req.user.name,
          role: req.user.role,
          location: req.user.location,
          address: req.user.address,
          isActive: req.user.isActive,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt
        }
      }
    });
  } catch (error) {
    logger.error('Get profile failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyTokenEndpoint,
  getProfile
};