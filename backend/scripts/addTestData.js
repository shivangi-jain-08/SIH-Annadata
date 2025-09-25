const mongoose = require('mongoose');
const { User, Product, Order, HardwareMessage, CropRecommendation, DiseaseReport } = require('../models');
const config = require('../config');

async function addTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test users
    const testFarmer = new User({
      email: 'farmer@test.com',
      password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm', // password: test123
      name: 'Test Farmer',
      role: 'farmer',
      phone: '+1234567890',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      },
      address: 'Test Farm, Delhi, India'
    });

    const testVendor = new User({
      email: 'vendor@test.com',
      password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm', // password: test123
      name: 'Test Vendor',
      role: 'vendor',
      phone: '+1234567891',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      address: 'Test Vendor Shop, Delhi, India'
    });

    const testConsumer = new User({
      email: 'consumer@test.com',
      password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm', // password: test123
      name: 'Test Consumer',
      role: 'consumer',
      phone: '+1234567892',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      address: 'Test Consumer Home, Delhi, India'
    });

    // Save users (check if they exist first)
    let farmer = await User.findOne({ email: 'farmer@test.com' });
    if (!farmer) {
      farmer = await testFarmer.save();
      console.log('Created test farmer');
    }

    let vendor = await User.findOne({ email: 'vendor@test.com' });
    if (!vendor) {
      vendor = await testVendor.save();
      console.log('Created test vendor');
    }

    let consumer = await User.findOne({ email: 'consumer@test.com' });
    if (!consumer) {
      consumer = await testConsumer.save();
      console.log('Created test consumer');
    }

    // Create test products
    const products = [
      {
        sellerId: farmer._id,
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, freshly harvested',
        category: 'vegetables',
        price: 45,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 5,
        images: [],
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        }
      },
      {
        sellerId: farmer._id,
        name: 'Organic Spinach',
        description: 'Fresh green spinach leaves',
        category: 'vegetables',
        price: 35,
        unit: 'kg',
        availableQuantity: 50,
        minimumOrderQuantity: 2,
        images: [],
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        }
      },
      {
        sellerId: vendor._id,
        name: 'Mixed Vegetables',
        description: 'Assorted fresh vegetables',
        category: 'vegetables',
        price: 60,
        unit: 'kg',
        availableQuantity: 30,
        minimumOrderQuantity: 1,
        images: [],
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        }
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ 
        sellerId: productData.sellerId, 
        name: productData.name 
      });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`Created product: ${productData.name}`);
      }
    }

    // Create test orders
    const savedProducts = await Product.find();
    if (savedProducts.length > 0) {
      const orders = [
        {
          buyerId: vendor._id,
          sellerId: farmer._id,
          products: [{
            productId: savedProducts[0]._id,
            name: savedProducts[0].name,
            quantity: 10,
            price: savedProducts[0].price,
            unit: savedProducts[0].unit
          }],
          status: 'delivered',
          totalAmount: savedProducts[0].price * 10,
          deliveryAddress: 'Test Vendor Shop, Delhi, India'
        },
        {
          buyerId: consumer._id,
          sellerId: vendor._id,
          products: [{
            productId: savedProducts[2]._id,
            name: savedProducts[2].name,
            quantity: 2,
            price: savedProducts[2].price,
            unit: savedProducts[2].unit
          }],
          status: 'pending',
          totalAmount: savedProducts[2].price * 2,
          deliveryAddress: 'Test Consumer Home, Delhi, India'
        }
      ];

      for (const orderData of orders) {
        const existingOrder = await Order.findOne({ 
          buyerId: orderData.buyerId, 
          sellerId: orderData.sellerId,
          'products.productId': orderData.products[0].productId
        });
        if (!existingOrder) {
          const order = new Order(orderData);
          await order.save();
          console.log(`Created order: ${orderData.status}`);
        }
      }
    }

    // Create test hardware message (soil data)
    const hardwareMessage = {
      farmerId: farmer._id,
      sensorData: {
        ph: 6.5,
        nitrogen: 45,
        phosphorus: 25,
        potassium: 180,
        organicMatter: 3.2,
        moisture: 65,
        temperature: 28
      },
      recommendations: [
        'Soil pH is optimal for most crops',
        'Nitrogen levels are good for leafy vegetables',
        'Consider adding organic compost to improve soil structure'
      ],
      cropRecommendations: [
        {
          cropName: 'Tomato',
          suitabilityPercentage: 85,
          expectedYield: '15-20 tons per hectare'
        },
        {
          cropName: 'Spinach',
          suitabilityPercentage: 92,
          expectedYield: '8-12 tons per hectare'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    };

    const existingHardwareMessage = await HardwareMessage.findOne({ farmerId: farmer._id });
    if (!existingHardwareMessage) {
      const message = new HardwareMessage(hardwareMessage);
      await message.save();
      console.log('Created hardware message with soil data');
    }

    // Create test crop recommendation
    const cropRecommendation = {
      farmerId: farmer._id,
      recommendations: [
        {
          cropName: 'Tomato',
          suitabilityPercentage: 85,
          expectedYield: '15-20 tons per hectare',
          plantingAdvice: 'Plant during cooler months for better yield'
        }
      ],
      analysisDate: new Date(),
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    };

    const existingCropRec = await CropRecommendation.findOne({ farmerId: farmer._id });
    if (!existingCropRec) {
      const rec = new CropRecommendation(cropRecommendation);
      await rec.save();
      console.log('Created crop recommendation');
    }

    console.log('Test data setup complete!');
    console.log('\nTest accounts:');
    console.log('Farmer: farmer@test.com / test123');
    console.log('Vendor: vendor@test.com / test123');
    console.log('Consumer: consumer@test.com / test123');

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addTestData();
}

module.exports = addTestData;