const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   POST /api/lists
 * @desc    Create a new list and append it to the end of the board
 * @access  Private
 */
router.post("/", authorization, async (req, res) => {
  try {
    const { title, board_id } = req.body;

    // 1. Calculate the new order position
    // We query the current highest 'order' value for this specific board
    const maxOrder = await db.query(
      'SELECT MAX("order") as max_order FROM lists WHERE board_id = $1',
      [board_id]
    );

    // If the board is empty (max_order is null), start at 1.
    // Otherwise, increment the current max by 1.
    const newOrder = (maxOrder.rows[0].max_order || 0) + 1;

    // 2. Insert the new list
    const newList = await db.query(
      'INSERT INTO lists (title, board_id, "order") VALUES ($1, $2, $3) RETURNING *',
      [title, board_id, newOrder]
    );

    res.json(newList.rows[0]);
  } catch (err) {
    console.error("Create List Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   GET /api/lists/:boardId
 * @desc    Get all lists for a specific board, sorted by position
 * @access  Private
 */
router.get("/:boardId", authorization, async (req, res) => {
  try {
    const { boardId } = req.params;

    // Fetch lists and sort by 'order' ASC so they appear correctly left-to-right
    const lists = await db.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY "order" ASC',
      [boardId]
    );

    res.json(lists.rows);
  } catch (err) {
    console.error("Get Lists Error:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;