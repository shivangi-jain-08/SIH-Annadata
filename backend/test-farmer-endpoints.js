const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test user ID (you can replace this with a real user ID from your database)
const TEST_USER_ID = '507f1f77bcf86cd799439011';

async function testFarmerEndpoints() {
  console.log('Testing Farmer Dashboard Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Order stats (with mock auth)
    console.log('\n2. Testing order stats...');
    try {
      const orderStatsResponse = await axios.get(`${BASE_URL}/orders/stats`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_ID}`
        }
      });
      console.log('✅ Order stats:', orderStatsResponse.data);
    } catch (error) {
      console.log('❌ Order stats error:', error.response?.data || error.message);
    }

    // Test 3: My products
    console.log('\n3. Testing my products...');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products/my-products`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_ID}`
        }
      });
      console.log('✅ My products:', productsResponse.data);
    } catch (error) {
      console.log('❌ My products error:', error.response?.data || error.message);
    }

    // Test 4: My orders
    console.log('\n4. Testing my orders...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_ID}`
        }
      });
      console.log('✅ My orders:', ordersResponse.data);
    } catch (error) {
      console.log('❌ My orders error:', error.response?.data || error.message);
    }

    // Test 5: Crop recommendations
    console.log('\n5. Testing crop recommendations...');
    try {
      const cropResponse = await axios.get(`${BASE_URL}/ml/crop-recommendations`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_ID}`
        }
      });
      console.log('✅ Crop recommendations:', cropResponse.data);
    } catch (error) {
      console.log('❌ Crop recommendations error:', error.response?.data || error.message);
    }

    // Test 6: Soil reports
    console.log('\n6. Testing soil reports...');
    try {
      const soilResponse = await axios.get(`${BASE_URL}/ml/soil-reports/latest`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_ID}`
        }
      });
      console.log('✅ Soil reports:', soilResponse.data);
    } catch (error) {
      console.log('❌ Soil reports error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the tests
testFarmerEndpoints();