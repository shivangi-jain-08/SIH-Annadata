const mongoose = require('mongoose');

const orderMessageSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  senderRole: {
    type: String,
    enum: ['consumer', 'vendor', 'system'],
    required: [true, 'Sender role is required']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  attachments: [{
    type: String,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|pdf)$/i.test(url);
      },
      message: 'Invalid attachment URL format'
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
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
orderMessageSchema.index({ orderId: 1, createdAt: -1 });
orderMessageSchema.index({ senderId: 1, createdAt: -1 });
orderMessageSchema.index({ orderId: 1, isRead: 1 });

// Instance method to mark message as read
orderMessageSchema.methods.markAsRead = async function(readerId) {
  // Only mark as read if the reader is not the sender
  if (this.senderId.toString() !== readerId.toString()) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

// Instance method to mark message as delivered
orderMessageSchema.methods.markAsDelivered = async function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return await this.save();
};

// Static method to get conversation for an order
orderMessageSchema.statics.getOrderConversation = function(orderId, limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({ orderId })
    .populate('senderId', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread message count for an order
orderMessageSchema.statics.getUnreadCount = function(orderId, userId) {
  return this.countDocuments({
    orderId,
    senderId: { $ne: userId },
    isRead: false
  });
};

// Static method to mark all messages in an order as read
orderMessageSchema.statics.markOrderMessagesAsRead = function(orderId, readerId) {
  return this.updateMany(
    {
      orderId,
      senderId: { $ne: readerId },
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to create system message
orderMessageSchema.statics.createSystemMessage = function(orderId, message) {
  return this.create({
    orderId,
    senderId: null,
    senderRole: 'system',
    message,
    messageType: 'system',
    isRead: false,
    isDelivered: true,
    deliveredAt: new Date()
  });
};

const OrderMessage = mongoose.model('OrderMessage', orderMessageSchema);

module.exports = OrderMessage;