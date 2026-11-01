
const express = require('express');

const app = express();

// Home route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Express server!');
});

// About route
app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'Gummadidala Hemanth Venkata Sai',
        section: 'CSE AIML-2B'
    });
});

// Time route
app.get('/time', (req, res) => {
    res.status(200).send(new Date().toString());
});

// 404 route
app.use((req, res) => {
    res.status(404).send('404 - Route not found');
});

// Start Express server
app.listen(3000, () => {
    console.log('Express server running on port 3000');
});
