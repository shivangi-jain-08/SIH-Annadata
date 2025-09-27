const mongoose = require('mongoose');

const vendorLocationSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required'],
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
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
  isOnline: {
    type: Boolean,
    default: false
  },
  deliveryRadius: {
    type: Number,
    default: 2000, // 2km default radius in meters
    min: [100, 'Minimum delivery radius is 100 meters'],
    max: [10000, 'Maximum delivery radius is 10km']
  },
  acceptingOrders: {
    type: Boolean,
    default: true
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  },
  onlineSince: {
    type: Date
  },
  totalOnlineTime: {
    type: Number,
    default: 0 // Total online time in seconds
  },
  sessionStartTime: {
    type: Date
  },
  averageResponseTime: {
    type: Number,
    default: 0 // Average response time to orders in minutes
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingCount: {
    type: Number,
    default: 0
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
vendorLocationSchema.index({ location: '2dsphere' });

// // Create indexes for frequently queried fields
// vendorLocationSchema.index({ vendorId: 1 });
vendorLocationSchema.index({ isOnline: 1 });
vendorLocationSchema.index({ isOnline: 1, acceptingOrders: 1 });
vendorLocationSchema.index({ lastLocationUpdate: 1 });

// Virtual for current session duration
vendorLocationSchema.virtual('currentSessionDuration').get(function() {
  if (!this.sessionStartTime || !this.isOnline) return 0;
  return Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
});

// Instance method to go online
vendorLocationSchema.methods.goOnline = async function(longitude, latitude) {
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.isOnline = true;
  this.onlineSince = this.onlineSince || new Date();
  this.sessionStartTime = new Date();
  this.lastLocationUpdate = new Date();
  return await this.save();
};

// Instance method to go offline
vendorLocationSchema.methods.goOffline = async function() {
  if (this.isOnline && this.sessionStartTime) {
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
    this.totalOnlineTime += sessionDuration;
  }
  
  this.isOnline = false;
  this.sessionStartTime = null;
  this.lastLocationUpdate = new Date();
  return await this.save();
};

// Instance method to update location
vendorLocationSchema.methods.updateLocation = async function(longitude, latitude) {
  if (!this.isOnline) {
    throw new Error('Vendor must be online to update location');
  }
  
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.lastLocationUpdate = new Date();
  return await this.save();
};

// Instance method to update delivery settings
vendorLocationSchema.methods.updateDeliverySettings = async function(settings) {
  if (settings.deliveryRadius !== undefined) {
    this.deliveryRadius = settings.deliveryRadius;
  }
  if (settings.acceptingOrders !== undefined) {
    this.acceptingOrders = settings.acceptingOrders;
  }
  return await this.save();
};

// Instance method to update rating
vendorLocationSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating * this.ratingCount) + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  return await this.save();
};

// Static method to find nearby online vendors
vendorLocationSchema.statics.findNearbyOnline = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isOnline: true,
    acceptingOrders: true
  }).populate('vendorId', 'name phone email');
};

// Static method to find vendors by delivery radius
vendorLocationSchema.statics.findByDeliveryRadius = function(longitude, latitude) {
  return this.find({
    isOnline: true,
    acceptingOrders: true,
    $expr: {
      $lte: [
        {
          $multiply: [
            {
              $sqrt: {
                $add: [
                  { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates', 0] }, longitude] }, 2] },
                  { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates', 1] }, latitude] }, 2] }
                ]
              }
            },
            111320 // Approximate meters per degree
          ]
        },
        '$deliveryRadius'
      ]
    }
  }).populate('vendorId', 'name phone email');
};

// Static method to get online vendors statistics
vendorLocationSchema.statics.getOnlineStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        onlineVendors: {
          $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] }
        },
        acceptingOrders: {
          $sum: { $cond: [{ $and: [{ $eq: ['$isOnline', true] }, { $eq: ['$acceptingOrders', true] }] }, 1, 0] }
        },
        averageRating: { $avg: '$rating' },
        averageDeliveryRadius: { $avg: '$deliveryRadius' },
        totalOnlineTime: { $sum: '$totalOnlineTime' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalVendors: 0,
    onlineVendors: 0,
    acceptingOrders: 0,
    averageRating: 0,
    averageDeliveryRadius: 0,
    totalOnlineTime: 0
  };
};

// Pre-save middleware to update timestamps
vendorLocationSchema.pre('save', function(next) {
  if (this.isModified('location') || this.isModified('isOnline')) {
    this.lastLocationUpdate = new Date();
  }
  next();
});

const VendorLocation = mongoose.model('VendorLocation', vendorLocationSchema);

module.exports = VendorLocation;