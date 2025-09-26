const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'vegetables',
      'fruits',
      'grains',
      'pulses',
      'spices',
      'herbs',
      'dairy',
      'other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle']
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return coords && coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  harvestDate: {
    type: Date
  },
  expiryDate: {
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

// Create geospatial index for location-based queries
productSchema.index({ location: '2dsphere' });

// Create indexes for frequently queried fields
productSchema.index({ sellerId: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

// Virtual for checking if product is expired
productSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Instance method to update quantity
productSchema.methods.updateQuantity = async function(quantity) {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  this.availableQuantity = quantity;
  if (quantity === 0) {
    this.isActive = false;
  }
  return await this.save();
};

// Instance method to reduce quantity (for orders)
productSchema.methods.reduceQuantity = async function(amount) {
  if (amount > this.availableQuantity) {
    throw new Error('Insufficient quantity available');
  }
  this.availableQuantity -= amount;
  if (this.availableQuantity === 0) {
    this.isActive = false;
  }
  return await this.save();
};

// Static method to find products by location
productSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true,
    availableQuantity: { $gt: 0 }
  }).populate('sellerId', 'name phone location');
};

// Static method to find by category
productSchema.statics.findByCategory = function(category, isActive = true) {
  return this.find({ 
    category, 
    isActive,
    availableQuantity: { $gt: 0 }
  }).populate('sellerId', 'name phone location');
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true,
    availableQuantity: { $gt: 0 },
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('sellerId', 'name phone location');
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;