const getUserInfo = (req, res) => {
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
        
        console.log('í´ /api/me called. Token present:', !!token);
        console.log('Cookies:', req.cookies);
        
        if (!token) {
            console.log('âŒ No token found, returning 401');
            return res.status(401).json({ 
                authenticated: false, 
                error: 'Not authenticated. No token found.' 
            });
        }
        
        // If you're using JWT, verify it
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // For now, return mock user data
        // TODO: Replace with actual database lookup
        const userData = {
            authenticated: true,
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "student",
            createdAt: new Date().toISOString(),
            // Add more user data as needed
        };
        
        console.log('âœ… Returning user data:', userData);
        res.json(userData);
        
    } catch (error) {
        console.error('âŒ Error in /api/me:', error);
        
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
};

const logoutUser = (req, res) => {
    try {
        console.log('í´ /api/logout called');
        
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        // Also clear any other auth cookies you might have
        res.clearCookie('sessionId');
        res.clearCookie('userData');
        
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
};
const authCheck = (req, res) => {
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    
    res.json({
        authenticated: !!token,
        timestamp: new Date().toISOString(),
        method: req.method
    });
};
const getDashboardData = (req, res) => {
    // This would come from your database
    const dashboardData = {
        totalApplications: 8,
        activeApplications: 5,
        completedApplications: 3,
        bursaryApplications: 2,
        recentActivity: [
            { id: 1, action: 'Application submitted', date: '2024-01-15', status: 'pending' },
            { id: 2, action: 'Document uploaded', date: '2024-01-14', status: 'completed' },
            { id: 3, action: 'Bursary applied', date: '2024-01-13', status: 'in-review' }
        ],
        upcomingDeadlines: [
            { id: 1, name: 'University Application', date: '2024-02-01' },
            { id: 2, name: 'Bursary Submission', date: '2024-01-31' }
        ]
    };
    
    res.json(dashboardData);
};

module.exports = {
    getUserInfo,
    logoutUser,
    authCheck,
    getDashboardData
};
