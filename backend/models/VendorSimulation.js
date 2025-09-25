const mongoose = require('mongoose');

const vendorSimulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  simulationId: {
    type: String,
    required: [true, 'Simulation ID is required'],
    unique: true,
    trim: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Current location is required'],
      validate: {
        validator: function (coords) {
          return coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  movementPattern: {
    type: String,
    enum: ['static', 'linear', 'circular', 'random'],
    default: 'static'
  },
  movementConfig: {
    speed: {
      type: Number,
      default: 5, // km/h
      min: [0.1, 'Speed must be at least 0.1 km/h'],
      max: [50, 'Speed cannot exceed 50 km/h']
    },
    route: [{
      coordinates: {
        type: [Number],
        validate: {
          validator: function (coords) {
            return coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 && // longitude
              coords[1] >= -90 && coords[1] <= 90;     // latitude
          },
          message: 'Invalid route coordinates format'
        }
      },
      waitTime: {
        type: Number,
        default: 0, // seconds
        min: [0, 'Wait time cannot be negative']
      }
    }],
    currentRouteIndex: {
      type: Number,
      default: 0,
      min: [0, 'Route index cannot be negative']
    },
    direction: {
      type: Number,
      default: 0, // degrees (0-360)
      min: [0, 'Direction must be between 0 and 360'],
      max: [360, 'Direction must be between 0 and 360']
    },
    radius: {
      type: Number,
      default: 500, // meters for circular movement
      min: [10, 'Radius must be at least 10 meters'],
      max: [5000, 'Radius cannot exceed 5000 meters']
    },
    center: {
      type: [Number], // [longitude, latitude] for circular movement
      default: undefined,
      validate: {
        validator: function (coords) {
          return coords === undefined || coords === null || (Array.isArray(coords) && coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90);     // latitude
        },
        message: 'Invalid center coordinates format'
      }
    }
  },
  products: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now
  },
  simulationStartTime: {
    type: Date,
    default: Date.now
  },
  totalDistanceTraveled: {
    type: Number,
    default: 0, // meters
    min: [0, 'Distance cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create geospatial index for location-based queries
vendorSimulationSchema.index({ currentLocation: '2dsphere' });

// Note: simulationId index is created automatically by unique: true
vendorSimulationSchema.index({ isActive: 1 });
vendorSimulationSchema.index({ movementPattern: 1 });

// TTL index to automatically delete old simulations after 24 hours
vendorSimulationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Instance method to update location
vendorSimulationSchema.methods.updateLocation = async function (longitude, latitude) {
  // Calculate distance traveled
  if (this.currentLocation && this.currentLocation.coordinates) {
    const oldCoords = this.currentLocation.coordinates;
    const distance = this.calculateDistance(
      oldCoords[1], oldCoords[0], // old lat, old lng
      latitude, longitude         // new lat, new lng
    );
    this.totalDistanceTraveled += distance;
  }

  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.lastLocationUpdate = new Date();

  return await this.save();
};

// Instance method to calculate distance between two points
vendorSimulationSchema.methods.calculateDistance = function (lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Instance method to get next location based on movement pattern
vendorSimulationSchema.methods.getNextLocation = function (deltaTimeSeconds) {
  const currentCoords = this.currentLocation.coordinates;
  const config = this.movementConfig;

  switch (this.movementPattern) {
    case 'static':
      return { longitude: currentCoords[0], latitude: currentCoords[1] };

    case 'linear':
      return this.getLinearNextLocation(deltaTimeSeconds);

    case 'circular':
      return this.getCircularNextLocation(deltaTimeSeconds);

    case 'random':
      return this.getRandomNextLocation(deltaTimeSeconds);

    default:
      return { longitude: currentCoords[0], latitude: currentCoords[1] };
  }
};

// Helper method for linear movement
vendorSimulationSchema.methods.getLinearNextLocation = function (deltaTimeSeconds) {
  const config = this.movementConfig;
  const route = config.route;

  if (!route || route.length === 0) {
    return { longitude: this.currentLocation.coordinates[0], latitude: this.currentLocation.coordinates[1] };
  }

  // Simple linear movement between route points
  const targetPoint = route[config.currentRouteIndex % route.length];
  const target = targetPoint.coordinates;
  const current = this.currentLocation.coordinates;

  // Calculate distance to move based on speed
  const speedMs = (config.speed * 1000) / 3600; // convert km/h to m/s
  const distanceToMove = speedMs * deltaTimeSeconds;

  // Calculate direction to target
  const distanceToTarget = this.calculateDistance(
    current[1], current[0], // current lat, lng
    target[1], target[0]    // target lat, lng
  );

  if (distanceToTarget <= distanceToMove) {
    // Reached target, move to next point
    this.movementConfig.currentRouteIndex = (config.currentRouteIndex + 1) % route.length;
    return { longitude: target[0], latitude: target[1] };
  }

  // Move towards target
  const ratio = distanceToMove / distanceToTarget;
  const newLng = current[0] + (target[0] - current[0]) * ratio;
  const newLat = current[1] + (target[1] - current[1]) * ratio;

  return { longitude: newLng, latitude: newLat };
};

// Helper method for circular movement
vendorSimulationSchema.methods.getCircularNextLocation = function (deltaTimeSeconds) {
  const config = this.movementConfig;
  const center = config.center || this.currentLocation.coordinates;
  const radius = config.radius;

  // Calculate angular speed (radians per second)
  const circumference = 2 * Math.PI * radius;
  const speedMs = (config.speed * 1000) / 3600; // convert km/h to m/s
  const angularSpeed = speedMs / radius; // radians per second

  // Update direction
  const newDirection = (config.direction + (angularSpeed * deltaTimeSeconds * 180 / Math.PI)) % 360;
  this.movementConfig.direction = newDirection;

  // Calculate new position
  const angleRad = newDirection * Math.PI / 180;

  // Convert radius from meters to degrees (approximate)
  const radiusLat = radius / 111320; // meters to degrees latitude
  const radiusLng = radius / (111320 * Math.cos(center[1] * Math.PI / 180)); // meters to degrees longitude

  const newLat = center[1] + radiusLat * Math.sin(angleRad);
  const newLng = center[0] + radiusLng * Math.cos(angleRad);

  return { longitude: newLng, latitude: newLat };
};

// Helper method for random movement
vendorSimulationSchema.methods.getRandomNextLocation = function (deltaTimeSeconds) {
  const config = this.movementConfig;
  const current = this.currentLocation.coordinates;

  // Calculate distance to move based on speed
  const speedMs = (config.speed * 1000) / 3600; // convert km/h to m/s
  const distanceToMove = speedMs * deltaTimeSeconds;

  // Random direction
  const randomDirection = Math.random() * 360;
  const angleRad = randomDirection * Math.PI / 180;

  // Convert distance to degrees (approximate)
  const distanceLat = distanceToMove / 111320; // meters to degrees latitude
  const distanceLng = distanceToMove / (111320 * Math.cos(current[1] * Math.PI / 180)); // meters to degrees longitude

  const newLat = current[1] + distanceLat * Math.sin(angleRad);
  const newLng = current[0] + distanceLng * Math.cos(angleRad);

  // Ensure coordinates are within valid bounds
  const clampedLat = Math.max(-90, Math.min(90, newLat));
  const clampedLng = Math.max(-180, Math.min(180, newLng));

  return { longitude: clampedLng, latitude: clampedLat };
};

// Static method to find active simulations
vendorSimulationSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find by pattern
vendorSimulationSchema.statics.findByPattern = function (pattern) {
  return this.find({ movementPattern: pattern, isActive: true });
};

// Static method to cleanup old simulations
vendorSimulationSchema.statics.cleanupOld = function (hoursOld = 24) {
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  return this.deleteMany({
    createdAt: { $lt: cutoffTime },
    isActive: false
  });
};

const VendorSimulation = mongoose.model('VendorSimulation', vendorSimulationSchema);

module.exports = VendorSimulation;