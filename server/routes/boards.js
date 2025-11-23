const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   POST /api/boards
 * @desc    Create a new project board associated with the logged-in user
 * @access  Private
 */
router.post("/", authorization, async (req, res) => {
    try {
        const { title } = req.body;

        // Insert new board using the user_id (req.user) derived from the auth middleware
        const newBoard = await db.query(
            "INSERT INTO boards (title, owner_id) VALUES ($1, $2) RETURNING *",
            [title, req.user]
        );

        res.json(newBoard.rows[0]);
    } catch (err) {
        console.error("Create Board Error:", err.message);
        res.status(500).json("Server Error");
    }
});

/**
 * @route   GET /api/boards
 * @desc    Retrieve all boards owned by the authenticated user
 * @access  Private
 */
router.get("/", authorization, async (req, res) => {
    try {
        // Fetch only boards where owner_id matches the current user
        const userBoards = await db.query(
            "SELECT * FROM boards WHERE owner_id = $1 ORDER BY created_at DESC", 
            [req.user]
        );

        res.json(userBoards.rows);
    } catch (err) {
        console.error("Get All Boards Error:", err.message);
        res.status(500).json("Server Error");
    }
});

/**
 * @route   GET /api/boards/:id
 * @desc    Get a specific board by ID (with ownership verification)
 * @access  Private
 */
router.get("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    // Security Check: Ensure the board exists AND belongs to the requesting user
    const board = await db.query(
      "SELECT * FROM boards WHERE id = $1 AND owner_id = $2",
      [id, req.user]
    );

    // If no match found, the user is either requesting a non-existent board 
    // or a board they do not own.
    if (board.rows.length === 0) {
      return res.status(403).json("Not Authorized");
    }

    res.json(board.rows[0]);
  } catch (err) {
    console.error("Get Single Board Error:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;