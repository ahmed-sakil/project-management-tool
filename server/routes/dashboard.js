const router = require("express").Router();
const authorization = require("../middleware/authorization");
const db = require("../db");

/**
 * @route   GET /api/dashboard
 * @desc    Get the authenticated user's basic profile info (Name, Email)
 * @access  Private
 */
router.get("/", authorization, async (req, res) => {
  try {
    // 1. Fetch user data using the ID from the token (req.user)
    // We explicitly select only non-sensitive fields
    const user = await db.query(
      "SELECT name, email FROM users WHERE id = $1",
      [req.user] 
    ); 
    
    // 2. Safety Check: Ensure user still exists in DB
    if (user.rows.length === 0) {
        return res.status(404).json("User not found");
    }

    // 3. Return the user info object (e.g., { name: "Ahmed", email: "..." })
    res.json(user.rows[0]);

  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;