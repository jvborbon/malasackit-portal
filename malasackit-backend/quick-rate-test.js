// Focused rate limiting test
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
    console.log('🔥 Quick Rate Limiting Test\n');
    
    try {
        console.log('📋 Sending 20 rapid requests...');
        const startTime = Date.now();
        
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(
                axios.get(BASE_URL, { 
                    timeout: 10000,
                    validateStatus: () => true 
                }).then(response => ({
                    index: i,
                    status: response.status,
                    statusText: response.statusText,
                    rateLimit: response.headers['x-ratelimit-remaining'],
                    time: Date.now() - startTime
                })).catch(error => ({
                    index: i,
                    status: 'ERROR',
                    error: error.code || error.message,
                    time: Date.now() - startTime
                }))
            );
        }
        
        // Wait for first 5 requests only to see initial pattern
        const first5 = await Promise.all(promises.slice(0, 5));
        console.log('\n📊 First 5 requests:');
        first5.forEach(result => {
            console.log(`Request ${result.index + 1}: ${result.status} (${result.time}ms) - Remaining: ${result.rateLimit || 'N/A'}`);
        });
        
        // Check if we're getting rate limited or slowed down
        if (first5.some(r => r.time > 2000)) {
            console.log('\n🎉 SUCCESS: Rate limiting is working! Requests are being slowed down.');
        } else if (first5.some(r => r.status === 429)) {
            console.log('\n🎉 SUCCESS: Rate limiting is working! Getting 429 responses.');
        } else {
            console.log('\n⚠️  Rate limiting may not be active or limits are very high.');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

quickTest();