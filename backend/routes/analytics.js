const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { authenticate: auth, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../utils/logger');

const router = express.Router();

// Get vendor location analytics
router.get('/vendor-location', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Get vendor's location history and analytics
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate analytics from orders and location data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get orders for analytics
    const orders = await Order.find({
      sellerId: vendorId,
      createdAt: { $gte: startOfMonth }
    }).populate('buyerId', 'name role');

    // Filter consumer orders (not farmer orders)
    const consumerOrders = orders.filter(order => 
      order.buyerId && order.buyerId.role === 'consumer'
    );

    // Calculate metrics
    const totalOnlineTime = vendor.locationHistory?.totalOnlineTime || 0;
    const averageSessionTime = vendor.locationHistory?.averageSessionTime || 0;
    const ordersReceived = consumerOrders.length;
    const proximityNotificationsSent = vendor.locationHistory?.proximityNotificationsSent || 0;
    const uniqueConsumersReached = new Set(consumerOrders.map(order => order.buyerId._id.toString())).size;
    const conversionRate = proximityNotificationsSent > 0 ? ordersReceived / proximityNotificationsSent : 0;

    // Calculate peak hours from order data
    const hourCounts = {};
    consumerOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${parseInt(hour) + 1}:00`);

    const analytics = {
      totalOnlineTime,
      averageSessionTime,
      ordersReceived,
      proximityNotificationsSent,
      uniqueConsumersReached,
      peakHours,
      conversionRate: Math.round(conversionRate * 100) / 100
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    logger.error('Error fetching vendor location analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location analytics'
    });
  }
});

// Get vendor dashboard stats
router.get('/vendor-dashboard', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get orders statistics
    const [
      totalOrders,
      monthlyOrders,
      weeklyOrders,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      Order.countDocuments({ sellerId: vendorId }),
      Order.countDocuments({ 
        sellerId: vendorId, 
        createdAt: { $gte: startOfMonth } 
      }),
      Order.countDocuments({ 
        sellerId: vendorId, 
        createdAt: { $gte: startOfWeek } 
      }),
      Order.countDocuments({ 
        sellerId: vendorId, 
        status: { $in: ['pending', 'accepted'] } 
      }),
      Order.countDocuments({ 
        sellerId: vendorId, 
        status: 'delivered' 
      })
    ]);

    // Get revenue statistics
    const revenueAggregation = await Order.aggregate([
      { $match: { sellerId: vendorId, status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfMonth] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = revenueAggregation[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    // Get product statistics
    const [totalProducts, activeProducts] = await Promise.all([
      Product.countDocuments({ sellerId: vendorId }),
      Product.countDocuments({ 
        sellerId: vendorId, 
        isActive: true,
        availableQuantity: { $gt: 0 }
      })
    ]);

    const stats = {
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        weekly: weeklyOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: revenue.totalRevenue,
        monthly: revenue.monthlyRevenue
      },
      products: {
        total: totalProducts,
        active: activeProducts
      }
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Error fetching vendor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get vendor performance metrics
router.get('/vendor-performance', auth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Verify user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get performance metrics
    const orders = await Order.find({
      sellerId: vendorId,
      createdAt: { $gte: startDate }
    }).populate('buyerId', 'name role');

    // Calculate daily performance
    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          orders: 0,
          revenue: 0,
          consumers: new Set()
        };
      }
      dailyStats[date].orders += 1;
      if (order.status === 'delivered') {
        dailyStats[date].revenue += order.totalAmount;
      }
      if (order.buyerId && order.buyerId.role === 'consumer') {
        dailyStats[date].consumers.add(order.buyerId._id.toString());
      }
    });

    // Convert to array format
    const performanceData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      orders: stats.orders,
      revenue: stats.revenue,
      uniqueConsumers: stats.consumers.size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: { 
        performance: performanceData,
        period: days
      }
    });

  } catch (error) {
    logger.error('Error fetching vendor performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics'
    });
  }
});

module.exports = router;