const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database connection
const { pool } = require('./database');

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('‚ùå Database connection error:', err.message);
    } else {
        console.log('‚úÖ Connected to PostgreSQL database');
        release();
    }
});

// Serve static files from client/public
const publicPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(publicPath));
console.log('Ì≥Ç Serving static files from:', publicPath);

// API Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Additional API endpoints can be added here
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'SA-MATRIC-CONNECT API',
        timestamp: new Date().toISOString()
    });
});

// Protected route example
app.get('/api/protected', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ message: 'This is protected data', timestamp: new Date().toISOString() });
});

// Catch-all route for frontend routing (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Ì∫® Server error:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Ì∫Ä Server running on http://localhost:${PORT}`);
    console.log(`Ì≥ä API available at http://localhost:${PORT}/api`);
    console.log(`Ì¥ê Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`Ìø† Dashboard endpoints: http://localhost:${PORT}/api/dashboard`);
});

module.exports = app;
