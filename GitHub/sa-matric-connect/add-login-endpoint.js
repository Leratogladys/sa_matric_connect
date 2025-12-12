const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server', 'server.js');
let content = fs.readFileSync(serverJsPath, 'utf8');

// Simple login endpoint
const loginEndpoint = `

// ==================== LOGIN ENDPOINT ====================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('í´ Login attempt for:', email);
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }
        
        // TODO: Replace with actual database check
        // For now, accept any email/password for testing
        const isValid = true; // Change this to actual validation
        
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Create a simple token (in production, use JWT)
        const token = 'test-token-' + Date.now();
        
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Return user data
        const userData = {
            success: true,
            message: 'Login successful',
            user: {
                id: 1,
                name: "Test User",
                email: email,
                role: "student",
                matricNumber: "2024/001"
            }
        };
        
        console.log('âœ… Login successful for:', email);
        res.json(userData);
        
    } catch (error) {
        console.error('âŒ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed' 
        });
    }
});
`;

// Find where to insert (after other API endpoints)
const apiMeIndex = content.indexOf("app.get('/api/me'");

if (apiMeIndex !== -1) {
    // Insert after the /api/me endpoint
    const before = content.substring(0, apiMeIndex);
    const after = content.substring(apiMeIndex);
    
    // Find the end of the /api/me endpoint
    const endOfEndpoint = after.indexOf('});') + 3;
    
    if (endOfEndpoint > 3) {
        const newContent = before + 
                          after.substring(0, endOfEndpoint) + 
                          '\n' + loginEndpoint + 
                          after.substring(endOfEndpoint);
        
        fs.writeFileSync(serverJsPath, newContent);
        console.log('âœ… Added login endpoint to server.js');
    } else {
        console.log('âš  Could not find end of /api/me endpoint');
    }
} else {
    console.log('âš  /api/me endpoint not found, login endpoint not added');
}
