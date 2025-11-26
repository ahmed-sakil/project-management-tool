const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const authorization = require('../middleware/authorization');
const validInfo = require("../middleware/validInfo");

/**
 * @route   POST /auth/register
 * @desc    Register a new user, hash password, and issue JWT
 * @access  Public
 */
router.post("/register", validInfo, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exists");
    }

    // 2. Hash the password (bcrypt)
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 3. Insert new user into database
    const newUser = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    // 4. Generate JWT Token
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
 * @desc    Authenticate user and issue JWT
 * @access  Public
 */
router.post('/login', validInfo, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    // 3. Generate JWT Token
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
 * @route   GET /auth/verify
 * @desc    Verify JWT token validity (used by frontend to check session)
 * @access  Private (Requires Authorization Header)
 */
router.get('/verify', authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Generate reset token and send recovery email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // 2. Generate crypto token & expiration (1 hour)
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000;

    // 3. Save token to database
    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, expires, email]
    );

    console.log("DEBUG EMAIL USER:", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // ---------------------------------------------

    // Use the Environment Variable if available, otherwise fallback to localhost
    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
    
    // HashRouter Support
    const resetUrl = `${clientURL}/#/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'PlanStack Password Reset',
      text: `You requested a password reset.\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n`,
    };

    // 5. Send Email
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Recovery email sent' });

  } catch (err) {
    console.error("Forgot Password DEBUG:", err);
    // Send the REAL error to the frontend so we can debug it
    res.status(500).json({ message: `Debug Error: ${err.message}` });
  }
});

/**
 * @route   POST /auth/reset-password
 * @desc    Verify token and update password
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Verify token exists and has not expired
    const user = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [token, Date.now()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update user and clear reset tokens
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