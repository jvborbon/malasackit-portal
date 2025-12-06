// Simple rate limiting test
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRateLimit() {
    console.log('🚀 Starting Rate Limiting Test...\n');
    
    try {
        // Test 1: Normal requests should work
        console.log('📋 Test 1: Normal API requests');
        const response1 = await axios.get(`${BASE_URL}/`, { 
            timeout: 5000,
            validateStatus: () => true 
        });
        console.log(`✅ Normal request: ${response1.status} ${response1.statusText}`);
        
        // Test 2: Multiple rapid requests to trigger rate limiting
        console.log('\n📋 Test 2: Rapid requests (testing rate limits)');
        const rapidRequests = [];
        
        // Send 50 rapid requests to trigger rate limiting
        for (let i = 0; i < 50; i++) {
            rapidRequests.push(
                axios.get(`${BASE_URL}/`, { 
                    timeout: 5000,
                    validateStatus: () => true 
                })
            );
        }
        
        const results = await Promise.all(rapidRequests);
        
        const successCount = results.filter(r => r.status === 200).length;
        const rateLimitedCount = results.filter(r => r.status === 429).length;
        
        console.log(`✅ Successful requests: ${successCount}`);
        console.log(`⛔ Rate limited requests: ${rateLimitedCount}`);
        
        if (rateLimitedCount > 0) {
            console.log('🎉 Rate limiting is working correctly!');
            console.log(`📊 Rate limit headers from last request:`);
            const lastResponse = results[results.length - 1];
            if (lastResponse.headers) {
                console.log(`   X-RateLimit-Limit: ${lastResponse.headers['x-ratelimit-limit'] || 'Not set'}`);
                console.log(`   X-RateLimit-Remaining: ${lastResponse.headers['x-ratelimit-remaining'] || 'Not set'}`);
                console.log(`   X-RateLimit-Reset: ${lastResponse.headers['x-ratelimit-reset'] || 'Not set'}`);
            }
        } else {
            console.log('⚠️  No rate limiting detected. This might be normal for health endpoints.');
        }
        
        // Test 3: Test login rate limiting
        console.log('\n📋 Test 3: Login endpoint rate limiting');
        try {
            const loginRequests = [];
            for (let i = 0; i < 15; i++) {
                loginRequests.push(
                    axios.post(`${BASE_URL}/api/auth/login`, 
                        { email: 'test@example.com', password: 'wrongpassword' },
                        { timeout: 5000, validateStatus: () => true }
                    )
                );
            }
            
            const loginResults = await Promise.all(loginRequests);
            const loginSuccess = loginResults.filter(r => r.status === 401).length; // Expected auth failure
            const loginRateLimited = loginResults.filter(r => r.status === 429).length;
            
            console.log(`✅ Login attempts (auth failed): ${loginSuccess}`);
            console.log(`⛔ Rate limited login attempts: ${loginRateLimited}`);
            
        } catch (loginError) {
            console.log(`⚠️  Login test error: ${loginError.message}`);
        }
        
        console.log('\n🏁 Rate limiting test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Server might not be running. Try starting it with: npm run dev');
        }
    }
}

testRateLimit();