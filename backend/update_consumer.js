// Quick script to update a consumer for testing notifications
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/annadata', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function updateConsumer() {
  try {
    // Update the first consumer to be near the simulation and enable notifications
    const result = await User.findOneAndUpdate(
      { role: 'consumer' },
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [75.705, 31.252] // Close to simulation location
          },
          notificationPreferences: {
            proximityNotifications: {
              enabled: true,
              radius: 1000, // 1km radius
              quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
              }
            },
            doNotDisturb: false
          },
          isActive: true
        }
      },
      { new: true }
    );

    console.log('Updated consumer:', result);
    console.log('Consumer location:', result.location);
    console.log('Notification preferences:', result.notificationPreferences);

    process.exit(0);
  } catch (error) {
    console.error('Error updating consumer:', error);
    process.exit(1);
  }
}

updateConsumer();