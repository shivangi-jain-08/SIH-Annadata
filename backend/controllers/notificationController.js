const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Send a notification
 */
const sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, deliveryMethod } = req.body;

    // If userId is not provided, use current user
    const targetUserId = userId || req.user._id;

    const notification = await notificationService.createNotification(
      targetUserId,
      type,
      title,
      message,
      data,
      deliveryMethod
    );

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    logger.error('Send notification failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send notification'
    });
  }
};

/**
 * Get current user's notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { type, isRead, page, limit } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    const result = await notificationService.getUserNotifications(req.user._id, filters);

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get notifications failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications'
    });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    logger.error('Mark notification as read failed:', error);

    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user._id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount 
      }
    });
  } catch (error) {
    logger.error('Mark all notifications as read failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats(req.user._id);

    res.json({
      success: true,
      message: 'Notification statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    logger.error('Get notification stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification statistics'
    });
  }
};

/**
 * Send order update notification
 */
const sendOrderUpdate = async (req, res) => {
  try {
    const { userId, orderId, status, orderDetails } = req.body;

    const notification = await notificationService.sendOrderUpdateNotification(
      userId,
      orderId,
      status,
      orderDetails
    );

    res.status(201).json({
      success: true,
      message: 'Order update notification sent',
      data: { notification }
    });
  } catch (error) {
    logger.error('Send order update notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order update notification'
    });
  }
};

/**
 * Send vendor nearby notification
 */
const sendVendorNearby = async (req, res) => {
  try {
    const { userId, vendorInfo } = req.body;

    const notification = await notificationService.sendVendorNearbyNotification(
      userId,
      vendorInfo
    );

    res.status(201).json({
      success: true,
      message: 'Vendor nearby notification sent',
      data: { notification }
    });
  } catch (error) {
    logger.error('Send vendor nearby notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send vendor nearby notification'
    });
  }
};

/**
 * Send ML analysis complete notification
 */
const sendMLComplete = async (req, res) => {
  try {
    const { userId, analysisType, reportId } = req.body;

    const notification = await notificationService.sendMLCompleteNotification(
      userId || req.user._id,
      analysisType,
      reportId
    );

    res.status(201).json({
      success: true,
      message: 'ML analysis complete notification sent',
      data: { notification }
    });
  } catch (error) {
    logger.error('Send ML complete notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send ML analysis complete notification'
    });
  }
};

/**
 * Send system notification
 */
const sendSystemNotification = async (req, res) => {
  try {
    const { userId, title, message, data } = req.body;

    const notification = await notificationService.sendSystemNotification(
      userId,
      title,
      message,
      data
    );

    res.status(201).json({
      success: true,
      message: 'System notification sent',
      data: { notification }
    });
  } catch (error) {
    logger.error('Send system notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send system notification'
    });
  }
};

/**
 * Retry failed notifications (admin function)
 */
const retryFailedNotifications = async (req, res) => {
  try {
    const result = await notificationService.retryFailedNotifications();

    res.json({
      success: true,
      message: 'Failed notifications retry completed',
      data: result
    });
  } catch (error) {
    logger.error('Retry failed notifications failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry notifications'
    });
  }
};

/**
 * Test notification (for development/testing)
 */
const testNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const notification = await notificationService.createNotification(
      req.user._id,
      type || 'system',
      title || 'Test Notification',
      message || 'This is a test notification',
      { test: true }
    );

    res.status(201).json({
      success: true,
      message: 'Test notification sent',
      data: { notification }
    });
  } catch (error) {
    logger.error('Test notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  sendOrderUpdate,
  sendVendorNearby,
  sendMLComplete,
  sendSystemNotification,
  retryFailedNotifications,
  testNotification
};