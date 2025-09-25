const mongoose = require('mongoose');
const { HardwareMessage, User } = require('../models');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/annadata');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const addHardwareData = async () => {
  try {
    await connectDB();

    // Find a farmer user or create one
    let farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      farmer = new User({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'hashedpassword',
        role: 'farmer',
        phone: '1234567890',
        location: [77.2090, 28.6139]
      });
      await farmer.save();
      console.log('Created test farmer:', farmer._id);
    }

    // Create hardware message with sensor data and crop recommendations
    const hardwareMessage = new HardwareMessage({
      farmerId: farmer._id,
      sensorData: {
        ph: 6.5,
        nitrogen: 45,
        phosphorus: 25,
        potassium: 180,
        humidity: 65,
        rainfall: 12,
        temperature: 28,
        organicMatter: 3.2,
        moisture: 65
      },
      recommendations: [
        'Soil pH is optimal for most crops',
        'Nitrogen levels are good for leafy vegetables',
        'Consider adding organic compost to improve soil structure',
        'Moisture levels are adequate for current season'
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
        },
        {
          cropName: 'Wheat',
          suitabilityPercentage: 78,
          expectedYield: '4-6 tons per hectare'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    });

    await hardwareMessage.save();
    console.log('Hardware message created:', hardwareMessage._id);

    // Create another hardware message with different data
    const hardwareMessage2 = new HardwareMessage({
      farmerId: farmer._id,
      sensorData: {
        ph: 7.2,
        nitrogen: 38,
        phosphorus: 30,
        potassium: 200,
        humidity: 70,
        rainfall: 8,
        temperature: 26,
        organicMatter: 2.8,
        moisture: 58
      },
      recommendations: [
        'Soil pH is slightly alkaline, consider adding sulfur',
        'Phosphorus levels are excellent',
        'Good potassium content for root vegetables',
        'Consider irrigation due to lower moisture'
      ],
      cropRecommendations: [
        {
          cropName: 'Potato',
          suitabilityPercentage: 88,
          expectedYield: '25-30 tons per hectare'
        },
        {
          cropName: 'Carrot',
          suitabilityPercentage: 82,
          expectedYield: '20-25 tons per hectare'
        },
        {
          cropName: 'Onion',
          suitabilityPercentage: 90,
          expectedYield: '15-20 tons per hectare'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    });

    await hardwareMessage2.save();
    console.log('Second hardware message created:', hardwareMessage2._id);

    console.log('Test hardware data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding hardware data:', error);
    process.exit(1);
  }
};

addHardwareData();