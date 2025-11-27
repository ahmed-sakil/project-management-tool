const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const authorization = require('../middleware/authorization');
const validInfo = require("../middleware/validInfo");
const https = require('https'); // Native Node module for API calls

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 */
router.post("/register", validInfo, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exists");
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    const token = jwt.sign(
      { user_id: newUser.rows[0].id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST /auth/login
 * @desc    Login user
 */
router.post('/login', validInfo, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token validity AND check if user exists
 * @access  Private
 */
router.get('/verify', authorization, async (req, res) => {
  try {
    // 1. The middleware says the signature is valid and gives us req.user (the ID)
    
    // 2. BUT, let's double-check if this user actually exists in the DB
    const user = await db.query("SELECT id FROM users WHERE id = $1", [req.user]);
    
    // 3. If user is not found (because you cleared the DB), return false
    if (user.rows.length === 0) {
        return res.status(401).json(false);
    }

    // 4. User exists and token is valid
    res.json(true);

  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Send recovery email using Brevo API (HTTP) to bypass Render Port Blocks
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000;

    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, expires, email]
    );

    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientURL}/#/reset-password/${token}`;

    console.log("📧 Sending via Brevo API (HTTP)...");

    // --- BREVO API LOGIC (NO SMTP) ---
    const data = JSON.stringify({
      sender: { name: "PlanStack App", email: process.env.EMAIL_USER },
      to: [{ email: email }],
      subject: "PlanStack Password Reset",
      htmlContent: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443, // HTTPS Port (Always Open)
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': process.env.EMAIL_PASS, // Uses API Key here
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    // Make the request using native Node.js HTTPS
    const apiReq = https.request(options, (apiRes) => {
      console.log(`✅ Brevo API Status: ${apiRes.statusCode}`);
      
      let body = '';
      apiRes.on('data', (d) => (body += d));
      
      apiRes.on('end', () => {
        if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
          console.log("🚀 Email sent via API!");
          res.json({ message: 'Recovery email sent' });
        } else {
          console.error("❌ Brevo API Error:", body);
          res.status(500).json({ message: `Email API Error: ${body}` });
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error("❌ Network Error:", error);
      res.status(500).json({ message: `Network Error: ${error.message}` });
    });

    apiReq.write(data);
    apiReq.end();

  } catch (err) {
    console.error("Forgot Password DEBUG:", err);
    res.status(500).json({ message: `Debug Error: ${err.message}` });
  }
});

/**
 * @route   POST /auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [token, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    res.json({ message: 'Password successfully updated' });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;