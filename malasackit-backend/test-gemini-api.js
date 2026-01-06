import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Test 1: List available models
async function listModels() {
    try {
        console.log('\n=== Test 1: Listing Available Models (v1beta) ===');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Failed to list models:', response.status, error);
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Available models:');
        data.models?.forEach(model => {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`  - ${model.name} (supports generateContent)`);
            }
        });
        
        return data.models;
    } catch (error) {
        console.error('❌ Error listing models:', error.message);
        return null;
    }
}

// Test 2: Try generating content with a working model
async function testGeneration(modelName) {
    try {
        console.log(`\n=== Test 2: Testing ${modelName} ===`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Say hello in one word' }] }]
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Failed with ${modelName}:`, response.status, error);
            return false;
        }
        
        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`✅ Success with ${modelName}:`, result);
        return true;
    } catch (error) {
        console.error(`❌ Error with ${modelName}:`, error.message);
        return false;
    }
}

// Run tests
(async () => {
    const models = await listModels();
    
    if (models) {
        // Try the first available model that supports generateContent
        const workingModel = models.find(m => 
            m.supportedGenerationMethods?.includes('generateContent')
        );
        
        if (workingModel) {
            const modelName = workingModel.name.replace('models/', '');
            await testGeneration(modelName);
        }
    }
    
    process.exit(0);
})();
