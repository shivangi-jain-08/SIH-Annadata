// Export all models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderMessage = require('./OrderMessage');
const HardwareMessage = require('./HardwareMessage');
const CropRecommendation = require('./CropRecommendation');
const DiseaseReport = require('./DiseaseReport');
const Notification = require('./Notification');
const VendorSimulation = require('./VendorSimulation');
const VendorLocation = require('./VendorLocation');

module.exports = {
  User,
  Product,
  Order,
  OrderMessage,
  HardwareMessage,
  CropRecommendation,
  DiseaseReport,
  Notification,
  VendorSimulation,
  VendorLocation
};