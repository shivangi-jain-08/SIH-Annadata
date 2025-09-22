const mongoose = require('mongoose');

const diseaseReportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url) || url.startsWith('/uploads/');
      },
      message: 'Invalid image URL format'
    }
  },
  diseaseName: {
    type: String,
    required: [true, 'Disease name is required'],
    trim: true,
    maxlength: [200, 'Disease name cannot exceed 200 characters']
  },
  treatment: {
    type: String,
    required: [true, 'Treatment is required'],
    trim: true,
    maxlength: [1000, 'Treatment cannot exceed 1000 characters']
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
diseaseReportSchema.index({ farmerId: 1, createdAt: -1 });
diseaseReportSchema.index({ diseaseName: 1 });

// Static method to find reports by farmer
diseaseReportSchema.statics.findByFarmer = function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name location');
};

// Static method to find reports by disease
diseaseReportSchema.statics.findByDisease = function(diseaseName) {
  return this.find({
    diseaseName: { $regex: diseaseName, $options: 'i' }
  }).populate('farmerId', 'name location');
};

// findByCropType removed - cropType field removed for simplicity

const DiseaseReport = mongoose.model('DiseaseReport', diseaseReportSchema);

module.exports = DiseaseReport;