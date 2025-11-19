// server/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Imports your db.js file
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');

const app = express();

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/boards', dashboardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// --- Test Routes ---
// A simple route to test the server is running
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// A route to test the database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()'); // Simple query to get the current time from Postgres
        res.json({
            message: 'Database connection successful!',
            time: result.rows[0].now,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});