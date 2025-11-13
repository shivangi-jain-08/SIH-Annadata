// Test script to verify Gemini API key and project
const https = require('https');

const GEMINI_API_KEY = 'geminikeyhere'; // Replace with your Gemini API key

console.log('\n🔍 Testing Gemini API Key...\n');
console.log('API Key:', GEMINI_API_KEY.substring(0, 20) + '...');
console.log('Expected Project Number: 88533503361\n');

const postData = JSON.stringify({
  contents: [{
    parts: [{
      text: "Say hello in one word"
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models/gemini-2.5-flash:generateContent`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-goog-api-key': GEMINI_API_KEY,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📡 Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! API key is working!');
        console.log('\nResponse:', JSON.stringify(response, null, 2));
      } else {
        console.log('❌ ERROR! API key failed!');
        console.log('\nError Response:', JSON.stringify(response, null, 2));
        
        // Extract project number from error
        if (response.error && response.error.details) {
          const details = response.error.details;
          details.forEach(detail => {
            if (detail.metadata && detail.metadata.consumer) {
              console.log('\n🔴 This API key belongs to project:', detail.metadata.consumer);
            }
          });
        }
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
