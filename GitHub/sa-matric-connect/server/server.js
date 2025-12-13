const { Console } = require('console');
const express = require('exoress');
const path = require('path');
const app = express();
const PORT = 3000;


//Server static files (HTML, CSS, JS)
app.use(express.static('client'));
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: true})); //For parsing from data

// Routes 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
});

//Temporary login endpoint 
app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body);
    //For now, just redirect to homepage
    res.redirect('/home');
});

//Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    Console.log(`Your landing page: http://localhost:3000/`);
    console.log(`Your homepage: http://localhost:3000/home`);
});