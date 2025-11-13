const mongoose = require('mongoose');
const { User, Product } = require('../models');
const config = require('../config');

async function addMoreFarmers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create diverse farmers with different locations
    const farmers = [
      {
        email: 'rajesh.punjab@farm.com',
        password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm', // password: test123
        name: 'Rajesh Kumar Singh',
        role: 'farmer',
        phone: '+91-9876543210',
        location: {
          type: 'Point',
          coordinates: [75.8573, 30.9010] // Ludhiana, Punjab
        },
        address: 'Village Khairpur, Ludhiana, Punjab, India'
      },
      {
        email: 'suresh.haryana@farm.com',
        password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm',
        name: 'Suresh Patel',
        role: 'farmer',
        phone: '+91-9876543211',
        location: {
          type: 'Point',
          coordinates: [76.7794, 28.4595] // Rohtak, Haryana
        },
        address: 'Village Rohtak, Rohtak, Haryana, India'
      },
      {
        email: 'priya.maharashtra@farm.com',
        password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm',
        name: 'Priya Sharma',
        role: 'farmer',
        phone: '+91-9876543212',
        location: {
          type: 'Point',
          coordinates: [73.7898, 19.9975] // Nashik, Maharashtra
        },
        address: 'Village Nashik, Nashik, Maharashtra, India'
      },
      {
        email: 'vikram.rajasthan@farm.com',
        password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm',
        name: 'Vikram Singh',
        role: 'farmer',
        phone: '+91-9876543213',
        location: {
          type: 'Point',
          coordinates: [73.0243, 26.2389] // Jodhpur, Rajasthan
        },
        address: 'Village Jodhpur, Jodhpur, Rajasthan, India'
      },
      {
        email: 'amit.himachal@farm.com',
        password: '$2a$10$rOvRoi24.cJ7sPR0ot8y.OlSAR9b.Nqd/q/TXvKjrqgdHrAeUyYzm',
        name: 'Amit Gupta',
        role: 'farmer',
        phone: '+91-9876543214',
        location: {
          type: 'Point',
          coordinates: [77.1734, 31.1048] // Shimla, Himachal Pradesh
        },
        address: 'Village Shimla, Shimla, Himachal Pradesh, India'
      }
    ];

    // Create farmers and their products
    for (const farmerData of farmers) {
      let farmer = await User.findOne({ email: farmerData.email });
      if (!farmer) {
        farmer = new User(farmerData);
        farmer = await farmer.save();
        console.log(`Created farmer: ${farmer.name}`);

        // Create products for each farmer based on their region
        let products = [];
        
        if (farmerData.address.includes('Punjab')) {
          products = [
            {
              sellerId: farmer._id,
              name: 'Premium Wheat',
              description: 'High quality organic wheat grown using traditional methods',
              category: 'grains',
              price: 35,
              unit: 'kg',
              availableQuantity: 500,
              minimumOrderQuantity: 10,
              isActive: true
            },
            {
              sellerId: farmer._id,
              name: 'Basmati Rice',
              description: 'Aromatic long grain basmati rice',
              category: 'grains',
              price: 45,
              unit: 'kg',
              availableQuantity: 300,
              minimumOrderQuantity: 5,
              isActive: true
            }
          ];
        } else if (farmerData.address.includes('Maharashtra')) {
          products = [
            {
              sellerId: farmer._id,
              name: 'Fresh Tomatoes',
              description: 'Farm fresh organic tomatoes, rich in nutrients',
              category: 'vegetables',
              price: 25,
              unit: 'kg',
              availableQuantity: 150,
              minimumOrderQuantity: 2,
              isActive: true
            },
            {
              sellerId: farmer._id,
              name: 'Red Onions',
              description: 'Fresh red onions, perfect for cooking',
              category: 'vegetables',
              price: 20,
              unit: 'kg',
              availableQuantity: 400,
              minimumOrderQuantity: 5,
              isActive: true
            }
          ];
        } else if (farmerData.address.includes('Himachal')) {
          products = [
            {
              sellerId: farmer._id,
              name: 'Fresh Apples',
              description: 'Crisp and juicy apples from hill stations',
              category: 'fruits',
              price: 80,
              unit: 'kg',
              availableQuantity: 200,
              minimumOrderQuantity: 1,
              isActive: true
            }
          ];
        } else if (farmerData.address.includes('Rajasthan')) {
          products = [
            {
              sellerId: farmer._id,
              name: 'Cotton',
              description: 'High quality cotton for textile industry',
              category: 'other',
              price: 55,
              unit: 'kg',
              availableQuantity: 350,
              minimumOrderQuantity: 20,
              isActive: true
            }
          ];
        } else if (farmerData.address.includes('Haryana')) {
          products = [
            {
              sellerId: farmer._id,
              name: 'Mustard Seeds',
              description: 'Premium quality mustard seeds',
              category: 'spices',
              price: 65,
              unit: 'kg',
              availableQuantity: 100,
              minimumOrderQuantity: 5,
              isActive: true
            }
          ];
        }

        // Create the products
        for (const productData of products) {
          const existingProduct = await Product.findOne({ 
            sellerId: productData.sellerId, 
            name: productData.name 
          });
          if (!existingProduct) {
            const product = new Product(productData);
            await product.save();
            console.log(`Created product: ${productData.name} for ${farmer.name}`);
          }
        }
      } else {
        console.log(`Farmer ${farmerData.name} already exists`);
      }
    }

    console.log('\n✅ Additional farmers and products created successfully!');
    console.log('\nNew farmer accounts:');
    console.log('- Rajesh Kumar Singh (Punjab) - rajesh.punjab@farm.com / test123');
    console.log('- Suresh Patel (Haryana) - suresh.haryana@farm.com / test123');
    console.log('- Priya Sharma (Maharashtra) - priya.maharashtra@farm.com / test123');
    console.log('- Vikram Singh (Rajasthan) - vikram.rajasthan@farm.com / test123');
    console.log('- Amit Gupta (Himachal Pradesh) - amit.himachal@farm.com / test123');

  } catch (error) {
    console.error('Error adding farmers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addMoreFarmers();
}

module.exports = addMoreFarmers;