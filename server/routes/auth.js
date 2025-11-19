const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Import our database connection
const authorization = require('../middleware/authorization');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(401).json({ message: 'User already exists!' });
    }

    // 2. Hash the password (encrypt it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save the user to the database
    const newUser = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );

    // 4. Generate a Token (JWT)
    const token = jwt.sign(
      { user_id: newUser.rows[0].id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    // 5. Send the token back to the user
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    // 2. Check if password is correct
    // Compare the password they typed with the hashed one in the DB
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid Credential' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { user_id: user.rows[0].id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    // 4. Send token
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// VERIFY ROUTE
// This route checks if the token is valid. 
// The frontend will use this to keep the user logged in if they refresh the page.
router.get('/verify', authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



module.exports = router;