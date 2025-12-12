// Authentication middleware for JWT verification
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Try to get token from cookies first
    const token = req.cookies.token;
    
    if (!token) {
        // Try Authorization header as fallback
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        return res.status(401).json({ 
            authenticated: false, 
            error: 'Access token required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                authenticated: false, 
                error: 'Token expired' 
            });
        }
        
        return res.status(403).json({ 
            authenticated: false, 
            error: 'Invalid token' 
        });
    }
};

module.exports = { authenticateToken };
