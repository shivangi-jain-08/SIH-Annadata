require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const { User, Product, Order, HardwareMessage, CropRecommendation, DiseaseReport, Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * Sample data for seeding
 */
const sampleData = {
  users: [
    // 1 Farmer in Punjab
    {
      email: 'farmer@annadata.com',
      phone: '+919876543210',
      password: 'Password123',
      role: 'farmer',
      name: 'Harpreet Singh Dhillon',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Village Khanna, Ludhiana, Punjab, India'
    },
    
    // 10 Vendors in Punjab
    {
      email: 'vendor1@annadata.com',
      phone: '+919876543211',
      password: 'Password123',
      role: 'vendor',
      name: 'Gurdeep Singh Brar',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Model Town, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor2@annadata.com',
      phone: '+919876543212',
      password: 'Password123',
      role: 'vendor',
      name: 'Simran Kaur Gill',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Civil Lines, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor3@annadata.com',
      phone: '+919876543213',
      password: 'Password123',
      role: 'vendor',
      name: 'Jasbir Singh Sandhu',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Sarabha Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor4@annadata.com',
      phone: '+919876543214',
      password: 'Password123',
      role: 'vendor',
      name: 'Manpreet Kaur Sidhu',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Dugri, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor5@annadata.com',
      phone: '+919876543215',
      password: 'Password123',
      role: 'vendor',
      name: 'Balwinder Singh Cheema',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Pakhowal Road, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor6@annadata.com',
      phone: '+919876543216',
      password: 'Password123',
      role: 'vendor',
      name: 'Rajwinder Kaur Bajwa',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'BRS Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor7@annadata.com',
      phone: '+919876543217',
      password: 'Password123',
      role: 'vendor',
      name: 'Kuldeep Singh Randhawa',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Ferozepur Road, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor8@annadata.com',
      phone: '+919876543218',
      password: 'Password123',
      role: 'vendor',
      name: 'Amarjit Kaur Dhaliwal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Haibowal, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor9@annadata.com',
      phone: '+919876543219',
      password: 'Password123',
      role: 'vendor',
      name: 'Sukhwinder Singh Grewal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Shimlapuri, Ludhiana, Punjab, India'
    },
    {
      email: 'vendor10@annadata.com',
      phone: '+919876543220',
      password: 'Password123',
      role: 'vendor',
      name: 'Navdeep Kaur Virk',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Malhar Road, Ludhiana, Punjab, India'
    },
    
    // 20 Consumers in Punjab (Ludhiana)
    {
      email: 'consumer1@annadata.com',
      phone: '+919876543221',
      password: 'Password123',
      role: 'consumer',
      name: 'Ravi Kumar Sharma',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Model Town Extension, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer2@annadata.com',
      phone: '+919876543222',
      password: 'Password123',
      role: 'consumer',
      name: 'Priya Gupta',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Civil Lines, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer3@annadata.com',
      phone: '+919876543223',
      password: 'Password123',
      role: 'consumer',
      name: 'Amit Verma',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Sarabha Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer4@annadata.com',
      phone: '+919876543224',
      password: 'Password123',
      role: 'consumer',
      name: 'Sunita Devi',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Dugri Phase 1, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer5@annadata.com',
      phone: '+919876543225',
      password: 'Password123',
      role: 'consumer',
      name: 'Rajesh Agarwal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Pakhowal Road, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer6@annadata.com',
      phone: '+919876543226',
      password: 'Password123',
      role: 'consumer',
      name: 'Meera Jain',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'BRS Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer7@annadata.com',
      phone: '+919876543227',
      password: 'Password123',
      role: 'consumer',
      name: 'Vikash Kumar',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Ferozepur Road, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer8@annadata.com',
      phone: '+919876543228',
      password: 'Password123',
      role: 'consumer',
      name: 'Kavita Singh',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Haibowal Kalan, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer9@annadata.com',
      phone: '+919876543229',
      password: 'Password123',
      role: 'consumer',
      name: 'Deepak Malhotra',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Shimlapuri, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer10@annadata.com',
      phone: '+919876543230',
      password: 'Password123',
      role: 'consumer',
      name: 'Neha Kapoor',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Malhar Road, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer11@annadata.com',
      phone: '+919876543231',
      password: 'Password123',
      role: 'consumer',
      name: 'Sanjay Bansal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Gill Road, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer12@annadata.com',
      phone: '+919876543232',
      password: 'Password123',
      role: 'consumer',
      name: 'Pooja Arora',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Kitchlu Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer13@annadata.com',
      phone: '+919876543233',
      password: 'Password123',
      role: 'consumer',
      name: 'Manoj Jindal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Rajguru Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer14@annadata.com',
      phone: '+919876543234',
      password: 'Password123',
      role: 'consumer',
      name: 'Asha Rani',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Jamalpur, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer15@annadata.com',
      phone: '+919876543235',
      password: 'Password123',
      role: 'consumer',
      name: 'Rohit Sethi',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Bhai Randhir Singh Nagar, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer16@annadata.com',
      phone: '+919876543236',
      password: 'Password123',
      role: 'consumer',
      name: 'Anita Bhalla',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Tibba Road, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer17@annadata.com',
      phone: '+919876543237',
      password: 'Password123',
      role: 'consumer',
      name: 'Suresh Mittal',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Focal Point, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer18@annadata.com',
      phone: '+919876543238',
      password: 'Password123',
      role: 'consumer',
      name: 'Rekha Goel',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Dhandari Kalan, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer19@annadata.com',
      phone: '+919876543239',
      password: 'Password123',
      role: 'consumer',
      name: 'Harish Chandra',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Barewal, Ludhiana, Punjab, India'
    },
    {
      email: 'consumer20@annadata.com',
      phone: '+919876543240',
      password: 'Password123',
      role: 'consumer',
      name: 'Shweta Khanna',
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      address: 'Jodhewal, Ludhiana, Punjab, India'
    }
  ],

  products: [
    {
      name: 'Fresh Tomatoes',
      description: 'Organic red tomatoes, freshly harvested from Punjab farms',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      availableQuantity: 100,
      minimumOrderQuantity: 5, // Farmer requires minimum 5kg order
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
      name: 'Basmati Rice',
      description: 'Premium quality basmati rice from Punjab',
      category: 'grains',
      price: 80,
      unit: 'kg',
      availableQuantity: 500,
      minimumOrderQuantity: 10, // Farmer requires minimum 10kg order
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    {
      name: 'Fresh Spinach',
      description: 'Green leafy spinach, pesticide-free from Punjab',
      category: 'vegetables',
      price: 25,
      unit: 'kg',
      availableQuantity: 50,
      minimumOrderQuantity: 2, // Minimum 2kg order
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
      name: 'Organic Apples',
      description: 'Sweet and crispy organic apples from Punjab orchards',
      category: 'fruits',
      price: 120,
      unit: 'kg',
      availableQuantity: 200,
      minimumOrderQuantity: 3, // Minimum 3kg order
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    },
    {
      name: 'Wheat Flour',
      description: 'Freshly ground wheat flour from Punjab wheat',
      category: 'grains',
      price: 35,
      unit: 'kg',
      availableQuantity: 300,
      minimumOrderQuantity: 25, // Farmer requires minimum 25kg order
      location: {
        type: 'Point',
        coordinates: [75.8573, 30.8408] // Ludhiana, Punjab
      },
      harvestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
    }
  ],

  hardwareMessages: [
    {
      sensorData: {
        ph: 6.5,
        nitrogen: 45,
        phosphorus: 23,
        potassium: 78,
        humidity: 65,
        rainfall: 3.2,
        temperature: 25
      }
    },
    {
      sensorData: {
        ph: 7.2,
        nitrogen: 38,
        phosphorus: 19,
        potassium: 65,
        humidity: 58,
        rainfall: 2.8,
        temperature: 28
      }
    },
    {
      sensorData: {
        ph: 6.8,
        nitrogen: 42,
        phosphorus: 21,
        potassium: 72,
        humidity: 62,
        rainfall: 3.5,
        temperature: 26
      }
    }
  ],

  cropRecommendations: [
    {
      recommendations: [
        {
          cropName: 'Tomato',
          suitabilityPercentage: 85,
          expectedYield: 25
        },
        {
          cropName: 'Wheat',
          suitabilityPercentage: 78,
          expectedYield: 40
        },
        {
          cropName: 'Rice',
          suitabilityPercentage: 72,
          expectedYield: 35
        }
      ],
      generalRecommendations: [
        'Soil pH is optimal for most crops',
        'Consider adding organic compost to improve soil structure',
        'Maintain current irrigation schedule'
      ],
      processingTime: 1500
    },
    {
      recommendations: [
        {
          cropName: 'Rice',
          suitabilityPercentage: 88,
          expectedYield: 42
        },
        {
          cropName: 'Sugarcane',
          suitabilityPercentage: 82,
          expectedYield: 65
        }
      ],
      generalRecommendations: [
        'Soil is well-suited for rice cultivation',
        'Consider nitrogen supplementation',
        'Monitor moisture levels during dry season'
      ],
      processingTime: 1200
    }
  ],

  // soilReports removed - using HardwareMessage and CropRecommendation instead

  diseaseReports: [
    {
      imageUrl: '/uploads/sample-disease-1.jpg',
      diseaseName: 'Tomato Blight',
      treatment: 'Apply copper-based fungicide every 7-10 days. Ensure proper air circulation between plants and avoid overhead watering.'
    },
    {
      imageUrl: '/uploads/sample-disease-2.jpg',
      diseaseName: 'Wheat Rust',
      treatment: 'Apply triazole-based fungicide immediately. Plant resistant wheat varieties in future seasons.'
    },
    {
      imageUrl: '/uploads/sample-disease-3.jpg',
      diseaseName: 'Leaf Spot',
      treatment: 'Remove affected leaves and apply organic neem oil spray. Improve air circulation around plants.'
    }
  ]
};

/**
 * Clear existing data
 */
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await HardwareMessage.deleteMany({});
    await CropRecommendation.deleteMany({});
    // SoilReport removed - using HardwareMessage and CropRecommendation instead
    await DiseaseReport.deleteMany({});
    await Notification.deleteMany({});
    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Error clearing database:', error);
    throw error;
  }
};

/**
 * Seed users
 */
const seedUsers = async () => {
  try {
    const users = [];
    
    for (const userData of sampleData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      users.push({
        ...userData,
        password: hashedPassword
      });
    }
    
    const createdUsers = await User.insertMany(users);
    logger.info(`${createdUsers.length} users created successfully`);
    
    return createdUsers;
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

/**
 * Seed products
 */
const seedProducts = async (users) => {
  try {
    const farmer = users.find(user => user.role === 'farmer');
    const products = [];
    
    for (const productData of sampleData.products) {
      products.push({
        ...productData,
        sellerId: farmer._id
      });
    }
    
    const createdProducts = await Product.insertMany(products);
    logger.info(`${createdProducts.length} products created successfully`);
    
    return createdProducts;
  } catch (error) {
    logger.error('Error seeding products:', error);
    throw error;
  }
};

/**
 * Seed orders
 */
const seedOrders = async (users, products) => {
  try {
    const vendors = users.filter(user => user.role === 'vendor');
    const consumers = users.filter(user => user.role === 'consumer');
    const orders = [];
    
    // Create some sample orders
    for (let i = 0; i < 5; i++) {
      const buyer = i % 2 === 0 ? vendors[i % vendors.length] : consumers[i % consumers.length];
      const seller = users.find(user => user.role === 'farmer');
      const product = products[i % products.length];
      
      orders.push({
        buyerId: buyer._id,
        sellerId: seller._id,
        products: [{
          productId: product._id,
          name: product.name,
          quantity: Math.max(product.minimumOrderQuantity || 1, 5),
          price: product.price,
          unit: product.unit
        }],
        totalAmount: product.price * Math.max(product.minimumOrderQuantity || 1, 5),
        status: ['pending', 'confirmed', 'delivered'][i % 3],
        deliveryAddress: buyer.address,
        deliveryLocation: {
          type: 'Point',
          coordinates: buyer.location.coordinates
        }
      });
    }
    
    const createdOrders = await Order.insertMany(orders);
    logger.info(`${createdOrders.length} orders created successfully`);
    
    return createdOrders;
  } catch (error) {
    logger.error('Error seeding orders:', error);
    throw error;
  }
};

/**
 * Seed hardware messages
 */
const seedHardwareMessages = async (users) => {
  try {
    const farmer = users.find(user => user.role === 'farmer');
    const hardwareMessages = [];
    
    for (const messageData of sampleData.hardwareMessages) {
      hardwareMessages.push({
        ...messageData,
        farmerId: farmer._id
      });
    }
    
    const createdMessages = await HardwareMessage.insertMany(hardwareMessages);
    logger.info(`${createdMessages.length} hardware messages created successfully`);
    
    return createdMessages;
  } catch (error) {
    logger.error('Error seeding hardware messages:', error);
    throw error;
  }
};

/**
 * Seed crop recommendations
 */
const seedCropRecommendations = async (users, hardwareMessages) => {
  try {
    const farmer = users.find(user => user.role === 'farmer');
    const cropRecommendations = [];
    
    for (let i = 0; i < sampleData.cropRecommendations.length; i++) {
      const recommendationData = sampleData.cropRecommendations[i];
      const hardwareMessage = hardwareMessages[i % hardwareMessages.length];
      
      cropRecommendations.push({
        ...recommendationData,
        farmerId: farmer._id,
        hardwareMessageId: hardwareMessage._id
      });
    }
    
    const createdRecommendations = await CropRecommendation.insertMany(cropRecommendations);
    logger.info(`${createdRecommendations.length} crop recommendations created successfully`);
    
    return createdRecommendations;
  } catch (error) {
    logger.error('Error seeding crop recommendations:', error);
    throw error;
  }
};

// seedSoilReports removed - using HardwareMessage and CropRecommendation instead

/**
 * Seed disease reports
 */
const seedDiseaseReports = async (users) => {
  try {
    const farmer = users.find(user => user.role === 'farmer');
    const diseaseReports = [];
    
    for (const reportData of sampleData.diseaseReports) {
      diseaseReports.push({
        ...reportData,
        farmerId: farmer._id
      });
    }
    
    const createdReports = await DiseaseReport.insertMany(diseaseReports);
    logger.info(`${createdReports.length} disease reports created successfully`);
    
    return createdReports;
  } catch (error) {
    logger.error('Error seeding disease reports:', error);
    throw error;
  }
};

/**
 * Seed notifications
 */
const seedNotifications = async (users) => {
  try {
    const notifications = [];
    
    // Create sample notifications for different users
    const farmer = users.find(user => user.role === 'farmer');
    const vendor = users.find(user => user.role === 'vendor');
    const consumer = users.find(user => user.role === 'consumer');
    
    const sampleNotifications = [
      {
        userId: farmer._id,
        title: 'New Order Received',
        message: 'You have received a new order for Fresh Tomatoes',
        type: 'order_update',
        isRead: false
      },
      {
        userId: vendor._id,
        title: 'ML Analysis Complete',
        message: 'Fresh Basmati Rice analysis is complete from Harpreet Singh Dhillon',
        type: 'ml_complete',
        isRead: false
      },
      {
        userId: consumer._id,
        title: 'Vendor Nearby',
        message: 'Gurdeep Singh Brar is nearby with fresh vegetables',
        type: 'vendor_nearby',
        isRead: true
      }
    ];
    
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    logger.info(`${createdNotifications.length} notifications created successfully`);
    
    return createdNotifications;
  } catch (error) {
    logger.error('Error seeding notifications:', error);
    throw error;
  }
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data in order
    const users = await seedUsers();
    const products = await seedProducts(users);
    const orders = await seedOrders(users, products);
    const hardwareMessages = await seedHardwareMessages(users);
    const cropRecommendations = await seedCropRecommendations(users, hardwareMessages);
    // soilReports removed - using HardwareMessage and CropRecommendation instead
    const diseaseReports = await seedDiseaseReports(users);
    const notifications = await seedNotifications(users);
    
    logger.info('Database seeding completed successfully!');
    logger.info('Summary:');
    logger.info(`- Users: ${users.length} (1 farmer, 10 vendors, 20 consumers)`);
    logger.info(`- Products: ${products.length}`);
    logger.info(`- Orders: ${orders.length}`);
    logger.info(`- Hardware Messages: ${hardwareMessages.length}`);
    logger.info(`- Crop Recommendations: ${cropRecommendations.length}`);
    logger.info(`- Disease Reports: ${diseaseReports.length}`);
    logger.info(`- Notifications: ${notifications.length}`);
    
    // Log sample login credentials
    logger.info('\n=== Sample Login Credentials ===');
    logger.info('Farmer: farmer@annadata.com / Password123');
    logger.info('Vendor: vendor1@annadata.com / Password123');
    logger.info('Consumer: consumer1@annadata.com / Password123');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };