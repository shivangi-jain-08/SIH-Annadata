#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class IntegrationVerifier {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, tests: [] },
      frontend: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      realtime: { passed: 0, failed: 0, tests: [] }
    };
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  async runTest(category, testName, testFn) {
    log(`\n${colors.cyan}Testing: ${testName}${colors.reset}`);
    
    try {
      await testFn();
      this.results[category].passed++;
      this.results[category].tests.push({ name: testName, status: 'PASSED' });
      log(`${colors.green}✓ ${testName} - PASSED${colors.reset}`);
      return true;
    } catch (error) {
      this.results[category].failed++;
      this.results[category].tests.push({ name: testName, status: 'FAILED', error: error.message });
      log(`${colors.red}✗ ${testName} - FAILED${colors.reset}`);
      log(`${colors.red}  Error: ${error.message}${colors.reset}`);
      return false;
    }
  }

  async verifyBackendEndpoints() {
    log(`${colors.bright}${colors.blue}🔧 Verifying Backend API Endpoints${colors.reset}`);

    // Test product endpoints
    await this.runTest('backend', 'GET /api/products', async () => {
      const response = await axios.get(`${this.backendUrl}/api/products`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response not successful');
    });

    await this.runTest('backend', 'POST /api/products (Create Product)', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        category: 'vegetables',
        price: 50,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 5
      };
      
      const response = await axios.post(`${this.backendUrl}/api/products`, productData, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      
      if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
      if (!response.data.success) throw new Error('Product creation failed');
    });

    // Test location endpoints
    await this.runTest('backend', 'GET /api/location/vendor-status', async () => {
      const response = await axios.get(`${this.backendUrl}/api/location/vendor-status`, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    });

    await this.runTest('backend', 'POST /api/location/vendor-status (Go Online)', async () => {
      const locationData = {
        isOnline: true,
        latitude: 28.6139,
        longitude: 77.2090,
        deliveryRadius: 2000,
        acceptingOrders: true
      };
      
      const response = await axios.post(`${this.backendUrl}/api/location/vendor-status`, locationData, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Vendor status update failed');
    });

    // Test proximity notification endpoint
    await this.runTest('backend', 'POST /api/location/notify-proximity', async () => {
      const notificationData = {
        latitude: 28.6139,
        longitude: 77.2090,
        message: 'Test proximity notification'
      };
      
      const response = await axios.post(`${this.backendUrl}/api/location/notify-proximity`, notificationData, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Proximity notification failed');
    });

    // Test nearby vendors endpoint
    await this.runTest('backend', 'GET /api/location/nearby-vendors', async () => {
      const response = await axios.get(`${this.backendUrl}/api/location/nearby-vendors?latitude=28.6139&longitude=77.2090&radius=5000`);
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Nearby vendors query failed');
    });
  }

  async verifyFrontendComponents() {
    log(`${colors.bright}${colors.blue}🎨 Verifying Frontend Components${colors.reset}`);

    // Check if key component files exist
    const componentFiles = [
      'src/components/vendor/LocationAvailabilityManager.tsx',
      'src/components/vendor/ProductManagement.tsx',
      'src/components/marketplace/LocationBasedMarketplace.tsx',
      'src/components/notifications/ProximityNotificationHandler.tsx',
      'src/hooks/useVendorConsumerSales.ts',
      'src/hooks/useLocation.ts',
      'src/hooks/useProducts.ts'
    ];

    for (const file of componentFiles) {
      await this.runTest('frontend', `Component exists: ${file}`, async () => {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`File does not exist: ${file}`);
        }
        
        // Check if file has content
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.length < 100) {
          throw new Error(`File appears to be empty or too small: ${file}`);
        }
      });
    }

    // Check if build succeeds
    await this.runTest('frontend', 'Frontend Build', async () => {
      try {
        execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() });
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    });

    // Check if TypeScript compilation succeeds
    await this.runTest('frontend', 'TypeScript Compilation', async () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
      } catch (error) {
        throw new Error(`TypeScript compilation failed: ${error.message}`);
      }
    });
  }

  async verifyIntegrationFeatures() {
    log(`${colors.bright}${colors.blue}🔗 Verifying Integration Features${colors.reset}`);

    // Test database models
    await this.runTest('integration', 'Database Models', async () => {
      const modelFiles = [
        '../backend/models/Product.js',
        '../backend/models/VendorLocation.js',
        '../backend/models/User.js'
      ];

      for (const file of modelFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Model file missing: ${file}`);
        }
      }
    });

    // Test API service integration
    await this.runTest('integration', 'API Service Configuration', async () => {
      const apiServicePath = path.join(process.cwd(), 'src/services/api.ts');
      if (!fs.existsSync(apiServicePath)) {
        throw new Error('API service file missing');
      }

      const content = fs.readFileSync(apiServicePath, 'utf8');
      
      // Check for required API methods
      const requiredMethods = [
        'getProducts',
        'createProduct',
        'updateProduct',
        'deleteProduct',
        'getVendorStatus',
        'updateVendorStatus',
        'getNearbyVendors'
      ];

      for (const method of requiredMethods) {
        if (!content.includes(method)) {
          throw new Error(`API method missing: ${method}`);
        }
      }
    });

    // Test WebSocket configuration
    await this.runTest('integration', 'WebSocket Configuration', async () => {
      const wsContextPath = path.join(process.cwd(), 'src/contexts/WebSocketContext.tsx');
      if (!fs.existsSync(wsContextPath)) {
        throw new Error('WebSocket context file missing');
      }

      const content = fs.readFileSync(wsContextPath, 'utf8');
      
      // Check for required WebSocket events
      const requiredEvents = [
        'vendor-online',
        'vendor-offline',
        'vendor-location-update',
        'vendor-nearby',
        'product-updated'
      ];

      for (const event of requiredEvents) {
        if (!content.includes(event)) {
          throw new Error(`WebSocket event missing: ${event}`);
        }
      }
    });

    // Test environment configuration
    await this.runTest('integration', 'Environment Configuration', async () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      if (!fs.existsSync(envExamplePath)) {
        throw new Error('.env.example file missing');
      }

      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      const requiredVars = [
        'REACT_APP_API_URL',
        'REACT_APP_SOCKET_URL'
      ];

      for (const envVar of requiredVars) {
        if (!content.includes(envVar)) {
          throw new Error(`Environment variable missing: ${envVar}`);
        }
      }
    });
  }

  async verifyRealTimeFeatures() {
    log(`${colors.bright}${colors.blue}⚡ Verifying Real-Time Features${colors.reset}`);

    // Test Socket.io server configuration
    await this.runTest('realtime', 'Socket.io Server Setup', async () => {
      const serverPath = path.join(process.cwd(), '../backend/server.js');
      if (!fs.existsSync(serverPath)) {
        throw new Error('Backend server file missing');
      }

      const content = fs.readFileSync(serverPath, 'utf8');
      
      if (!content.includes('socket.io')) {
        throw new Error('Socket.io not configured in server');
      }

      if (!content.includes('vendor-online') || !content.includes('vendor-offline')) {
        throw new Error('Vendor status events not configured');
      }
    });

    // Test real-time hooks
    await this.runTest('realtime', 'Real-Time Hooks', async () => {
      const hookFiles = [
        'src/hooks/useRealTime.ts',
        'src/hooks/useVendorRealTime.ts'
      ];

      for (const file of hookFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Real-time hook missing: ${file}`);
        }
      }
    });

    // Test notification system
    await this.runTest('realtime', 'Notification System', async () => {
      const notificationPath = path.join(process.cwd(), 'src/components/notifications/ProximityNotificationHandler.tsx');
      if (!fs.existsSync(notificationPath)) {
        throw new Error('Proximity notification handler missing');
      }

      const content = fs.readFileSync(notificationPath, 'utf8');
      
      if (!content.includes('Notification.permission')) {
        throw new Error('Browser notification API not implemented');
      }
    });

    // Test location services
    await this.runTest('realtime', 'Location Services', async () => {
      const locationHookPath = path.join(process.cwd(), 'src/hooks/useLocation.ts');
      if (!fs.existsSync(locationHookPath)) {
        throw new Error('Location hook missing');
      }

      const content = fs.readFileSync(locationHookPath, 'utf8');
      
      if (!content.includes('navigator.geolocation')) {
        throw new Error('Geolocation API not implemented');
      }

      if (!content.includes('watchPosition')) {
        throw new Error('Location watching not implemented');
      }
    });
  }

  async runAllVerifications() {
    log(`${colors.bright}${colors.magenta}🚀 Annadata Integration Verification${colors.reset}`);
    log(`${colors.bright}${colors.magenta}=====================================${colors.reset}`);

    try {
      await this.verifyBackendEndpoints();
      await this.verifyFrontendComponents();
      await this.verifyIntegrationFeatures();
      await this.verifyRealTimeFeatures();
    } catch (error) {
      log(`${colors.red}Verification process failed: ${error.message}${colors.reset}`);
    }

    this.generateReport();
  }

  generateReport() {
    log(`\n${colors.bright}${colors.magenta}📊 Integration Verification Report${colors.reset}`);
    log(`${colors.bright}${colors.magenta}==================================${colors.reset}`);

    let totalPassed = 0;
    let totalFailed = 0;

    Object.keys(this.results).forEach(category => {
      const result = this.results[category];
      totalPassed += result.passed;
      totalFailed += result.failed;

      log(`\n${colors.bright}${colors.cyan}${category.toUpperCase()} Tests:${colors.reset}`);
      log(`${colors.green}  Passed: ${result.passed}${colors.reset}`);
      log(`${colors.red}  Failed: ${result.failed}${colors.reset}`);

      if (result.tests.length > 0) {
        result.tests.forEach(test => {
          const statusColor = test.status === 'PASSED' ? colors.green : colors.red;
          const statusIcon = test.status === 'PASSED' ? '✓' : '✗';
          log(`  ${statusColor}${statusIcon} ${test.name}${colors.reset}`);
          if (test.error) {
            log(`    ${colors.red}Error: ${test.error}${colors.reset}`);
          }
        });
      }
    });

    log(`\n${colors.bright}${colors.magenta}Overall Results:${colors.reset}`);
    log(`${colors.green}Total Passed: ${totalPassed}${colors.reset}`);
    log(`${colors.red}Total Failed: ${totalFailed}${colors.reset}`);

    const successRate = totalPassed / (totalPassed + totalFailed) * 100;
    log(`${colors.cyan}Success Rate: ${successRate.toFixed(1)}%${colors.reset}`);

    if (totalFailed === 0) {
      log(`\n${colors.bright}${colors.green}🎉 All verifications passed! Your vendor location and product management system is ready for deployment.${colors.reset}`);
      
      log(`\n${colors.bright}${colors.cyan}Next Steps:${colors.reset}`);
      log(`${colors.cyan}1. Run the test suite: npm test${colors.reset}`);
      log(`${colors.cyan}2. Start the development servers: npm run dev (frontend) and npm start (backend)${colors.reset}`);
      log(`${colors.cyan}3. Test the complete workflow manually${colors.reset}`);
      log(`${colors.cyan}4. Deploy to staging environment${colors.reset}`);
      
    } else {
      log(`\n${colors.bright}${colors.red}❌ Some verifications failed. Please address the issues before deployment.${colors.reset}`);
      process.exit(1);
    }

    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalPassed,
        totalFailed,
        successRate: successRate.toFixed(1)
      }
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'integration-verification-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    log(`\n${colors.cyan}📄 Detailed report saved to: integration-verification-report.json${colors.reset}`);
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new IntegrationVerifier();
  verifier.runAllVerifications().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationVerifier;