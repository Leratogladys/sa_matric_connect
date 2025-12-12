const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = require('./database');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'sa-matric-connect-super-secret-key-2024';

// ========== MIDDLEWARE ==========
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== STATIC FILES ==========
const publicPath = path.join(__dirname,'..', 'client', 'public');
app.use(express.static(publicPath));

console.log('📂 Serving static files from:', publicPath);

// ========== REQUEST LOGGER ==========
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ========== AUTHENTICATION MIDDLEWARE ==========
function authenticateToken(req, res, next) {
    const token = req.cookies?.sa_matric_token;

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie('sa_matric_token');
            return res.redirect('/');
        }
        req.user = user;
        next();
    });
}

function authenticateTokenAPI(req, res, next) {
    const token = req.cookies?.sa_matric_token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(400).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}

// ========== ROUTES ==========

// 1. Root route - serve index.html
app.get('/', (req, res) => {
    const token = req.cookies?.sa_matric_token;
    
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect('/home');
        } catch (error) {
            res.clearCookie('sa_matric_token');
        }
    }
    
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 2. Home route - protected
app.get('/home', authenticateToken, (req, res) => {
    res.sendFile(path.join(publicPath, 'homepage.html'));
});

// ========== API ENDPOINTS ==========

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!', 
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Login endpoint - FIXED for your database
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user - using correct columns
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email]
        );

        if (userResult.rows.length === 0) {
            console.log('User not found:', email);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        console.log('Found user:', { 
            id: user.id, 
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name 
        });

        // Check password - FIX for existing plain text password
        let validPassword = false;
        
        // Try bcrypt compare first
        try {
            validPassword = await bcrypt.compare(password, user.password_hash);
        } catch (bcryptError) {
            // If bcrypt fails, check if password is plain text (for existing test user)
            if (user.password_hash === password) {
                console.log('Plain text password match for existing user');
                validPassword = true;
                
                // Update to bcrypt hash for future logins
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query(
                    'UPDATE users SET password_hash = $1 WHERE id = $2',
                    [hashedPassword, user.id]
                );
                console.log('Updated password to bcrypt hash');
            }
        }

        if (!validPassword) {
            console.log('Invalid password for:', email);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('sa_matric_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Create display name
        const displayName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.last_name || 'User';

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: displayName,
                firstName: user.first_name,
                lastName: user.last_name
            },
            redirect: '/home'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    res.clearCookie('sa_matric_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user info - FIXED for your database
app.get('/api/me', authenticateTokenAPI, async (req, res) => {
    try {
        const userResult = await pool.query(
            'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });


// ==================== LOGIN ENDPOINT ====================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('��� Login attempt for:', email);
        
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
        
        console.log('✅ Login successful for:', email);
        res.json(userData);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed' 
        });
    }
});

        }

        const user = userResult.rows[0];
        
        // Create display name
        const displayName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.last_name || 'User';

        res.json({
            id: user.id,
            email: user.email,
            name: displayName,
            firstName: user.first_name,
            lastName: user.last_name,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Test setup endpoint - FIXED for your database
app.post('/api/test/setup', async (req, res) => {
    try {
        // Create properly hashed password
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (email) DO UPDATE 
             SET password_hash = EXCLUDED.password_hash,
                 first_name = EXCLUDED.first_name,
                 last_name = EXCLUDED.last_name
             RETURNING id, email, first_name, last_name`, 
            ['test@example.com', hashedPassword, 'Test', 'User']
        );

        res.json({
            success: true,
            message: 'Test user ready (password updated if existed)',
            credentials: {
                email: 'test@example.com',
                password: 'password123'
            },
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Test setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Protected test endpoint
app.get('/api/protected', authenticateTokenAPI, (req, res) => {
    res.json({ 
        message: 'This is protected data!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - SA Matric Connect</title>
                <style>
                    body { 
                        font-family: 'DM Sans', sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: linear-gradient(135deg, #2E8B57, #003366);
                        color: white;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    h1 { font-size: 48px; margin-bottom: 20px; }
                    p { font-size: 18px; margin-bottom: 30px; max-width: 600px; }
                    a { 
                        color: #FFD700; 
                        text-decoration: none;
                        font-weight: bold;
                        padding: 12px 24px;
                        border: 2px solid #FFD700;
                        border-radius: 8px;
                        transition: all 0.3s;
                    }
                    a:hover {
                        background-color: #FFD700;
                        color: #003366;
                    }
                </style>
            </head>
            <body>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist on SA Matric Connect.</p>
                <p><a href="/">Go to Login Page</a></p>
            </body>
            </html>
        `);
    } else if (req.accepts('json')) {
        res.status(404).json({ error: 'Not found' });
    } else {
        res.status(404).type('txt').send('Not found');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========== START SERVER ==========


// ==================== API ENDPOINTS ====================
// User authentication endpoints
app.get('/api/me', (req, res) => {
    try {
        // Check for authentication token
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
        
        console.log('��� /api/me called. Token present:', !!token);
        
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
        
        console.log('✅ Returning user data for:', userData.email);
        res.json(userData);
        
    } catch (error) {
        console.error('❌ Error in /api/me:', error.message);
        
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
        console.log('��� /api/logout called');
        
        // Clear all authentication cookies
        const cookiesToClear = ['token', 'sessionId', 'userData', 'auth_token'];
        cookiesToClear.forEach(cookieName => {
            res.clearCookie(cookieName, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        });
        
        console.log('✅ Cookies cleared, logout successful');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
        
    } catch (error) {
        console.error('❌ Error in /api/logout:', error);
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

app.listen(PORT, () => {
    console.log(`\n🚀 SA Matric Connect Server Started!`);
    console.log('='.repeat(60));
    console.log(`📡 Server URL: http://localhost:${PORT}`);
    console.log(`📂 Static files: ${publicPath}`);
    console.log(`💾 Database: sa_matric_connect`);
    console.log('\n🔗 Quick Access:');
    console.log('   • Login: http://localhost:3000/');
    console.log('   • Home: http://localhost:3000/home (login required)');
    console.log('   • API Test: http://localhost:3000/api/test');
    console.log('   • Create/Update Test User: POST http://localhost:3000/api/test/setup');
    console.log('\n🔧 Test Credentials:');
    console.log('   • Email: test@example.com');
    console.log('   • Password: password123');
    console.log('='.repeat(60));
    console.log('💡 Press Ctrl+C to stop\n');
});