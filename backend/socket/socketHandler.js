const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const logger = require('../utils/logger');

class SocketHandler {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userRooms = new Map(); // userId -> Set of rooms
  }

  /**
   * Initialize Socket.io server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // No authentication middleware for testing

    // Connection handling
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.io server initialized');
    return this.io;
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    // Set mock user data for testing (since auth is disabled)
    socket.userId = socket.userId || '507f1f77bcf86cd799439011';
    socket.userRole = socket.userRole || 'consumer';
    socket.userName = socket.userName || 'Test User';
    
    const userId = socket.userId;
    const userRole = socket.userRole;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }

    // Join user-specific room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    this.userRooms.get(userId).add(userRoom);

    // Join role-specific room
    const roleRoom = `role:${userRole}`;
    socket.join(roleRoom);
    this.userRooms.get(userId).add(roleRoom);

    logger.info('User connected via Socket.io', {
      userId,
      userRole,
      socketId: socket.id,
      userName: socket.userName
    });

    // Set up event handlers
    this.setupEventHandlers(socket);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected successfully',
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });
  }

  /**
   * Set up event handlers for socket
   */
  setupEventHandlers(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;

    // Join specific rooms
    socket.on('join-room', (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Leave specific rooms
    socket.on('leave-room', (data) => {
      this.handleLeaveRoom(socket, data);
    });

    // Vendor location updates
    if (userRole === 'vendor') {
      socket.on('vendor-location-update', (data) => {
        this.handleVendorLocationUpdate(socket, data);
      });

      socket.on('vendor-online', (data) => {
        this.handleVendorOnline(socket, data);
      });

      socket.on('vendor-offline', () => {
        this.handleVendorOffline(socket);
      });
    }

    // Consumer location updates
    if (userRole === 'consumer') {
      socket.on('consumer-location-update', (data) => {
        this.handleConsumerLocationUpdate(socket, data);
      });
    }

    // Order status updates
    socket.on('order-status-update', (data) => {
      this.handleOrderStatusUpdate(socket, data);
    });

    // Notification acknowledgment
    socket.on('notification-received', (data) => {
      this.handleNotificationReceived(socket, data);
    });

    // Order messaging
    socket.on('send-order-message', (data) => {
      this.handleSendOrderMessage(socket, data);
    });

    socket.on('typing-in-order', (data) => {
      this.handleTypingInOrder(socket, data);
    });

    socket.on('stop-typing-in-order', (data) => {
      this.handleStopTypingInOrder(socket, data);
    });

    // Marketplace events
    socket.on('product-updated', (data) => {
      this.handleProductUpdated(socket, data);
    });

    socket.on('new-order-created', (data) => {
      this.handleNewOrderCreated(socket, data);
    });

    // Chat/messaging (for future use)
    socket.on('send-message', (data) => {
      this.handleSendMessage(socket, data);
    });

    // Typing indicators (for future use)
    socket.on('typing-start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing-stop', (data) => {
      this.handleTypingStop(socket, data);
    });
  }

  /**
   * Handle user joining a room
   */
  handleJoinRoom(socket, data) {
    try {
      const { roomId, roomType } = data;
      
      if (!roomId || !roomType) {
        socket.emit('error', { message: 'Room ID and type are required' });
        return;
      }

      // Validate room access based on user role and room type
      if (!this.validateRoomAccess(socket, roomType, roomId)) {
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }

      const fullRoomId = `${roomType}:${roomId}`;
      socket.join(fullRoomId);
      this.userRooms.get(socket.userId).add(fullRoomId);

      socket.emit('room-joined', {
        roomId: fullRoomId,
        message: `Joined ${roomType} room successfully`
      });

      logger.info('User joined room', {
        userId: socket.userId,
        roomId: fullRoomId,
        socketId: socket.id
      });
    } catch (error) {
      logger.error('Join room failed:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle user leaving a room
   */
  handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      socket.leave(roomId);
      this.userRooms.get(socket.userId)?.delete(roomId);

      socket.emit('room-left', {
        roomId,
        message: 'Left room successfully'
      });

      logger.info('User left room', {
        userId: socket.userId,
        roomId,
        socketId: socket.id
      });
    } catch (error) {
      logger.error('Leave room failed:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  /**
   * Handle vendor location updates
   */
  handleVendorLocationUpdate(socket, data) {
    try {
      const { longitude, latitude, isActive } = data;

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      // Double-check that this is actually a vendor to prevent flooding
      if (socket.userRole !== 'vendor') {
        logger.warn('Non-vendor attempted location update', {
          userId: socket.userId,
          userRole: socket.userRole
        });
        return;
      }

      // Update location in database and trigger proximity checks
      setImmediate(async () => {
        try {
          const locationService = require('../services/locationService');
          await locationService.updateVendorLocation(socket.userId, longitude, latitude);
        } catch (updateError) {
          logger.error('Failed to update vendor location from socket', {
            vendorId: socket.userId,
            error: updateError.message
          });
        }
      });

      // Broadcast location update to nearby consumers
      const locationData = {
        vendorId: socket.userId,
        vendorName: socket.userName,
        coordinates: [longitude, latitude],
        isActive: isActive !== false,
        timestamp: new Date().toISOString()
      };

      // Broadcast to consumers in the area
      this.io.to('role:consumer').emit('vendor-location-updated', locationData);

      // Send confirmation to vendor
      socket.emit('location-update-confirmed', {
        coordinates: [longitude, latitude],
        timestamp: new Date().toISOString()
      });

      logger.info('Vendor location updated via Socket.io', {
        vendorId: socket.userId,
        coordinates: [longitude, latitude],
        isActive
      });
    } catch (error) {
      logger.error('Vendor location update failed:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  /**
   * Handle vendor going online
   */
  handleVendorOnline(socket, data) {
    try {
      const { longitude, latitude } = data;

      const onlineData = {
        vendorId: socket.userId,
        vendorName: socket.userName,
        coordinates: longitude && latitude ? [longitude, latitude] : null,
        status: 'online',
        timestamp: new Date().toISOString()
      };

      // Notify consumers that vendor is online
      this.io.to('role:consumer').emit('vendor-online', onlineData);

      logger.info('Vendor went online', {
        vendorId: socket.userId,
        coordinates: onlineData.coordinates
      });
    } catch (error) {
      logger.error('Vendor online failed:', error);
      socket.emit('error', { message: 'Failed to go online' });
    }
  }

  /**
   * Handle vendor going offline
   */
  handleVendorOffline(socket) {
    try {
      const offlineData = {
        vendorId: socket.userId,
        vendorName: socket.userName,
        status: 'offline',
        timestamp: new Date().toISOString()
      };

      // Notify consumers that vendor is offline
      this.io.to('role:consumer').emit('vendor-offline', offlineData);

      logger.info('Vendor went offline', {
        vendorId: socket.userId
      });
    } catch (error) {
      logger.error('Vendor offline failed:', error);
    }
  }

  /**
   * Handle consumer location updates
   */
  handleConsumerLocationUpdate(socket, data) {
    try {
      const { longitude, latitude } = data;

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      // Update consumer location in database
      setImmediate(async () => {
        try {
          const { User } = require('../models');
          await User.findByIdAndUpdate(socket.userId, {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          });

          logger.debug('Consumer location updated via Socket.io', {
            consumerId: socket.userId,
            coordinates: [longitude, latitude]
          });
        } catch (updateError) {
          logger.error('Failed to update consumer location from socket', {
            consumerId: socket.userId,
            error: updateError.message
          });
        }
      });

      // Send confirmation to consumer
      socket.emit('location-update-confirmed', {
        coordinates: [longitude, latitude],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Consumer location update failed:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  /**
   * Handle order status updates
   */
  handleOrderStatusUpdate(socket, data) {
    try {
      const { orderId, status, buyerId, sellerId } = data;

      if (!orderId || !status) {
        socket.emit('error', { message: 'Order ID and status are required' });
        return;
      }

      const updateData = {
        orderId,
        status,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      };

      // Notify both buyer and seller
      if (buyerId) {
        this.io.to(`user:${buyerId}`).emit('order-updated', updateData);
      }
      if (sellerId && sellerId !== buyerId) {
        this.io.to(`user:${sellerId}`).emit('order-updated', updateData);
      }

      logger.info('Order status updated via Socket.io', {
        orderId,
        status,
        updatedBy: socket.userId
      });
    } catch (error) {
      logger.error('Order status update failed:', error);
      socket.emit('error', { message: 'Failed to update order status' });
    }
  }

  /**
   * Handle notification received acknowledgment
   */
  handleNotificationReceived(socket, data) {
    try {
      const { notificationId } = data;

      logger.info('Notification received acknowledgment', {
        userId: socket.userId,
        notificationId,
        socketId: socket.id
      });

      // You could update notification delivery status here
    } catch (error) {
      logger.error('Notification received handling failed:', error);
    }
  }

  /**
   * Handle sending order messages
   */
  handleSendOrderMessage(socket, data) {
    try {
      const { orderId, message, messageType } = data;

      if (!orderId || !message) {
        socket.emit('error', { message: 'Order ID and message are required' });
        return;
      }

      const messageData = {
        orderId,
        senderId: socket.userId,
        senderName: socket.userName,
        message,
        messageType: messageType || 'text',
        timestamp: new Date().toISOString()
      };

      // Broadcast to order room
      this.io.to(`order:${orderId}`).emit('order-message-received', messageData);

      logger.info('Order message sent via Socket.io', {
        orderId,
        senderId: socket.userId,
        messageType
      });
    } catch (error) {
      logger.error('Send order message failed:', error);
      socket.emit('error', { message: 'Failed to send order message' });
    }
  }

  /**
   * Handle typing in order
   */
  handleTypingInOrder(socket, data) {
    try {
      const { orderId } = data;

      if (orderId) {
        socket.to(`order:${orderId}`).emit('user-typing-in-order', {
          orderId,
          userId: socket.userId,
          userName: socket.userName,
          isTyping: true
        });
      }
    } catch (error) {
      logger.error('Typing in order failed:', error);
    }
  }

  /**
   * Handle stop typing in order
   */
  handleStopTypingInOrder(socket, data) {
    try {
      const { orderId } = data;

      if (orderId) {
        socket.to(`order:${orderId}`).emit('user-typing-in-order', {
          orderId,
          userId: socket.userId,
          userName: socket.userName,
          isTyping: false
        });
      }
    } catch (error) {
      logger.error('Stop typing in order failed:', error);
    }
  }

  /**
   * Handle product updates
   */
  handleProductUpdated(socket, data) {
    try {
      const { productId, updates } = data;

      if (!productId) {
        socket.emit('error', { message: 'Product ID is required' });
        return;
      }

      const updateData = {
        productId,
        vendorId: socket.userId,
        vendorName: socket.userName,
        updates,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all consumers
      this.io.to('role:consumer').emit('product-updated', updateData);

      logger.info('Product update broadcasted', {
        productId,
        vendorId: socket.userId,
        updates
      });
    } catch (error) {
      logger.error('Product update broadcast failed:', error);
    }
  }

  /**
   * Handle new order created
   */
  handleNewOrderCreated(socket, data) {
    try {
      const { orderId, sellerId, orderData } = data;

      if (!orderId || !sellerId) {
        socket.emit('error', { message: 'Order ID and seller ID are required' });
        return;
      }

      const newOrderData = {
        orderId,
        buyerId: socket.userId,
        buyerName: socket.userName,
        orderData,
        timestamp: new Date().toISOString()
      };

      // Notify the seller
      this.io.to(`user:${sellerId}`).emit('new-order-received', newOrderData);

      logger.info('New order notification sent', {
        orderId,
        buyerId: socket.userId,
        sellerId
      });
    } catch (error) {
      logger.error('New order notification failed:', error);
    }
  }

  /**
   * Handle sending messages (for future chat feature)
   */
  handleSendMessage(socket, data) {
    try {
      const { recipientId, message, messageType } = data;

      if (!recipientId || !message) {
        socket.emit('error', { message: 'Recipient ID and message are required' });
        return;
      }

      const messageData = {
        senderId: socket.userId,
        senderName: socket.userName,
        recipientId,
        message,
        messageType: messageType || 'text',
        timestamp: new Date().toISOString()
      };

      // Send to recipient
      this.io.to(`user:${recipientId}`).emit('message-received', messageData);

      // Send confirmation to sender
      socket.emit('message-sent', {
        messageId: Date.now().toString(),
        recipientId,
        timestamp: messageData.timestamp
      });

      logger.info('Message sent via Socket.io', {
        senderId: socket.userId,
        recipientId,
        messageType
      });
    } catch (error) {
      logger.error('Send message failed:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing start
   */
  handleTypingStart(socket, data) {
    try {
      const { recipientId } = data;

      if (recipientId) {
        this.io.to(`user:${recipientId}`).emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: true
        });
      }
    } catch (error) {
      logger.error('Typing start failed:', error);
    }
  }

  /**
   * Handle typing stop
   */
  handleTypingStop(socket, data) {
    try {
      const { recipientId } = data;

      if (recipientId) {
        this.io.to(`user:${recipientId}`).emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: false
        });
      }
    } catch (error) {
      logger.error('Typing stop failed:', error);
    }
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket, reason) {
    const userId = socket.userId;

    // Clean up user data
    this.connectedUsers.delete(userId);
    this.userRooms.delete(userId);

    // Notify if vendor goes offline
    if (socket.userRole === 'vendor') {
      this.handleVendorOffline(socket);
    }

    logger.info('User disconnected from Socket.io', {
      userId,
      socketId: socket.id,
      reason,
      userName: socket.userName
    });
  }

  /**
   * Validate room access based on user role
   */
  validateRoomAccess(socket, roomType, roomId) {
    const userRole = socket.userRole;
    const userId = socket.userId;

    switch (roomType) {
      case 'order':
        // Users can only join rooms for orders they're involved in
        // This would need additional validation against the database
        return true; // Simplified for now
      
      case 'location':
        // Location-based rooms for proximity features
        return userRole === 'vendor' || userRole === 'consumer';
      
      case 'chat':
        // Chat rooms between users
        return true; // Simplified for now
      
      default:
        return false;
    }
  }

  /**
   * Broadcast notification to user
   */
  broadcastNotification(userId, notification) {
    try {
      const userRoom = `user:${userId}`;
      this.io.to(userRoom).emit('notification-received', {
        notification,
        timestamp: new Date().toISOString()
      });

      logger.info('Notification broadcasted via Socket.io', {
        userId,
        notificationType: notification.type,
        notificationId: notification._id
      });
    } catch (error) {
      logger.error('Broadcast notification failed:', error);
    }
  }

  /**
   * Broadcast order update
   */
  broadcastOrderUpdate(orderId, status, buyerId, sellerId) {
    try {
      const updateData = {
        orderId,
        status,
        timestamp: new Date().toISOString()
      };

      // Notify both buyer and seller
      if (buyerId) {
        this.io.to(`user:${buyerId}`).emit('order-updated', updateData);
      }
      if (sellerId && sellerId !== buyerId) {
        this.io.to(`user:${sellerId}`).emit('order-updated', updateData);
      }

      logger.info('Order update broadcasted', {
        orderId,
        status,
        buyerId,
        sellerId
      });
    } catch (error) {
      logger.error('Broadcast order update failed:', error);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get Socket.io instance
   */
  getIO() {
    return this.io;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const socketHandler = new SocketHandler();

module.exports = socketHandler;