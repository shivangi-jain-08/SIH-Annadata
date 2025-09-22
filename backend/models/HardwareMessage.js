const mongoose = require('mongoose');

const hardwareMessageSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  sensorData: {
    ph: {
      type: Number,
      required: [true, 'pH value is required'],
      min: [0, 'pH cannot be negative'],
      max: [14, 'pH cannot exceed 14']
    },
    nitrogen: {
      type: Number,
      required: [true, 'Nitrogen value is required'],
      min: [0, 'Nitrogen cannot be negative']
    },
    phosphorus: {
      type: Number,
      required: [true, 'Phosphorus value is required'],
      min: [0, 'Phosphorus cannot be negative']
    },
    potassium: {
      type: Number,
      required: [true, 'Potassium value is required'],
      min: [0, 'Potassium cannot be negative']
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity value is required'],
      min: [0, 'Humidity cannot be negative'],
    },
    rainfall: {
      type: Number,
      required: [true, 'rainfall value is required'],
      min: [0, 'rainfall cannot be negative'],
      max: [100, 'rainfall cannot exceed 100%']
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature value is required'],
      min: [-50, 'Temperature too low'],
      max: [70, 'Temperature too high']
    }
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
hardwareMessageSchema.index({ farmerId: 1, createdAt: -1 });

// Static method to find messages by farmer
hardwareMessageSchema.statics.findByFarmer = function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name location');
};

// Static method to find latest message by farmer
hardwareMessageSchema.statics.findLatestByFarmer = function(farmerId) {
  return this.findOne({ farmerId })
    .sort({ createdAt: -1 })
    .populate('farmerId', 'name location');
};

const HardwareMessage = mongoose.model('HardwareMessage', hardwareMessageSchema);

module.exports = HardwareMessage;