const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  hardwareMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HardwareMessage',
    required: [true, 'Hardware message ID is required']
  },
  recommendations: [{
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    suitabilityPercentage: {
      type: Number,
      required: [true, 'Suitability percentage is required'],
      min: [0, 'Suitability percentage cannot be negative'],
      max: [100, 'Suitability percentage cannot exceed 100']
    },
    expectedYield: {
      type: Number,
      min: [0, 'Expected yield cannot be negative']
    }
  }],
  generalRecommendations: [{
    type: String,
    trim: true
  }]
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
cropRecommendationSchema.index({ farmerId: 1, createdAt: -1 });
cropRecommendationSchema.index({ hardwareMessageId: 1 });
cropRecommendationSchema.index({ 'recommendations.cropName': 1 });

// Static method to find recommendations by farmer
cropRecommendationSchema.statics.findByFarmer = function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name location')
    .populate('hardwareMessageId');
};

// Static method to find latest recommendation by farmer
cropRecommendationSchema.statics.findLatestByFarmer = function(farmerId) {
  return this.findOne({ farmerId })
    .sort({ createdAt: -1 })
    .populate('farmerId', 'name location')
    .populate('hardwareMessageId');
};

// Static method to find recommendations by crop
cropRecommendationSchema.statics.findByCrop = function(cropName) {
  return this.find({
    'recommendations.cropName': { $regex: cropName, $options: 'i' }
  }).populate('farmerId', 'name location');
};

const CropRecommendation = mongoose.model('CropRecommendation', cropRecommendationSchema);

module.exports = CropRecommendation;