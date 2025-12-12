const fetch = require('node-fetch');
const { URL } = require('url');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
    try {
        const url = new URL(endpoint, BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        console.log(`\nÌ¥ç Testing ${method} ${endpoint}`);
        
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({ text: await response.text() }));
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
        
        return { success: response.ok, data };
        
    } catch (error) {
        console.log(`   ‚ùå Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('Ì∫Ä Starting API endpoint tests...');
    console.log('=' .repeat(50));
    
    // Test public endpoints first
    await testEndpoint('/api/health', 'GET');
    await testEndpoint('/api/auth/check', 'GET');
    
    // Test protected endpoints (will likely fail without auth)
    await testEndpoint('/api/me', 'GET');
    await testEndpoint('/api/dashboard', 'GET');
    
    // Test logout (POST request)
    await testEndpoint('/api/logout', 'POST');
    
    // Test debug endpoint
    await testEndpoint('/api/test/auth', 'GET');
    
    console.log('=' .repeat(50));
    console.log('‚úÖ Tests completed!');
    console.log('\nÌ≥ã Expected behavior:');
    console.log('   ‚Ä¢ /api/health should return status: ok');
    console.log('   ‚Ä¢ /api/auth/check should return authenticated: false');
    console.log('   ‚Ä¢ /api/me should return 401 (not authenticated)');
    console.log('   ‚Ä¢ /api/logout should still work (returns success)');
}

runTests().catch(console.error);
