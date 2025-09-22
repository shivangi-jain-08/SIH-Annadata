const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['order_update', 'vendor_nearby', 'ml_complete', 'system'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional notification data
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  deliveryMethod: {
    type: String,
    enum: ['push', 'sms', 'both'],
    default: 'push'
  },
  fcmToken: {
    type: String,
    trim: true
  },
  smsNumber: {
    type: String,
    trim: true
  },
  retryCount: {
    type: Number,
    default: 0,
    max: [3, 'Maximum retry count is 3']
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for frequently queried fields
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ deliveryStatus: 1 });
notificationSchema.index({ isRead: 1, userId: 1 });

// TTL index to automatically delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Instance method to mark as sent
notificationSchema.methods.markAsSent = async function() {
  this.deliveryStatus = 'sent';
  this.sentAt = new Date();
  return await this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = async function() {
  this.deliveryStatus = 'failed';
  this.retryCount += 1;
  return await this.save();
};

// Instance method to retry notification
notificationSchema.methods.retry = async function() {
  if (this.retryCount >= 3) {
    throw new Error('Maximum retry count reached');
  }
  this.deliveryStatus = 'pending';
  return await this.save();
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(userId) {
  return this.find({ userId, isRead: false })
    .sort({ createdAt: -1 });
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(userId, type) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 });
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function() {
  return this.find({ 
    deliveryStatus: 'pending',
    retryCount: { $lt: 3 }
  }).populate('userId', 'name phone');
};

// Static method to find failed notifications for retry
notificationSchema.statics.findForRetry = function() {
  return this.find({
    deliveryStatus: 'failed',
    retryCount: { $lt: 3 },
    updatedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes ago
  }).populate('userId', 'name phone');
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );
};

// Static method to get notification stats
notificationSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        sent: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'sent'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'failed'] }, 1, 0] } }
      }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;