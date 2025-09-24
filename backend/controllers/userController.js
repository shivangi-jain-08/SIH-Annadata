const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // For testing without auth, return a mock user or first user
    if (!req.user) {
      const user = await User.findOne().select('-password');
      return res.json({
        success: true,
        message: 'Profile retrieved successfully (test mode)',
        data: { user: user || { name: 'Test User', role: 'farmer', email: 'test@example.com' } }
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Get profile failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location } = req.body;

    // For testing without auth, return success with mock data
    if (!req.user) {
      return res.json({
        success: true,
        message: 'Profile updated successfully (test mode)',
        data: { user: { name: name || 'Test User', phone, address, location } }
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (location && Array.isArray(location) && location.length === 2) {
      updates.location = {
        type: 'Point',
        coordinates: location
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update profile failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Update current user location
 */
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // For testing without auth, return success with mock data
    if (!req.user) {
      return res.json({
        success: true,
        message: 'Location updated successfully (test mode)',
        data: { user: { location: { type: 'Point', coordinates: [lng, lat] } } }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update location failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Get user by ID failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
};

/**
 * Get nearby users
 */
const getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance, role } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const distance = maxDistance ? parseInt(maxDistance) : 10000;

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: distance
        }
      }
    };

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name role location phone')
      .limit(50);

    res.json({
      success: true,
      message: 'Nearby users retrieved successfully',
      data: {
        users,
        count: users.length,
        searchRadius: distance
      }
    });
  } catch (error) {
    logger.error('Get nearby users failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby users'
    });
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res) => {
  try {
    const { q: searchTerm, role, page = 1, limit = 20 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    let query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('name role location phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'User search completed successfully',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchTerm
      }
    });
  } catch (error) {
    logger.error('Search users failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

/**
 * Get users by role
 */
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { isActive, page = 1, limit = 20 } = req.query;

    let query = { role };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('name role location phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: `Users with role ${role} retrieved successfully`,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        role
      }
    });
  } catch (error) {
    logger.error('Get users by role failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users by role'
    });
  }
};

/**
 * Get user statistics (admin only)
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        stats: {
          total: totalUsers,
          active: activeUsers,
          byRole: stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    logger.error('Get user stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocation,
  getUserById,
  getNearbyUsers,
  searchUsers,
  getUsersByRole,
  getUserStats
};