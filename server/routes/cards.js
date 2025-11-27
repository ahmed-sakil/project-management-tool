const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   POST /api/cards
 * @desc    Create a new card
 */
router.post("/", authorization, async (req, res) => {
  try {
    const { title, list_id } = req.body;
    const maxOrder = await db.query(
      'SELECT MAX("order") as max_order FROM cards WHERE list_id = $1',
      [list_id]
    );
    const newOrder = (maxOrder.rows[0].max_order || 0) + 1;

    const newCard = await db.query(
      'INSERT INTO cards (title, list_id, "order") VALUES ($1, $2, $3) RETURNING *',
      [title, list_id, newOrder]
    );

    res.json(newCard.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   GET /api/cards/:listId
 * @desc    Get non-archived cards for a list
 */
router.get("/:listId", authorization, async (req, res) => {
  try {
    const { listId } = req.params;

    // UPDATED: Filter out archived cards
    const cards = await db.query(
      'SELECT * FROM cards WHERE list_id = $1 AND is_archived = false ORDER BY "order" ASC',
      [listId]
    );

    res.json(cards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PUT /api/cards/:id
 * @desc    Move card (Drag and Drop)
 */
router.put("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { list_id, order } = req.body;

    const updatedCard = await db.query(
      'UPDATE cards SET list_id = $1, "order" = $2 WHERE id = $3 RETURNING *',
      [list_id, order, id]
    );

    res.json(updatedCard.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PUT /api/cards/:id/details
 * @desc    Update Card Details (Title, Due Date, Archive)
 * @access  Private
 */
router.put("/:id/details", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, due_date, is_archived } = req.body;

    const updatedCard = await db.query(
      `UPDATE cards 
       SET title = $1, due_date = $2, is_archived = $3 
       WHERE id = $4 RETURNING *`,
      [title, due_date, is_archived, id]
    );

    if (updatedCard.rows.length === 0) {
      return res.status(404).json("Card not found");
    }

    res.json(updatedCard.rows[0]);
  } catch (err) {
    console.error("Update Details Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PATCH /api/cards/reorder
 * @desc    Batch reorder
 */
router.patch("/reorder", authorization, async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json("Invalid data");

    await db.query("BEGIN");
    for (const card of cards) {
      await db.query('UPDATE cards SET "order" = $1 WHERE id = $2', [card.order, card.id]);
    }
    await db.query("COMMIT");
    res.status(200).json("Updated");
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json("Server Error");
  }
});

module.exports = router;