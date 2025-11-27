const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 */
router.get("/", authorization, async (req, res) => {
  try {
    const notifications = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user]
    );
    res.json(notifications.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PUT /api/notifications/:id
 * @desc    Mark a notification as read
 */
router.put("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership before updating
    const check = await db.query("SELECT * FROM notifications WHERE id = $1 AND user_id = $2", [id, req.user]);
    if (check.rows.length === 0) return res.status(403).json("Not Authorized");

    await db.query("UPDATE notifications SET is_read = TRUE WHERE id = $1", [id]);
    
    res.json("Notification marked as read");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   DELETE /api/notifications/clear
 * @desc    Delete all read notifications (Cleanup)
 */
router.delete("/clear", authorization, async (req, res) => {
    try {
        await db.query("DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE", [req.user]);
        res.json("Cleared read notifications");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;