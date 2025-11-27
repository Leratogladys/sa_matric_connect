const pool = require('./database.js');

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
});

// Temporary login endpoint (we'll add real authentication later)
app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body);
    // For now, just redirect to homepage
    res.redirect('/home');
});

//User registration endpoint


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Your landing page: http://localhost:3000/');
    console.log('Your homepage: http://localhost:3000/home');
});