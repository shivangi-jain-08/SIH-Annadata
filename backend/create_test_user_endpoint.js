// Temporary endpoint to create test user
const express = require('express');
const { User } = require('./models');

const router = express.Router();

router.post('/create-test-user', async (req, res) => {
  try {
    // Create the test user that matches the socket mock user
    const testUser = new User({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Consumer',
      email: 'test.consumer@example.com',
      phone: '+919999999999',
      password: 'hashedpassword', // This won't be used for testing
      role: 'consumer',
      location: {
        type: 'Point',
        coordinates: [75.705, 31.252] // Close to simulation
      },
      notificationPreferences: {
        proximityNotifications: {
          enabled: true,
          radius: 1000, // 1km
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        },
        doNotDisturb: false
      },
      isActive: true
    });

    await testUser.save();

    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: testUser._id,
        name: testUser.name,
        role: testUser.role,
        location: testUser.location,
        notificationPreferences: testUser.notificationPreferences
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      // User already exists, update it instead
      try {
        const updatedUser = await User.findByIdAndUpdate(
          '507f1f77bcf86cd799439011',
          {
            location: {
              type: 'Point',
              coordinates: [75.705, 31.252]
            },
            notificationPreferences: {
              proximityNotifications: {
                enabled: true,
                radius: 1000,
                quietHours: {
                  enabled: false,
                  start: '22:00',
                  end: '08:00'
                }
              },
              doNotDisturb: false
            },
            isActive: true
          },
          { new: true }
        );

        res.json({
          success: true,
          message: 'Test user updated successfully',
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            role: updatedUser.role,
            location: updatedUser.location,
            notificationPreferences: updatedUser.notificationPreferences
          }
        });
      } catch (updateError) {
        res.status(500).json({
          success: false,
          message: 'Failed to update existing user',
          error: updateError.message
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create test user',
        error: error.message
      });
    }
  }
});

// Create test vendor user
router.post('/create-test-vendor', async (req, res) => {
  try {
    const testVendor = new User({
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Vendor',
      email: 'test.vendor@example.com',
      phone: '+919999999998',
      password: 'hashedpassword',
      role: 'vendor',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      },
      isActive: true
    });

    await testVendor.save();

    res.json({
      success: true,
      message: 'Test vendor created successfully',
      user: {
        id: testVendor._id,
        name: testVendor.name,
        role: testVendor.role,
        location: testVendor.location
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      res.json({
        success: true,
        message: 'Test vendor already exists',
        user: {
          id: '507f1f77bcf86cd799439012',
          name: 'Test Vendor',
          role: 'vendor'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create test vendor',
        error: error.message
      });
    }
  }
});

// Create test farmer user
router.post('/create-test-farmer', async (req, res) => {
  try {
    const testFarmer = new User({
      _id: '507f1f77bcf86cd799439013',
      name: 'Test Farmer',
      email: 'test.farmer@example.com',
      phone: '+919999999997',
      password: 'hashedpassword',
      role: 'farmer',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      },
      isActive: true
    });

    await testFarmer.save();

    res.json({
      success: true,
      message: 'Test farmer created successfully',
      user: {
        id: testFarmer._id,
        name: testFarmer.name,
        role: testFarmer.role,
        location: testFarmer.location
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      res.json({
        success: true,
        message: 'Test farmer already exists',
        user: {
          id: '507f1f77bcf86cd799439013',
          name: 'Test Farmer',
          role: 'farmer'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create test farmer',
        error: error.message
      });
    }
  }
});

// Mock login endpoint for testing
router.post('/mock-login', async (req, res) => {
  try {
    const { role = 'vendor' } = req.body;
    
    let userId;
    let userName;
    
    switch (role) {
      case 'vendor':
        userId = '507f1f77bcf86cd799439012';
        userName = 'Test Vendor';
        break;
      case 'farmer':
        userId = '507f1f77bcf86cd799439013';
        userName = 'Test Farmer';
        break;
      case 'consumer':
        userId = '507f1f77bcf86cd799439011';
        userName = 'Test Consumer';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
    }
    
    // Generate a simple mock token
    const mockToken = `mock-token-${userId}-${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Mock login successful',
      data: {
        token: mockToken,
        user: {
          _id: userId,
          name: userName,
          role: role,
          email: `test.${role}@example.com`
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Mock login failed',
      error: error.message
    });
  }
});

// Create test products from farmer
router.post('/create-test-products', async (req, res) => {
  try {
    const { Product } = require('./models');
    
    const testProducts = [
      {
        _id: '507f1f77bcf86cd799439014',
        sellerId: '507f1f77bcf86cd799439013', // Test farmer
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, freshly harvested',
        category: 'vegetables',
        price: 45,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 5,
        images: [],
        isActive: true,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }
      },
      {
        _id: '507f1f77bcf86cd799439015',
        sellerId: '507f1f77bcf86cd799439013', // Test farmer
        name: 'Organic Spinach',
        description: 'Fresh green spinach leaves',
        category: 'vegetables',
        price: 35,
        unit: 'kg',
        availableQuantity: 50,
        minimumOrderQuantity: 2,
        images: [],
        isActive: true,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }
      },
      {
        _id: '507f1f77bcf86cd799439016',
        sellerId: '507f1f77bcf86cd799439013', // Test farmer
        name: 'Fresh Carrots',
        description: 'Orange carrots, crunchy and sweet',
        category: 'vegetables',
        price: 40,
        unit: 'kg',
        availableQuantity: 75,
        minimumOrderQuantity: 3,
        images: [],
        isActive: true,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }
      }
    ];

    // Delete existing test products first
    await Product.deleteMany({ _id: { $in: testProducts.map(p => p._id) } });
    
    // Insert new test products
    await Product.insertMany(testProducts);

    res.json({
      success: true,
      message: 'Test products created successfully',
      products: testProducts.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test products',
      error: error.message
    });
  }
});

module.exports = router;