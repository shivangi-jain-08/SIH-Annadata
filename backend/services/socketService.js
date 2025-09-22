const socketHandler = require('../socket/socketHandler');
const logger = require('../utils/logger');

/**
 * Broadcast notification to user via Socket.io
 */
const broadcastNotification = (userId, notification) => {
  try {
    if (socketHandler.getIO()) {
      socketHandler.broadcastNotification(userId, notification);
    }
  } catch (error) {
    logger.error('Socket broadcast notification failed:', error);
  }
};

/**
 * Broadcast order update via Socket.io
 */
const broadcastOrderUpdate = (orderId, status, buyerId, sellerId) => {
  try {
    if (socketHandler.getIO()) {
      socketHandler.broadcastOrderUpdate(orderId, status, buyerId, sellerId);
    }
  } catch (error) {
    logger.error('Socket broadcast order update failed:', error);
  }
};

/**
 * Broadcast vendor location update
 */
const broadcastVendorLocationUpdate = (vendorId, vendorName, coordinates, isActive = true) => {
  try {
    if (socketHandler.getIO()) {
      const locationData = {
        vendorId,
        vendorName,
        coordinates,
        isActive,
        timestamp: new Date().toISOString()
      };

      socketHandler.getIO().to('role:consumer').emit('vendor-location-updated', locationData);
      
      logger.info('Vendor location update broadcasted', {
        vendorId,
        coordinates,
        isActive
      });
    }
  } catch (error) {
    logger.error('Socket broadcast vendor location failed:', error);
  }
};

/**
 * Broadcast vendor online status
 */
const broadcastVendorOnline = (vendorId, vendorName, coordinates = null) => {
  try {
    if (socketHandler.getIO()) {
      const onlineData = {
        vendorId,
        vendorName,
        coordinates,
        status: 'online',
        timestamp: new Date().toISOString()
      };

      socketHandler.getIO().to('role:consumer').emit('vendor-online', onlineData);
      
      logger.info('Vendor online status broadcasted', {
        vendorId,
        coordinates
      });
    }
  } catch (error) {
    logger.error('Socket broadcast vendor online failed:', error);
  }
};

/**
 * Broadcast vendor offline status
 */
const broadcastVendorOffline = (vendorId, vendorName) => {
  try {
    if (socketHandler.getIO()) {
      const offlineData = {
        vendorId,
        vendorName,
        status: 'offline',
        timestamp: new Date().toISOString()
      };

      socketHandler.getIO().to('role:consumer').emit('vendor-offline', offlineData);
      
      logger.info('Vendor offline status broadcasted', {
        vendorId
      });
    }
  } catch (error) {
    logger.error('Socket broadcast vendor offline failed:', error);
  }
};

/**
 * Broadcast ML analysis completion
 */
const broadcastMLComplete = (userId, analysisType, reportId) => {
  try {
    if (socketHandler.getIO()) {
      const mlData = {
        analysisType,
        reportId,
        timestamp: new Date().toISOString()
      };

      socketHandler.getIO().to(`user:${userId}`).emit('ml-analysis-complete', mlData);
      
      logger.info('ML analysis completion broadcasted', {
        userId,
        analysisType,
        reportId
      });
    }
  } catch (error) {
    logger.error('Socket broadcast ML complete failed:', error);
  }
};

/**
 * Send message to specific user
 */
const sendMessageToUser = (userId, event, data) => {
  try {
    if (socketHandler.getIO()) {
      socketHandler.getIO().to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      
      logger.info('Message sent to user via Socket.io', {
        userId,
        event
      });
    }
  } catch (error) {
    logger.error('Socket send message to user failed:', error);
  }
};

/**
 * Send message to role group
 */
const sendMessageToRole = (role, event, data) => {
  try {
    if (socketHandler.getIO()) {
      socketHandler.getIO().to(`role:${role}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
      
      logger.info('Message sent to role group via Socket.io', {
        role,
        event
      });
    }
  } catch (error) {
    logger.error('Socket send message to role failed:', error);
  }
};

/**
 * Broadcast system announcement
 */
const broadcastSystemAnnouncement = (message, data = {}) => {
  try {
    if (socketHandler.getIO()) {
      const announcementData = {
        message,
        ...data,
        timestamp: new Date().toISOString()
      };

      socketHandler.getIO().emit('system-announcement', announcementData);
      
      logger.info('System announcement broadcasted', {
        message
      });
    }
  } catch (error) {
    logger.error('Socket broadcast system announcement failed:', error);
  }
};

/**
 * Get Socket.io statistics
 */
const getSocketStats = () => {
  try {
    const io = socketHandler.getIO();
    if (!io) {
      return {
        connected: false,
        connectedUsers: 0,
        totalConnections: 0
      };
    }

    return {
      connected: true,
      connectedUsers: socketHandler.getConnectedUsersCount(),
      totalConnections: io.engine.clientsCount || 0
    };
  } catch (error) {
    logger.error('Get socket stats failed:', error);
    return {
      connected: false,
      connectedUsers: 0,
      totalConnections: 0,
      error: error.message
    };
  }
};

/**
 * Check if user is connected
 */
const isUserConnected = (userId) => {
  try {
    return socketHandler.isUserConnected(userId);
  } catch (error) {
    logger.error('Check user connected failed:', error);
    return false;
  }
};

module.exports = {
  broadcastNotification,
  broadcastOrderUpdate,
  broadcastVendorLocationUpdate,
  broadcastVendorOnline,
  broadcastVendorOffline,
  broadcastMLComplete,
  sendMessageToUser,
  sendMessageToRole,
  broadcastSystemAnnouncement,
  getSocketStats,
  isUserConnected
};