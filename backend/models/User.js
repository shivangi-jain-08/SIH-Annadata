const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['farmer', 'vendor', 'consumer'],
    required: [true, 'User role is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
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
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  addresses: [{
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Address label cannot exceed 50 characters']
    },
    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters']
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be 6 digits']
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLocationUpdate: {
    type: Date
  },
  locationAccuracy: {
    type: Number
  },
  heading: {
    type: Number
  },
  speed: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  notificationPreferences: {
    proximityNotifications: {
      enabled: { 
        type: Boolean, 
        default: true 
      },
      radius: { 
        type: Number, 
        default: 1000, 
        min: [100, 'Minimum notification radius is 100 meters'], 
        max: [5000, 'Maximum notification radius is 5000 meters'] 
      },
      quietHours: {
        enabled: { 
          type: Boolean, 
          default: false 
        },
        start: { 
          type: String, 
          default: '22:00',
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        },
        end: { 
          type: String, 
          default: '08:00',
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        }
      },
      notificationTypes: {
        sound: { 
          type: Boolean, 
          default: true 
        },
        visual: { 
          type: Boolean, 
          default: true 
        },
        vibration: { 
          type: Boolean, 
          default: false 
        }
      },
      vendorTypes: [{
        type: String,
        trim: true
      }],
      minimumRating: { 
        type: Number, 
        default: 0, 
        min: [0, 'Minimum rating cannot be less than 0'], 
        max: [5, 'Maximum rating cannot be more than 5'] 
      }
    },
    doNotDisturb: { 
      type: Boolean, 
      default: false 
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Note: email and phone indexes are created automatically by unique: true
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'notificationPreferences.proximityNotifications.enabled': 1, role: 1 });
userSchema.index({ 'notificationPreferences.doNotDisturb': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Instance method to update notification preferences
userSchema.methods.updateNotificationPreferences = async function(preferences) {
  if (preferences.proximityNotifications) {
    Object.assign(this.notificationPreferences.proximityNotifications, preferences.proximityNotifications);
  }
  if (preferences.doNotDisturb !== undefined) {
    this.notificationPreferences.doNotDisturb = preferences.doNotDisturb;
  }
  return await this.save();
};

// Instance method to check if user should receive proximity notifications
userSchema.methods.shouldReceiveProximityNotifications = function(vendorDistance) {
  const prefs = this.notificationPreferences?.proximityNotifications;
  
  if (!prefs?.enabled || this.notificationPreferences?.doNotDisturb) {
    return false;
  }
  
  if (vendorDistance > prefs.radius) {
    return false;
  }
  
  if (this.constructor.isInQuietHours(this)) {
    return false;
  }
  
  return true;
};

// Static method to find users by location
userSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
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
    isActive: true
  });
};

// Static method to find by role
userSchema.statics.findByRole = function(role, isActive = true) {
  return this.find({ role, isActive });
};

// Static method to find users eligible for proximity notifications
userSchema.statics.findEligibleForProximityNotifications = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    role: 'consumer',
    isActive: true,
    'notificationPreferences.proximityNotifications.enabled': true,
    'notificationPreferences.doNotDisturb': false,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to check if user is in quiet hours
userSchema.statics.isInQuietHours = function(user) {
  if (!user.notificationPreferences?.proximityNotifications?.quietHours?.enabled) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  const startTime = user.notificationPreferences.proximityNotifications.quietHours.start;
  const endTime = user.notificationPreferences.proximityNotifications.quietHours.end;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;