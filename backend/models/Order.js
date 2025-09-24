const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  deliveryAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery address cannot exceed 500 characters']
  },
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  scheduledDelivery: {
    type: Date
  },
  actualDelivery: {
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
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ deliveryLocation: '2dsphere' });

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function() {
  if (!this.actualDelivery) return null;
  return Math.ceil((this.actualDelivery - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('products')) {
    this.totalAmount = this.products.reduce((total, product) => {
      return total + (product.quantity * product.price);
    }, 0);
  }
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus, deliveryDate = null) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_transit', 'cancelled'],
    in_transit: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  
  if (newStatus === 'delivered' && deliveryDate) {
    this.actualDelivery = deliveryDate;
  }

  return await this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = async function(reason = '') {
  if (this.status === 'delivered') {
    throw new Error('Cannot cancel delivered order');
  }
  
  this.status = 'cancelled';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }
  
  return await this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId, role = 'buyer') {
  const field = role === 'buyer' ? 'buyerId' : 'sellerId';
  return this.find({ [field]: userId })
    .populate('buyerId', 'name phone')
    .populate('sellerId', 'name phone')
    .populate('products.productId', 'name category')
    .sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('buyerId', 'name phone')
    .populate('sellerId', 'name phone')
    .populate('products.productId', 'name category')
    .sort({ createdAt: -1 });
};

// Static method to find orders in area
orderSchema.statics.findInArea = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    deliveryLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: { $in: ['confirmed', 'in_transit'] }
  }).populate('buyerId', 'name phone')
    .populate('sellerId', 'name phone');
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;