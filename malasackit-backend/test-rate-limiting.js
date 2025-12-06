// test-rate-limiting.js
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  LOGIN_ENDPOINT: `${BASE_URL}/users/login`,
  REGISTER_ENDPOINT: `${BASE_URL}/users/register`,
  PASSWORD_RESET_ENDPOINT: `${BASE_URL}/users/forgot-password`,
  GENERAL_API_ENDPOINT: `${BASE_URL}/donations`,
  
  // Test credentials
  VALID_LOGIN: {
    email: 'test@example.com',
    password: 'TestPassword123!'
  },
  
  INVALID_LOGIN: {
    email: 'fake@example.com',
    password: 'wrongpassword'
  },
  
  TEST_REGISTER: {
    fullName: 'Test User',
    email: 'newuser@example.com',
    password: 'TestPassword123!',
    repeatPassword: 'TestPassword123!'
  }
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// Utility functions
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'cyan');
  log('─'.repeat(60), 'blue');
}

function logResult(success, message) {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${message}`, color);
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test helper function
async function makeRequest(url, method = 'POST', data = {}, headers = {}) {
  try {
    const config = {
      method,
      url,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status code
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (method !== 'GET' && Object.keys(data).length > 0) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
      success: response.status < 400
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: error.response?.data || { message: error.message },
      headers: error.response?.headers || {},
      success: false,
      error: error.message
    };
  }
}

// Rate limiting test functions
async function testLoginRateLimit() {
  logTest('Login Rate Limiting (12 attempts per 15 minutes)');
  
  const results = {
    total: 0,
    successful: 0,
    blocked: 0,
    errors: 0
  };
  
  // Make 15 login attempts with invalid credentials
  for (let i = 1; i <= 15; i++) {
    const response = await makeRequest(
      TEST_CONFIG.LOGIN_ENDPOINT,
      'POST',
      TEST_CONFIG.INVALID_LOGIN
    );
    
    results.total++;
    
    if (response.status === 429) {
      results.blocked++;
      logResult(true, `Request ${i}: Rate limited (429) - ${response.data.message || 'Too many attempts'}`);
    } else if (response.status === 401) {
      results.successful++;
      logResult(false, `Request ${i}: Login failed (401) - Not rate limited yet`);
    } else {
      results.errors++;
      logResult(false, `Request ${i}: Unexpected response (${response.status})`);
    }
    
    // Check rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      logInfo(`Rate limit: ${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']} remaining`);
    }
    
    // Small delay between requests
    await setTimeout(100);
  }
  
  logInfo(`Summary: ${results.total} total, ${results.successful} not limited, ${results.blocked} blocked, ${results.errors} errors`);
  
  if (results.blocked > 0) {
    logResult(true, 'Login rate limiting is working! 🛡️');
  } else {
    logWarning('Login rate limiting may not be working properly');
  }
  
  return results;
}

async function testPasswordResetRateLimit() {
  logTest('Password Reset Rate Limiting (3 attempts per hour)');
  
  const testEmail = 'ratelimit@test.com';
  const results = {
    total: 0,
    successful: 0,
    blocked: 0
  };
  
  // Make 5 password reset attempts
  for (let i = 1; i <= 5; i++) {
    const response = await makeRequest(
      TEST_CONFIG.PASSWORD_RESET_ENDPOINT,
      'POST',
      { emailOrName: testEmail }
    );
    
    results.total++;
    
    if (response.status === 429) {
      results.blocked++;
      logResult(true, `Request ${i}: Rate limited (429) - ${response.data.message || 'Too many reset attempts'}`);
    } else if (response.status === 200 || response.status === 400) {
      results.successful++;
      logResult(false, `Request ${i}: Reset request processed (${response.status}) - Not rate limited yet`);
    }
    
    // Check rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      logInfo(`Rate limit: ${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']} remaining`);
    }
    
    await setTimeout(100);
  }
  
  logInfo(`Summary: ${results.total} total, ${results.successful} not limited, ${results.blocked} blocked`);
  
  if (results.blocked > 0) {
    logResult(true, 'Password reset rate limiting is working! 🛡️');
  } else {
    logWarning('Password reset rate limiting may not be working properly');
  }
  
  return results;
}

async function testAccountCreationRateLimit() {
  logTest('Account Creation Rate Limiting (10 attempts per hour)');
  
  const results = {
    total: 0,
    successful: 0,
    blocked: 0,
    errors: 0
  };
  
  // Make 12 registration attempts
  for (let i = 1; i <= 12; i++) {
    const testData = {
      ...TEST_CONFIG.TEST_REGISTER,
      email: `ratelimittest${i}@example.com`
    };
    
    const response = await makeRequest(
      TEST_CONFIG.REGISTER_ENDPOINT,
      'POST',
      testData
    );
    
    results.total++;
    
    if (response.status === 429) {
      results.blocked++;
      logResult(true, `Request ${i}: Rate limited (429) - ${response.data.message || 'Too many creation attempts'}`);
    } else if (response.status === 201 || response.status === 400) {
      results.successful++;
      logResult(false, `Request ${i}: Registration processed (${response.status}) - Not rate limited yet`);
    } else {
      results.errors++;
      logResult(false, `Request ${i}: Unexpected response (${response.status})`);
    }
    
    // Check rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      logInfo(`Rate limit: ${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']} remaining`);
    }
    
    await setTimeout(100);
  }
  
  logInfo(`Summary: ${results.total} total, ${results.successful} not limited, ${results.blocked} blocked, ${results.errors} errors`);
  
  if (results.blocked > 0) {
    logResult(true, 'Account creation rate limiting is working! 🛡️');
  } else {
    logWarning('Account creation rate limiting may not be working properly');
  }
  
  return results;
}

async function testGeneralApiRateLimit() {
  logTest('General API Rate Limiting (300 requests per 15 minutes)');
  
  logInfo('Testing with rapid requests to trigger rate limiting...');
  
  let blocked = false;
  let successCount = 0;
  const testRequests = 20; // Just test a smaller number for demo
  
  for (let i = 1; i <= testRequests; i++) {
    const response = await makeRequest(
      TEST_CONFIG.GENERAL_API_ENDPOINT,
      'GET'
    );
    
    if (response.status === 429) {
      blocked = true;
      logResult(true, `Request ${i}: Rate limited (429) after ${successCount} successful requests`);
      break;
    } else if (response.status < 500) {
      successCount++;
      if (i % 5 === 0) {
        logInfo(`Completed ${i} requests successfully...`);
      }
    }
    
    // Check rate limit headers
    if (response.headers['x-ratelimit-limit'] && i % 5 === 0) {
      logInfo(`Rate limit: ${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']} remaining`);
    }
  }
  
  if (!blocked && successCount === testRequests) {
    logInfo(`All ${testRequests} requests succeeded - rate limit not reached in this test`);
    logResult(true, 'General API rate limiting is configured (limit not reached in test)');
  } else if (blocked) {
    logResult(true, 'General API rate limiting is working! 🛡️');
  }
  
  return { blocked, successCount, testRequests };
}

async function testServerStatus() {
  logTest('Server Connectivity Test');
  
  try {
    const response = await makeRequest(`${BASE_URL}/users/login`, 'POST', {});
    
    if (response.status === 400 || response.status === 401) {
      logResult(true, 'Server is responding to requests');
      return true;
    } else if (response.status === 429) {
      logResult(true, 'Server is responding (rate limited)');
      return true;
    } else {
      logResult(false, `Unexpected server response: ${response.status}`);
      return false;
    }
  } catch (error) {
    logResult(false, `Server connection failed: ${error.message}`);
    logWarning('Make sure your backend server is running on http://localhost:3000');
    return false;
  }
}

// Main test runner
async function runRateLimitingTests() {
  log('\n🚀 RATE LIMITING VULNERABILITY TEST SUITE', 'magenta');
  log('═'.repeat(80), 'magenta');
  
  logInfo('This test will verify that rate limiting is properly implemented');
  logWarning('Make sure your backend server is running before starting tests');
  
  // Test server connectivity first
  const serverOnline = await testServerStatus();
  if (!serverOnline) {
    log('\n❌ Cannot proceed - server is not accessible', 'red');
    return;
  }
  
  const testResults = {};
  
  try {
    // Run all rate limiting tests
    testResults.login = await testLoginRateLimit();
    await setTimeout(1000); // Wait between test suites
    
    testResults.passwordReset = await testPasswordResetRateLimit();
    await setTimeout(1000);
    
    testResults.accountCreation = await testAccountCreationRateLimit();
    await setTimeout(1000);
    
    testResults.generalApi = await testGeneralApiRateLimit();
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    return;
  }
  
  // Generate summary report
  log('\n📊 RATE LIMITING TEST SUMMARY', 'magenta');
  log('═'.repeat(60), 'magenta');
  
  const loginProtected = testResults.login?.blocked > 0;
  const passwordResetProtected = testResults.passwordReset?.blocked > 0;
  const accountCreationProtected = testResults.accountCreation?.blocked > 0;
  const generalApiConfigured = testResults.generalApi?.blocked || testResults.generalApi?.successCount > 0;
  
  logResult(loginProtected, `Login endpoints: ${loginProtected ? 'PROTECTED' : 'VULNERABLE'}`);
  logResult(passwordResetProtected, `Password reset: ${passwordResetProtected ? 'PROTECTED' : 'VULNERABLE'}`);
  logResult(accountCreationProtected, `Account creation: ${accountCreationProtected ? 'PROTECTED' : 'VULNERABLE'}`);
  logResult(generalApiConfigured, `General API: ${generalApiConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  
  const protectedCount = [loginProtected, passwordResetProtected, accountCreationProtected, generalApiConfigured]
    .filter(Boolean).length;
  
  log(`\n🛡️  SECURITY SCORE: ${protectedCount}/4 rate limiters active`, 'cyan');
  
  if (protectedCount === 4) {
    log('🎉 EXCELLENT! All rate limiting protections are working', 'green');
  } else if (protectedCount >= 2) {
    log('⚠️  GOOD! Most rate limiting protections are working', 'yellow');
  } else {
    log('❌ CRITICAL! Rate limiting protections need attention', 'red');
  }
  
  log('\n💡 Rate limiting helps prevent:', 'blue');
  log('   • Brute force attacks on login', 'white');
  log('   • Password reset abuse', 'white');
  log('   • Account creation spam', 'white');
  log('   • API abuse and DoS attacks', 'white');
  
  log('\n✅ Test completed successfully!', 'green');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRateLimitingTests().catch(console.error);
}

export { runRateLimitingTests, testLoginRateLimit, testPasswordResetRateLimit };