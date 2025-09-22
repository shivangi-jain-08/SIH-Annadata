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

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

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

    // Order status updates
    socket.on('order-status-update', (data) => {
      this.handleOrderStatusUpdate(socket, data);
    });

    // Notification acknowledgment
    socket.on('notification-received', (data) => {
      this.handleNotificationReceived(socket, data);
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

      // Broadcast location update to nearby consumers
      const locationData = {
        vendorId: socket.userId,
        vendorName: socket.userName,
        coordinates: [longitude, latitude],
        isActive: isActive !== false,
        timestamp: new Date().toISOString()
      };

      // Broadcast to consumers in the area (you might want to implement geo-based rooms)
      this.io.to('role:consumer').emit('vendor-location-updated', locationData);

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