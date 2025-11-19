const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

// 1. CREATE A LIST
router.post("/", authorization, async (req, res) => {
  try {
    const { title, board_id } = req.body;

    // 1. Calculate the new order (put it at the end)
    // We check the max order currently in the DB for this board
    const maxOrder = await db.query(
      'SELECT MAX("order") as max_order FROM lists WHERE board_id = $1',
      [board_id]
    );
    // If there are no lists, start at 1. Otherwise, add 1 to the max.
    const newOrder = (maxOrder.rows[0].max_order || 0) + 1;

    // 2. Insert the new list
    const newList = await db.query(
      'INSERT INTO lists (title, board_id, "order") VALUES ($1, $2, $3) RETURNING *',
      [title, board_id, newOrder]
    );

    res.json(newList.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// 2. GET ALL LISTS FOR A SPECIFIC BOARD
router.get("/:boardId", authorization, async (req, res) => {
  try {
    const { boardId } = req.params;

    const lists = await db.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY "order" ASC',
      [boardId]
    );

    res.json(lists.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;