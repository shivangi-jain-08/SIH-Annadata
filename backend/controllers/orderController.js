const { Order, Product } = require('../models');
const logger = require('../utils/logger');

/**
 * Create a new order
 */
const createOrder = async (req, res) => {
  try {
    const { sellerId, products, deliveryAddress, deliveryLocation, notes } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      if (product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for product ${product.name}`
        });
      }

      // Check minimum order quantity
      if (item.quantity < product.minimumOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${product.name} is ${product.minimumOrderQuantity} ${product.unit}`
        });
      }

      const itemTotal = item.quantity * product.price;
      totalAmount += itemTotal;

      orderProducts.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit
      });
    }

    // Create order
    const buyerId = req.user ? req.user._id : '507f1f77bcf86cd799439011';
    const order = new Order({
      buyerId: buyerId,
      sellerId,
      products: orderProducts,
      totalAmount,
      deliveryAddress,
      deliveryLocation: deliveryLocation ? {
        type: 'Point',
        coordinates: deliveryLocation
      } : undefined,
      notes
    });

    await order.save();

    // Reduce product quantities
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.availableQuantity -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Create order failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name phone email')
      .populate('sellerId', 'name phone email')
      .populate('products.productId', 'name category images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.buyerId._id.toString() !== req.user._id.toString() && 
        order.sellerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order'
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Get order by ID failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order'
    });
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryDate } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to update this order
    if (order.buyerId.toString() !== req.user._id.toString() && 
        order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
    }

    // Update status
    order.status = status;
    if (deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    }
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Update order status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to cancel this order
    if (order.buyerId.toString() !== req.user._id.toString() && 
        order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order'
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    // Restore product quantities if order was confirmed
    if (order.status === 'confirmed' || order.status === 'in_transit') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.availableQuantity += item.quantity;
          await product.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Cancel order failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

/**
 * Get current user's orders
 */
const getMyOrders = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    
    // For testing without auth, return all orders
    if (!req.user) {
      const orders = await Order.find({}).limit(10).sort({ createdAt: -1 })
        .populate('buyerId', 'name phone')
        .populate('sellerId', 'name phone')
        .populate('products.productId', 'name category images');
      
      return res.json({
        success: true,
        message: 'Orders retrieved successfully (test mode)',
        data: {
          orders,
          pagination: { page: 1, limit: 10, total: orders.length, pages: 1 }
        }
      });
    }
    
    const userRole = role || 'buyer';
    let query = {};
    
    if (userRole === 'buyer') {
      query.buyerId = req.user._id;
    } else {
      query.sellerId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('buyerId', 'name phone')
      .populate('sellerId', 'name phone')
      .populate('products.productId', 'name category images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      message: `Your ${userRole} orders retrieved successfully`,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get my orders failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your orders'
    });
  }
};

/**
 * Get orders by status
 */
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ status })
      .populate('buyerId', 'name phone')
      .populate('sellerId', 'name phone')
      .populate('products.productId', 'name category images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ status });

    res.json({
      success: true,
      message: `Orders with status ${status} retrieved successfully`,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get orders by status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders by status'
    });
  }
};

/**
 * Get order statistics
 */
const getOrderStats = async (req, res) => {
  try {
    const { role } = req.query;
    
    let matchQuery = {};
    
    if (role === 'buyer') {
      matchQuery.buyerId = req.user._id;
    } else if (role === 'seller') {
      matchQuery.sellerId = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments(matchQuery);
    const totalRevenue = await Order.aggregate([
      { $match: { ...matchQuery, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        stats: {
          total: totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    logger.error('Get order stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order statistics'
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrdersByStatus,
  getOrderStats
};