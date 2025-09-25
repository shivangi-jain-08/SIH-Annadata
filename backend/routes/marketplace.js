const express = require('express');
const { body, query, param } = require('express-validator');

const { Product, User, Order } = require('../models');
const { authenticate: auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const locationService = require('../services/locationService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const locationValidation = [
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters')
];

/**
 * Get products available for consumers from nearby vendors
 */
router.get('/products', auth, async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      longitude, 
      latitude, 
      radius = 5000,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {
      isActive: true,
      availableQuantity: { $gt: 0 }
    };
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    let products;
    
    // Location-based filtering if coordinates provided
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const searchRadius = parseInt(radius);
      
      // Get nearby vendors first
      const nearbyVendors = await locationService.getNearbyVendors(lng, lat, searchRadius);
      const vendorIds = nearbyVendors.map(v => v.vendorId);
      
      if (vendorIds.length > 0) {
        query.sellerId = { $in: vendorIds };
      } else {
        // No nearby vendors, return empty result
        return res.json({
          success: true,
          data: {
            products: [],
            vendors: [],
            pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
          },
          message: 'No products available from nearby vendors'
        });
      }
    }
    
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    products = await Product.find(query)
      .populate('sellerId', 'name phone location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    // Add distance information if location provided
    if (longitude && latitude) {
      const consumerLat = parseFloat(latitude);
      const consumerLng = parseFloat(longitude);
      
      products = products.map(product => {
        const productObj = product.toObject();
        if (product.sellerId.location && product.sellerId.location.coordinates) {
          const vendorLng = product.sellerId.location.coordinates[0];
          const vendorLat = product.sellerId.location.coordinates[1];
          productObj.distance = Math.round(
            locationService.calculateDistance(consumerLat, consumerLng, vendorLat, vendorLng)
          );
        }
        return productObj;
      });
      
      // Sort by distance if requested
      if (sortBy === 'distance') {
        products.sort((a, b) => {
          const distanceA = a.distance || Infinity;
          const distanceB = b.distance || Infinity;
          return sortOrder === 'desc' ? distanceB - distanceA : distanceA - distanceB;
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchLocation: longitude && latitude ? [parseFloat(longitude), parseFloat(latitude)] : null,
        searchRadius: parseInt(radius)
      },
      message: 'Consumer marketplace products retrieved successfully'
    });
  } catch (error) {
    logger.error('Get marketplace products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace products',
      error: error.message
    });
  }
});

/**
 * Get nearby vendors with their products
 */
router.get('/nearby-vendors', auth, locationValidation, validateRequest, async (req, res) => {
  try {
    const { longitude, latitude, radius = 5000 } = req.query;
    
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const searchRadius = parseInt(radius);
    
    // Get nearby vendors
    const nearbyVendors = await locationService.getNearbyVendors(lng, lat, searchRadius);
    
    // Get products for each vendor
    const vendorsWithProducts = await Promise.all(
      nearbyVendors.map(async (vendor) => {
        try {
          const products = await Product.find({
            sellerId: vendor.vendorId,
            isActive: true,
            availableQuantity: { $gt: 0 }
          }).limit(10); // Limit products per vendor for performance
          
          return {
            ...vendor,
            products,
            productCount: products.length
          };
        } catch (error) {
          logger.warn('Failed to get products for vendor', {
            vendorId: vendor.vendorId,
            error: error.message
          });
          return {
            ...vendor,
            products: [],
            productCount: 0
          };
        }
      })
    );
    
    // Filter out vendors with no products
    const activeVendors = vendorsWithProducts.filter(vendor => vendor.productCount > 0);
    
    res.json({
      success: true,
      data: {
        vendors: activeVendors,
        totalVendors: activeVendors.length,
        searchLocation: [lng, lat],
        searchRadius
      },
      message: `Found ${activeVendors.length} nearby vendors with products`
    });
  } catch (error) {
    logger.error('Get nearby vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby vendors',
      error: error.message
    });
  }
});

/**
 * Get specific vendor's products for consumers
 */
router.get('/vendor/:vendorId/products', auth, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;
    
    // Verify vendor exists and is active
    const vendor = await User.findOne({
      _id: vendorId,
      role: 'vendor',
      isActive: true
    }).select('name phone location');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or inactive'
      });
    }
    
    let query = {
      sellerId: vendorId,
      isActive: true,
      availableQuantity: { $gt: 0 }
    };
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    // Get vendor's recent orders for reputation
    const recentOrders = await Order.find({
      sellerId: vendorId,
      status: 'delivered'
    }).limit(10);
    
    const vendorStats = {
      totalProducts: total,
      completedOrders: recentOrders.length,
      averageRating: 4.2, // Mock rating - would calculate from actual reviews
      responseTime: '< 1 hour' // Mock response time
    };
    
    res.json({
      success: true,
      data: {
        vendor: {
          ...vendor.toObject(),
          stats: vendorStats
        },
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Vendor products retrieved successfully'
    });
  } catch (error) {
    logger.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products',
      error: error.message
    });
  }
});

/**
 * Search marketplace products
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { 
      q: searchTerm, 
      category, 
      longitude, 
      latitude, 
      radius = 5000,
      page = 1, 
      limit = 20 
    } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    let query = {
      isActive: true,
      availableQuantity: { $gt: 0 },
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    if (category) {
      query.category = category;
    }
    
    // Location-based filtering
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const searchRadius = parseInt(radius);
      
      const nearbyVendors = await locationService.getNearbyVendors(lng, lat, searchRadius);
      const vendorIds = nearbyVendors.map(v => v.vendorId);
      
      if (vendorIds.length > 0) {
        query.sellerId = { $in: vendorIds };
      } else {
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
          },
          message: 'No products found from nearby vendors'
        });
      }
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('sellerId', 'name phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchTerm,
        searchLocation: longitude && latitude ? [parseFloat(longitude), parseFloat(latitude)] : null
      },
      message: 'Product search completed successfully'
    });
  } catch (error) {
    logger.error('Search marketplace products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
});

/**
 * Get marketplace categories with product counts
 */
router.get('/categories', auth, async (req, res) => {
  try {
    const { longitude, latitude, radius = 5000 } = req.query;
    
    let matchQuery = {
      isActive: true,
      availableQuantity: { $gt: 0 }
    };
    
    // Filter by location if provided
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const searchRadius = parseInt(radius);
      
      const nearbyVendors = await locationService.getNearbyVendors(lng, lat, searchRadius);
      const vendorIds = nearbyVendors.map(v => v.vendorId);
      
      if (vendorIds.length > 0) {
        matchQuery.sellerId = { $in: vendorIds };
      }
    }
    
    const categories = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const formattedCategories = categories.map(cat => ({
      category: cat._id,
      productCount: cat.count,
      priceRange: {
        min: Math.round(cat.minPrice),
        max: Math.round(cat.maxPrice),
        avg: Math.round(cat.avgPrice)
      }
    }));
    
    res.json({
      success: true,
      data: {
        categories: formattedCategories,
        totalCategories: categories.length
      },
      message: 'Marketplace categories retrieved successfully'
    });
  } catch (error) {
    logger.error('Get marketplace categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace categories',
      error: error.message
    });
  }
});

module.exports = router;