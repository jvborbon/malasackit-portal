/**
 * Test the safety thresholds API endpoint
 * Make sure your backend server is running first
 */

const testAPIEndpoint = async () => {
    try {
        console.log('🧪 Testing Safety Thresholds API Endpoint\n');
        
        // You'll need to replace this with a valid token from your system
        const token = 'your-jwt-token-here';
        
        const response = await fetch('http://localhost:5000/api/inventory/safety-thresholds', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ API Response:');
        console.log('Success:', data.success);
        console.log('Message:', data.message);
        console.log('\n📊 Sample Thresholds:');
        
        const sampleItems = ['Canned Goods', 'Rice (10kg)', 'Shorts', 'Face Masks', 'First Aid Kit'];
        sampleItems.forEach(item => {
            console.log(`  ${item}: ${data.data[item] || 'Not found'}`);
        });
        
        console.log(`\nTotal configured items: ${Object.keys(data.data).length}`);
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        console.log('\n💡 Make sure:');
        console.log('  1. Backend server is running');
        console.log('  2. You have a valid JWT token');
        console.log('  3. You have proper permissions');
    }
};

// Note: This is a template - you need to provide a valid token to test
console.log('📝 To test the API endpoint:');
console.log('  1. Start your backend server');
console.log('  2. Get a valid JWT token from login');  
console.log('  3. Replace "your-jwt-token-here" in this file');
console.log('  4. Run this test again');

// Uncomment the line below and add a valid token to run the test
// testAPIEndpoint();