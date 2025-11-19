const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

// 1. CREATE A BOARD
router.post("/", authorization, async (req, res) => {
    try {
        const { title } = req.body;

        // req.user comes from the authorization middleware (it's the user_id)
        const newBoard = await db.query(
            "INSERT INTO boards (title, owner_id) VALUES ($1, $2) RETURNING *",
            [title, req.user]
        );

        res.json(newBoard.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// 2. GET ALL BOARDS (Only for the logged-in user)
router.get("/", authorization, async (req, res) => {
    try {
        const userBoards = await db.query(
            "SELECT * FROM boards WHERE owner_id = $1",
            [req.user]
        );

        res.json(userBoards.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});


// 3. GET A SINGLE BOARD
router.get("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the board exists AND belongs to the logged-in user
    const board = await db.query(
      "SELECT * FROM boards WHERE id = $1 AND owner_id = $2",
      [id, req.user]
    );

    if (board.rows.length === 0) {
      return res.status(403).json("Not Authorized");
    }

    res.json(board.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;