const bcrypt = require('bcrypt');
const pool = require('./database.js');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const PORT = 3000;


// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'sa-matric-connect-super-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Middleware
app.use(express.static(path.join(process.cwd(), '..', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== AUTHENTICATION MIDDLEWARE ==========

// For HTML page protection (redirects to login)
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

   if (!token) {
        return res.redirect('/');  // Redirect to login page
    }

   
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie('token');
            return res.redirect('/');
        }
        req.user = user;
        next();
    });
}

// For API protection (returns JSON errors)
function authenticateTokenAPI(req, res, next) {
    const token = req.cookies.token;

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

// 1. Landing/Login page
app.get('/', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect('/home');
    }
    res.sendFile(path.join(process.cwd(), '..', 'public', 'index.html'));
});

// 2. PROTECTED Home page
app.get('/home', authenticateToken, (req, res) => {
    res.sendFile(path.join(process.cwd(), '..', 'public', 'homepage.html'));
    
});

// ========== API ENDPOINTS ==========

// Test API endpoint
app.get('/api/test', (req, res) => {
    console.log('API test route hit');
    res.json({ message: 'API is working!' });
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    console.log('=== /api/login START ===');
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user 
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        console.log('User query result:', user.rows.length > 0 ? 'Found' : 'Not found');

        if (user.rows.length === 0) {
            console.log('User not found:', email);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            console.log('Invalid password for:', email);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign(
            { 
                userId: user.rows[0].id,
                email: user.rows[0].email
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        console.log('Token created (first 20 chars):', token.substring(0, 20) + '...');

        // Set token as HTTP-only cookie
        console.log('Setting cookie...');
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        console.log('Cookie set!');

        // Successful login
        console.log('Sending response...');
        res.json({
            message: 'Login successful',
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                firstName: user.rows[0].first_name,
                lastName: user.rows[0].last_name
            },
            redirect: '/home'
        });
        console.log('=== /api/login END ===');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ 
        message: 'Logged out successfully',
        redirect: '/'
    });
});

// Get current user info (protected route)
app.get('/api/me', authenticateTokenAPI, async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                firstName: user.rows[0].first_name,
                lastName: user.rows[0].last_name,
                createdAt: user.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        console.log('Registration attempt:', { email, firstName, lastName });
        
        // Basic validation
        if (!email || !password || !firstName || !lastName) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1', 
            [email]
        );

        if (userExists.rows.length > 0) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, passwordHash, firstName, lastName]
        );

        console.log('User created successfully:', newUser.rows[0]);
        
        res.status(201).json({
            message: 'User created successfully',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// Example protected API route (for testing)
app.get('/api/protected', authenticateTokenAPI, (req, res) => {
    res.json({ 
        message: 'This is protected data!',
        user: req.user 
    });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Current directory:', process.cwd());
    console.log('Public folder:', path.join(process.cwd(), '..', 'public'));
    console.log('Your landing page: http://localhost:3000/');
    console.log('Your homepage: http://localhost:3000/home');
    console.log('API test endpoint: http://localhost:3000/api/test');
    console.log('Login API: http://localhost:3000/api/login');
    console.log('Logout API: http://localhost:3000/api/logout');
});