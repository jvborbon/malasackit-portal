// Test the update donation request endpoint
import fetch from 'node-fetch';

const testUpdateEndpoint = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/donation-requests/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                delivery_method: 'pickup',
                notes: 'Test update',
                items: [
                    {
                        itemtype_id: 1,
                        quantity: 1,
                        declared_value: 100,
                        condition_donated: 'good',
                        description: 'Test item'
                    }
                ]
            })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
    } catch (error) {
        console.error('Error testing endpoint:', error);
    }
};

testUpdateEndpoint();