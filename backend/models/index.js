// Export all models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const HardwareMessage = require('./HardwareMessage');
const CropRecommendation = require('./CropRecommendation');
const DiseaseReport = require('./DiseaseReport');
const Notification = require('./Notification');

module.exports = {
  User,
  Product,
  Order,
  HardwareMessage,
  CropRecommendation,
  DiseaseReport,
  Notification
};