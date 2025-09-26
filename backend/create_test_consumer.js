const mongoose = require('mongoose');
const { User } = require('./models');

async function createTestConsumer() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/annadata');
    
    // Create or update the mock consumer user that matches the socket handler
    const testConsumer = await User.findOneAndUpdate(
      { _id: '507f1f77bcf86cd799439011' },
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Consumer',
        email: 'test.consumer@example.com',
        phone: '+919999999999',
        role: 'consumer',
        location: {
          type: 'Point',
          coordinates: [75.705, 31.252] // Close to simulation
        },
        notificationPreferences: {
          proximityNotifications: {
            enabled: true,
            radius: 1000, // 1km
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00'
            }
          },
          doNotDisturb: false
        },
        isActive: true
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Test consumer created/updated:', testConsumer);
    console.log('Location:', testConsumer.location);
    console.log('Notification preferences:', testConsumer.notificationPreferences);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestConsumer();