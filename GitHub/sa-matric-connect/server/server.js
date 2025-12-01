const bcrypt = require('bcrypt');
const pool = require('./database.js');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

// JWT Configuration
const JWT_SECRET = 'sa-matric-connect-super-secret-key-2024'; // Change this in production!
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Middleware
app.use(express.static('public'));
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(cookieParser());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
});

// Temporary login endpoint (redirects to homepage)
app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body);
    res.redirect('/home');
});

// Debug route to check if API routes are working
app.get('/api/test', (req, res) => {
    console.log('API test route hit');
    res.json({ message: 'API is working!' });
});

// Get current user info (protected route)
app.get('/api/me', authenticateToken, async (req, res) => {
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

// User login endpoint with JWT
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
            }
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
    res.json({ message: 'Logged out successfully' });
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

// Example protected route (for testing)
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ 
        message: 'This is protected data!',
        user: req.user 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Your landing page: http://localhost:3000/');
    console.log('Your homepage: http://localhost:3000/home');
    console.log('API test endpoint: http://localhost:3000/api/test');
});