const { Order, Product, OrderMessage } = require('../models');
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

    console.log('=== Update Order Status ===');
    console.log('Order ID:', orderId);
    console.log('New Status:', status);
    console.log('User ID:', req.user?._id);
    console.log('Delivery Date:', deliveryDate);

    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', {
      _id: order._id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      currentStatus: order.status
    });

    // Check if user is authorized to update this order
    if (order.buyerId.toString() !== req.user._id.toString() && 
        order.sellerId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt:', {
        userId: req.user._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
    }

    console.log('User authorized. Updating status from', order.status, 'to', status);

    // Update status
    order.status = status;
    if (deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    }
    await order.save();

    console.log('Order status updated successfully:', {
      orderId: order._id,
      newStatus: order.status
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Update order status failed:', error);
    console.error('=== Update Order Status Error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
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
    
    try {
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
    } catch (dbError) {
      // Return mock data if database is not available
      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439016',
          buyerId: {
            _id: '507f1f77bcf86cd799439017',
            name: 'Test Vendor',
            phone: '+1234567891'
          },
          sellerId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Farmer',
            phone: '+1234567890'
          },
          products: [{
            productId: '507f1f77bcf86cd799439014',
            name: 'Fresh Tomatoes',
            quantity: 10,
            price: 45,
            unit: 'kg'
          }],
          status: 'delivered',
          totalAmount: 450,
          deliveryAddress: 'Test Vendor Shop, Delhi, India',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date()
        },
        {
          _id: '507f1f77bcf86cd799439018',
          buyerId: {
            _id: '507f1f77bcf86cd799439019',
            name: 'Test Consumer',
            phone: '+1234567892'
          },
          sellerId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Farmer',
            phone: '+1234567890'
          },
          products: [{
            productId: '507f1f77bcf86cd799439015',
            name: 'Organic Spinach',
            quantity: 5,
            price: 35,
            unit: 'kg'
          }],
          status: 'pending',
          totalAmount: 175,
          deliveryAddress: 'Test Consumer Home, Delhi, India',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      res.json({
        success: true,
        message: 'Orders retrieved successfully (mock data)',
        data: {
          orders: mockOrders,
          pagination: { page: 1, limit: 20, total: mockOrders.length, pages: 1 }
        }
      });
    }
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
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    let matchQuery = {};
    
    if (role === 'buyer') {
      matchQuery.buyerId = req.user._id;
    } else if (role === 'seller') {
      matchQuery.sellerId = req.user._id;
    } else {
      // If no role specified, get both buyer and seller stats
      matchQuery = {
        $or: [
          { buyerId: req.user._id },
          { sellerId: req.user._id }
        ]
      };
    }

    try {
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

      const statusStats = stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
        return acc;
      }, {});

      res.json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: {
          total: totalOrders,
          totalValue: totalRevenue[0]?.total || 0,
          pending: statusStats.pending?.count || 0,
          confirmed: statusStats.confirmed?.count || 0,
          in_transit: statusStats.in_transit?.count || 0,
          delivered: statusStats.delivered?.count || 0,
          cancelled: statusStats.cancelled?.count || 0,
          byStatus: statusStats
        }
      });
    } catch (dbError) {
      // Return default stats if database query fails
      res.json({
        success: true,
        message: 'Order statistics retrieved successfully (default)',
        data: {
          total: 0,
          totalValue: 0,
          pending: 0,
          confirmed: 0,
          in_transit: 0,
          delivered: 0,
          cancelled: 0,
          byStatus: {}
        }
      });
    }
  } catch (error) {
    logger.error('Get order stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order statistics'
    });
  }
};

/**
 * Send message in order context
 */
const sendOrderMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message, messageType = 'text', attachments = [] } = req.body;

    // Verify order exists and user is part of it
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';
    const userRole = req.user ? req.user.role : 'vendor';

    // Check if user is authorized to send messages in this order
    if (order.buyerId.toString() !== userId.toString() && 
        order.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to send messages in this order'
      });
    }

    // Create message
    const orderMessage = new OrderMessage({
      orderId,
      senderId: userId,
      senderRole: userRole,
      message,
      messageType,
      attachments
    });

    await orderMessage.save();

    // Populate sender info
    await orderMessage.populate('senderId', 'name role');

    // Send real-time notification via Socket.io
    const socketHandler = require('../socket/socketHandler');
    if (socketHandler.getIO()) {
      const recipientId = order.buyerId.toString() === userId.toString() 
        ? order.sellerId 
        : order.buyerId;

      socketHandler.getIO().to(`user:${recipientId}`).emit('new-message', {
        orderId,
        message: orderMessage,
        senderName: orderMessage.senderId.name
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: orderMessage }
    });
  } catch (error) {
    logger.error('Send order message failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * Get order conversation
 */
const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify order exists and user is part of it
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';

    // Check if user is authorized to view messages in this order
    if (order.buyerId.toString() !== userId.toString() && 
        order.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view messages in this order'
      });
    }

    // Get messages
    const messages = await OrderMessage.getOrderConversation(orderId, parseInt(limit), parseInt(page));
    const totalMessages = await OrderMessage.countDocuments({ orderId });
    const unreadCount = await OrderMessage.getUnreadCount(orderId, userId);

    // Mark messages as read
    await OrderMessage.markOrderMessagesAsRead(orderId, userId);

    res.json({
      success: true,
      message: 'Order messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Get order messages failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order messages'
    });
  }
};

/**
 * Mark messages as read
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';

    // Verify order exists and user is part of it
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyerId.toString() !== userId.toString() && 
        order.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to mark messages in this order'
      });
    }

    const result = await OrderMessage.markOrderMessagesAsRead(orderId, userId);

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: { messagesUpdated: result.modifiedCount }
    });
  } catch (error) {
    logger.error('Mark messages as read failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

/**
 * Get unread message count for user's orders
 */
const getUnreadMessageCounts = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011';

    // Get user's orders
    const orders = await Order.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    }).select('_id');

    const orderIds = orders.map(order => order._id);

    // Get unread counts for each order
    const unreadCounts = {};
    for (const orderId of orderIds) {
      const count = await OrderMessage.getUnreadCount(orderId, userId);
      if (count > 0) {
        unreadCounts[orderId] = count;
      }
    }

    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      message: 'Unread message counts retrieved successfully',
      data: {
        unreadCounts,
        totalUnread
      }
    });
  } catch (error) {
    logger.error('Get unread message counts failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve unread message counts'
    });
  }
};

/**
 * Get consumer location for specific order (for vendors)
 */
const getConsumerLocationForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name phone location');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the vendor is the seller for this order
    const userId = req.user ? req.user._id.toString() : null;
    if (userId && order.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view consumer location'
      });
    }

    // Only share location if order is confirmed or in_transit
    if (!['confirmed', 'in_transit', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Consumer location available only for confirmed orders'
      });
    }

    const { User } = require('../models');
    const consumer = await User.findById(order.buyerId).select('name phone location lastLocationUpdate');

    res.json({
      success: true,
      message: 'Consumer location retrieved successfully',
      data: {
        location: consumer?.location || order.deliveryLocation,
        consumerName: consumer?.name,
        consumerPhone: consumer?.phone,
        lastUpdate: consumer?.lastLocationUpdate,
        orderId: order._id,
        orderStatus: order.status
      }
    });
  } catch (error) {
    logger.error('Get consumer location for order failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consumer location'
    });
  }
};

/**
 * Share consumer location for specific order
 */
const shareLocationForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, timestamp } = req.body;
    
    if (!location || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the consumer is the buyer for this order
    const userId = req.user ? req.user._id.toString() : null;
    if (userId && order.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to share location for this order'
      });
    }

    // Update consumer's location
    const { User } = require('../models');
    await User.findByIdAndUpdate(order.buyerId, {
      $set: {
        location: location,
        lastLocationUpdate: timestamp || new Date()
      }
    });

    // Broadcast location update to vendor via Socket.io
    const socketService = require('../services/socketService');
    socketService.sendMessageToUser(order.sellerId, 'consumer-location-update', {
      orderId: order._id,
      location: location,
      timestamp: timestamp || new Date()
    });

    res.json({
      success: true,
      message: 'Location shared successfully',
      data: {
        orderId: order._id,
        location,
        timestamp: timestamp || new Date()
      }
    });
  } catch (error) {
    logger.error('Share location for order failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share location'
    });
  }
};

/**
 * Complete order after successful payment
 * Creates order and updates farmer inventory
 */
const completeOrder = async (req, res) => {
  try {
    const { 
      buyerId, 
      items, 
      deliveryAddress, 
      totalAmount,
      subtotal,
      tax,
      deliveryFee,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      status 
    } = req.body;

    // Use authenticated user if not provided
    const actualBuyerId = buyerId || (req.user ? req.user._id : null);
    
    if (!actualBuyerId) {
      return res.status(400).json({
        success: false,
        message: 'Buyer ID is required'
      });
    }

    // Group items by farmer (sellerId)
    const ordersByFarmer = {};
    
    for (const item of items) {
      const farmerId = item.farmerId || item.farmer;
      
      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: `Farmer ID missing for item ${item.name}`
        });
      }

      if (!ordersByFarmer[farmerId]) {
        ordersByFarmer[farmerId] = [];
      }
      
      ordersByFarmer[farmerId].push(item);
    }

    // Create separate orders for each farmer
    const createdOrders = [];
    
    for (const [farmerId, farmerItems] of Object.entries(ordersByFarmer)) {
      // Validate products and update inventory
      const orderProducts = [];
      let farmerTotal = 0;

      for (const item of farmerItems) {
        const product = await Product.findById(item.productId);
        
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name} not found or inactive`
          });
        }

        if (product.availableQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity for product ${product.name}. Available: ${product.availableQuantity}`
          });
        }

        // Reduce inventory immediately
        await product.reduceQuantity(item.quantity);
        
        const itemTotal = item.quantity * item.price;
        farmerTotal += itemTotal;

        orderProducts.push({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: product.unit
        });

        console.log(`✅ Reduced inventory for ${product.name}: ${product.availableQuantity + item.quantity} → ${product.availableQuantity}`);
      }

      // Calculate the correct total amount including delivery fee
      // If there's only one farmer, use the full totalAmount
      // If multiple farmers, distribute delivery fee proportionally
      const numberOfFarmers = Object.keys(ordersByFarmer).length;
      const farmerDeliveryFee = numberOfFarmers > 1 ? (deliveryFee || 0) / numberOfFarmers : (deliveryFee || 0);
      const farmerTotalWithDelivery = farmerTotal + farmerDeliveryFee;

      // Create order for this farmer
      const orderData = {
        buyerId: actualBuyerId,
        sellerId: farmerId,
        products: orderProducts,
        totalAmount: farmerTotalWithDelivery,
        subtotal: farmerTotal,
        deliveryFee: farmerDeliveryFee,
        tax: tax || 0,
        status: status || 'confirmed',
        notes: `Payment Method: ${paymentMethod}\nPayment ID: ${paymentId}\nRazorpay Order ID: ${razorpayOrderId}`
      };

      // Handle delivery address - can be string or object
      if (typeof deliveryAddress === 'string') {
        orderData.deliveryAddress = deliveryAddress;
      } else if (deliveryAddress && typeof deliveryAddress === 'object') {
        // If it's an object, extract the string representation
        if (deliveryAddress.street) {
          orderData.deliveryAddress = `${deliveryAddress.street}${deliveryAddress.city ? ', ' + deliveryAddress.city : ''}${deliveryAddress.state ? ', ' + deliveryAddress.state : ''}${deliveryAddress.pincode ? ' - ' + deliveryAddress.pincode : ''}`;
        } else {
          orderData.deliveryAddress = deliveryAddress.toString();
        }
        
        // Add coordinates if available
        if (deliveryAddress.coordinates && Array.isArray(deliveryAddress.coordinates) && deliveryAddress.coordinates.length === 2) {
          orderData.deliveryLocation = {
            type: 'Point',
            coordinates: deliveryAddress.coordinates
          };
        }
      }

      const order = new Order(orderData);

      await order.save();
      createdOrders.push(order);

      console.log(`✅ Order created for farmer ${farmerId}: ${order._id}`);
    }

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} order(s) created successfully`,
      data: {
        orders: createdOrders,
        orderCount: createdOrders.length,
        totalAmount,
        paymentId
      }
    });

  } catch (error) {
    logger.error('Complete order failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete order: ' + error.message
    });
  }
};

module.exports = {
  createOrder,
  completeOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrdersByStatus,
  getOrderStats,
  sendOrderMessage,
  getOrderMessages,
  markMessagesAsRead,
  getUnreadMessageCounts,
  getConsumerLocationForOrder,
  shareLocationForOrder
};