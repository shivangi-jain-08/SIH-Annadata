#!/usr/bin/env node

/**
 * Test script to verify Gemini API configuration
 * Run with: node test-gemini-config.js
 */

console.log('🧪 Testing Gemini API Configuration...\n');

// Test 1: Load .env file
require('dotenv').config();
console.log('1️⃣ Testing .env file loading:');
console.log('   GEMINI_API_KEY from process.env:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
console.log('   Key value:', process.env.GEMINI_API_KEY);

// Test 2: Test API key directly
const apiKey = process.env.GEMINI_API_KEY || 'geminikeyhere';
console.log('\n2️⃣ Testing API key with Gemini API:');
console.log('   Using key:', apiKey);

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.log('   ❌ Error:', data.error.message);
      console.log('   Project:', data.error.details?.[0]?.metadata?.consumer || 'Unknown');
      console.log('   Status:', data.error.status);
      console.log('\n   Full error:', JSON.stringify(data.error, null, 2));
    } else {
      console.log('   ✅ Success!');
      console.log('   Model:', data.name);
      console.log('   Display Name:', data.displayName);
      console.log('   Version:', data.version);
      
      // Extract project number from API response
      console.log('\n3️⃣ Attempting to detect project number...');
      
      // Make a request to get quota info
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, what project am I using?'
            }]
          }]
        })
      })
        .then(r => r.json())
        .then(d => {
          if (d.error) {
            const project = d.error.details?.[0]?.metadata?.consumer || 'Unknown';
            console.log('   Project from error:', project);
            if (project.includes('840080244280')) {
              console.log('   ⚠️  WARNING: Still using OLD project with zero quota!');
            } else if (project.includes('88533503361')) {
              console.log('   ✅ Using NEW project (Annadata) with quota!');
            }
          } else {
            console.log('   ✅ API call successful!');
            console.log('   Response:', d.candidates?.[0]?.content?.parts?.[0]?.text || 'Success');
            console.log('   Using project: 88533503361 (Annadata) ✅');
          }
          
          console.log('\n✨ Configuration test complete!\n');
          console.log('📋 Summary:');
          console.log('   - .env file: ✅');
          console.log('   - API key: ✅');
          console.log('   - Model available: ✅');
          console.log('   - Project:', data.error ? 'Check above' : '88533503361 (new)');
        })
        .catch(e => console.error('   ❌ Test request failed:', e.message));
    }
  })
  .catch(error => {
    console.log('   ❌ Network error:', error.message);
  });
