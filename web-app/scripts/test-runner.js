#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runCommand(command, description) {
  log(`\n${colors.bright}${colors.blue}Running: ${description}${colors.reset}`);
  log(`${colors.cyan}Command: ${command}${colors.reset}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`${colors.green}✓ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkTestFiles() {
  const testDirs = [
    'src/__tests__',
    'src/components/__tests__',
    'src/hooks/__tests__',
    'src/__tests__/integration',
    'src/__tests__/e2e',
    'src/__tests__/performance'
  ];

  let totalTests = 0;
  
  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath, { recursive: true })
        .filter(file => file.endsWith('.test.ts') || file.endsWith('.test.tsx'));
      
      if (files.length > 0) {
        log(`${colors.cyan}Found ${files.length} test files in ${dir}:${colors.reset}`);
        files.forEach(file => {
          log(`  - ${file}`);
        });
        totalTests += files.length;
      }
    }
  });

  log(`${colors.bright}${colors.green}Total test files found: ${totalTests}${colors.reset}`);
  return totalTests > 0;
}

function generateTestReport() {
  const reportPath = path.join(process.cwd(), 'test-results');
  
  if (fs.existsSync(reportPath)) {
    log(`${colors.bright}${colors.magenta}Test Results Summary:${colors.reset}`);
    
    // Check for coverage report
    const coveragePath = path.join(reportPath, 'coverage');
    if (fs.existsSync(coveragePath)) {
      log(`${colors.green}✓ Coverage report generated at: ${coveragePath}${colors.reset}`);
    }
    
    // Check for test results
    const resultsPath = path.join(reportPath, 'junit.xml');
    if (fs.existsSync(resultsPath)) {
      log(`${colors.green}✓ Test results saved at: ${resultsPath}${colors.reset}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  log(`${colors.bright}${colors.magenta}🧪 Annadata Test Runner${colors.reset}`);
  log(`${colors.bright}${colors.magenta}========================${colors.reset}`);

  // Check if test files exist
  if (!checkTestFiles()) {
    log(`${colors.yellow}⚠ No test files found. Please create test files first.${colors.reset}`);
    process.exit(1);
  }

  let success = true;

  switch (testType) {
    case 'unit':
      log(`${colors.bright}${colors.blue}Running Unit Tests...${colors.reset}`);
      success = runCommand('npm run test:unit', 'Unit Tests');
      break;

    case 'integration':
      log(`${colors.bright}${colors.blue}Running Integration Tests...${colors.reset}`);
      success = runCommand('jest --testPathPattern=integration', 'Integration Tests');
      break;

    case 'e2e':
      log(`${colors.bright}${colors.blue}Running End-to-End Tests...${colors.reset}`);
      success = runCommand('npm run test:e2e', 'End-to-End Tests');
      break;

    case 'performance':
      log(`${colors.bright}${colors.blue}Running Performance Tests...${colors.reset}`);
      success = runCommand('npm run test:performance', 'Performance Tests');
      break;

    case 'coverage':
      log(`${colors.bright}${colors.blue}Running Tests with Coverage...${colors.reset}`);
      success = runCommand('npm run test:coverage', 'Coverage Tests');
      break;

    case 'watch':
      log(`${colors.bright}${colors.blue}Running Tests in Watch Mode...${colors.reset}`);
      success = runCommand('npm run test:watch', 'Watch Mode Tests');
      break;

    case 'all':
    default:
      log(`${colors.bright}${colors.blue}Running All Tests...${colors.reset}`);
      
      // Run unit tests
      if (!runCommand('npm run test:unit', 'Unit Tests')) {
        success = false;
      }
      
      // Run integration tests
      if (!runCommand('jest --testPathPattern=integration', 'Integration Tests')) {
        success = false;
      }
      
      // Run e2e tests
      if (!runCommand('npm run test:e2e', 'End-to-End Tests')) {
        success = false;
      }
      
      // Run performance tests
      if (!runCommand('npm run test:performance', 'Performance Tests')) {
        success = false;
      }
      
      // Generate coverage report
      if (success) {
        runCommand('npm run test:coverage', 'Coverage Report');
      }
      break;
  }

  // Generate test report
  generateTestReport();

  // Final summary
  log(`\n${colors.bright}${colors.magenta}Test Summary:${colors.reset}`);
  if (success) {
    log(`${colors.bright}${colors.green}✅ All tests completed successfully!${colors.reset}`);
    log(`${colors.green}Your vendor location and product management features are ready for deployment.${colors.reset}`);
  } else {
    log(`${colors.bright}${colors.red}❌ Some tests failed.${colors.reset}`);
    log(`${colors.red}Please review the test output and fix any issues before deployment.${colors.reset}`);
    process.exit(1);
  }

  // Usage instructions
  log(`\n${colors.bright}${colors.cyan}Usage Instructions:${colors.reset}`);
  log(`${colors.cyan}• Run specific test types: node scripts/test-runner.js [unit|integration|e2e|performance|coverage|watch]${colors.reset}`);
  log(`${colors.cyan}• Run all tests: node scripts/test-runner.js all${colors.reset}`);
  log(`${colors.cyan}• Watch mode: node scripts/test-runner.js watch${colors.reset}`);
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkTestFiles, generateTestReport };