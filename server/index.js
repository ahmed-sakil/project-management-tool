/**
 * Main Express Server Entry Point
 * Sets up middleware, connects routes, and starts the server.
 */

// Load environment variables from .env file (e.g., DB connection, PORT)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import Route Handlers
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express App
const app = express();

// --- Middleware Configuration ---
// Enable Cross-Origin Resource Sharing (CORS) for frontend communication
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// --- Route Mounting ---
// Mount authentication routes (Login, Register, etc.) at /api/auth
app.use('/api/auth', authRoutes);
// Mount board management routes at /api/boards
app.use('/api/boards', boardRoutes);
// Mount list management routes at /api/lists
app.use('/api/lists', listRoutes);
// Mount card management routes at /api/cards
app.use('/api/cards', cardRoutes);
// Mount user profile routes at /api/dashboard
app.use('/api/dashboard', dashboardRoutes);

// --- Health Check / Test Routes ---

/**
 * @route   GET /
 * @desc    Basic health check to verify server is running
 */
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

/**
 * @route   GET /api/test-db
 * @desc    Verify database connection is active
 */
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()'); // Simple timestamp query
        res.json({
            message: 'Database connection successful!',
            time: result.rows[0].now,
        });
    } catch (err) {
        console.error("Database Test Failed:", err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});