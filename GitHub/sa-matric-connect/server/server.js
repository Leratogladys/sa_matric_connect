const bcrypt = require('bcrypt');
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

app.post('/api/login', async (req, res) => {
    try{
        const { email, password} = req.body;

        //Find user 
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',[email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });

            //checking password
            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

            if (!validPassword) {
                return res.status(400).json({ error: 'Invalid credentials' });

                //Successful login
                res.json({
                    message: 'Login successful',
                    user: {
                        id: user.rows[0].id,
                        email: user.rows[0].email,
                        firstName: user.rows[0].first_name,
                        lastName: user.rows[0].last_name
                    }
                });

            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Your landing page: http://localhost:3000/');
    console.log('Your homepage: http://localhost:3000/home');
});