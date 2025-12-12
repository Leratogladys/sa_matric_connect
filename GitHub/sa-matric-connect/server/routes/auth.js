const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }
        
        // Find user in database
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        const user = userResult.rows[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Return user data (without password)
        const userData = {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                matricNumber: user.matric_number,
                province: user.province,
                school: user.school,
                createdAt: user.created_at
            }
        };
        
        res.json(userData);
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, matricNumber, province, school } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, and password are required' 
            });
        }
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'User with this email already exists' 
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, matric_number, province, school)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, matric_number, province, school, created_at`,
            [name, email.toLowerCase(), hashedPassword, matricNumber || null, province || null, school || null]
        );
        
        const newUser = result.rows[0];
        
        // Create JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email,
                name: newUser.name
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                matricNumber: newUser.matric_number,
                province: newUser.province,
                school: newUser.school,
                createdAt: newUser.created_at
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                authenticated: false, 
                error: 'Not authenticated' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get fresh user data from database
        const userResult = await pool.query(
            'SELECT id, name, email, matric_number, province, school, created_at FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                authenticated: false, 
                error: 'User not found' 
            });
        }
        
        const user = userResult.rows[0];
        
        res.json({
            authenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                matricNumber: user.matric_number,
                province: user.province,
                school: user.school,
                createdAt: user.created_at
            }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.clearCookie('token');
            return res.status(401).json({ 
                authenticated: false, 
                error: 'Invalid or expired token' 
            });
        }
        
        res.status(500).json({ 
            authenticated: false, 
            error: 'Internal server error' 
        });
    }
});

module.exports = router;
