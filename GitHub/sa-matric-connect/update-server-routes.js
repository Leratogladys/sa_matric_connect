const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server', 'server.js');
let content = fs.readFileSync(serverJsPath, 'utf8');

console.log('Updating server.js with API endpoints...');

// Check if we need to import the API endpoints
// For now, we'll add them directly

// Find where other routes are defined (look for app.get or app.post)
const apiRoutes = `

// ==================== API ENDPOINTS ====================
// User authentication endpoints
app.get('/api/me', (req, res) => {
    try {
        // Check for authentication token
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
        
        console.log('í´ /api/me called. Token present:', !!token);
        
        if (!token) {
            return res.status(401).json({ 
                authenticated: false, 
                error: 'Not authenticated' 
            });
        }
        
        // TODO: Verify JWT token if using JWT
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // For now, return mock user data
        // Replace this with actual database lookup
        const userData = {
            authenticated: true,
            id: 1,
            name: "Test User",
            email: "test@example.com",
            matricNumber: "2024/001",
            province: "Gauteng",
            school: "Example High School",
            role: "student",
            createdAt: new Date().toISOString()
        };
        
        console.log('âœ… Returning user data for:', userData.email);
        res.json(userData);
        
    } catch (error) {
        console.error('âŒ Error in /api/me:', error.message);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(401).json({ 
                authenticated: false, 
                error: 'Invalid or expired token' 
            });
        } else {
            res.status(500).json({ 
                authenticated: false, 
                error: 'Internal server error' 
            });
        }
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    try {
        console.log('í´ /api/logout called');
        
        // Clear all authentication cookies
        const cookiesToClear = ['token', 'sessionId', 'userData', 'auth_token'];
        cookiesToClear.forEach(cookieName => {
            res.clearCookie(cookieName, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        });
        
        console.log('âœ… Cookies cleared, logout successful');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
        
    } catch (error) {
        console.error('âŒ Error in /api/logout:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Logout failed' 
        });
    }
});

// Simple authentication check
app.get('/api/auth/check', (req, res) => {
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    res.json({
        authenticated: !!token,
        timestamp: new Date().toISOString(),
        method: req.method
    });
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
    // Mock dashboard data - replace with database data
    const dashboardData = {
        totalApplications: 8,
        activeApplications: 5,
        completedApplications: 3,
        bursaryApplications: 2,
        progressPercentage: 37.5,
        recentActivity: [
            { id: 1, action: 'University of Pretoria Application', date: '2024-01-15', status: 'pending' },
            { id: 2, action: 'Wits University Application', date: '2024-01-14', status: 'submitted' },
            { id: 3, action: 'NSFAS Bursary', date: '2024-01-13', status: 'in-review' }
        ],
        upcomingDeadlines: [
            { id: 1, name: 'University Applications', date: '2024-02-01', daysLeft: 17 },
            { id: 2, name: 'Bursary Submissions', date: '2024-01-31', daysLeft: 16 },
            { id: 3, name: 'Document Verification', date: '2024-02-15', daysLeft: 31 }
        ]
    };
    
    res.json(dashboardData);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'SA-MATRIC-CONNECT API',
        version: '1.0.0'
    });
});

// Test endpoint for frontend debugging
app.get('/api/test/auth', (req, res) => {
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;
    
    res.json({
        headers: {
            authorization: authHeader || 'Not provided'
        },
        cookies: cookies,
        hasToken: !!(cookies.token || authHeader),
        timestamp: new Date().toISOString()
    });
});
`;

// Find a good place to insert the routes (usually before catch-all route)
// Look for the catch-all route that sends index.html
const catchAllRouteIndex = content.indexOf('app.get(\'*\'');

if (catchAllRouteIndex !== -1) {
    // Insert API routes before the catch-all route
    const beforeCatchAll = content.substring(0, catchAllRouteIndex);
    const afterCatchAll = content.substring(catchAllRouteIndex);
    
    content = beforeCatchAll + apiRoutes + '\n' + afterCatchAll;
    console.log('âœ“ Added API routes before catch-all route');
} else {
    // If no catch-all route found, add at the end before app.listen
    const appListenIndex = content.lastIndexOf('app.listen');
    
    if (appListenIndex !== -1) {
        const beforeListen = content.substring(0, appListenIndex);
        const afterListen = content.substring(appListenIndex);
        
        content = beforeListen + apiRoutes + '\n' + afterListen;
        console.log('âœ“ Added API routes before app.listen');
    } else {
        // Just append at the end
        content = content + '\n' + apiRoutes;
        console.log('âœ“ Appended API routes at the end');
    }
}

// Write the updated content
fs.writeFileSync(serverJsPath, content);
console.log('âœ… server.js updated successfully!');
