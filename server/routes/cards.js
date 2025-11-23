const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   POST /api/cards
 * @desc    Create a new card and append it to the bottom of the list
 * @access  Private
 */
router.post("/", authorization, async (req, res) => {
  try {
    const { title, list_id } = req.body;

    // 1. Calculate the new order position
    // Fetch the current highest order number in this list to append to the end
    const maxOrder = await db.query(
      'SELECT MAX("order") as max_order FROM cards WHERE list_id = $1',
      [list_id]
    );
    // If no cards exist (null), start at 1. Otherwise, increment max by 1.
    const newOrder = (maxOrder.rows[0].max_order || 0) + 1;

    // 2. Insert the new card
    const newCard = await db.query(
      'INSERT INTO cards (title, list_id, "order") VALUES ($1, $2, $3) RETURNING *',
      [title, list_id, newOrder]
    );

    res.json(newCard.rows[0]);
  } catch (err) {
    console.error("Create Card Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   GET /api/cards/:listId
 * @desc    Get all cards for a specific list, sorted by their order
 * @access  Private
 */
router.get("/:listId", authorization, async (req, res) => {
  try {
    const { listId } = req.params;

    // Fetch cards and sort them by 'order' so they appear correctly in the UI
    const cards = await db.query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY "order" ASC',
      [listId]
    );

    res.json(cards.rows);
  } catch (err) {
    console.error("Get Cards Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PUT /api/cards/:id
 * @desc    Update a card's position or move it to a different list
 * @access  Private
 */
router.put("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { list_id, order } = req.body;

    // Update list reference and order position
    const updatedCard = await db.query(
      'UPDATE cards SET list_id = $1, "order" = $2 WHERE id = $3 RETURNING *',
      [list_id, order, id]
    );

    if (updatedCard.rows.length === 0) {
      return res.status(404).json("Card not found.");
    }

    res.json(updatedCard.rows[0]);
  } catch (err) {
    console.error("Update Card Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   PATCH /api/cards/reorder
 * @desc    Batch update card orders (used when reordering within a list)
 * @access  Private
 */
router.patch("/reorder", authorization, async (req, res) => {
  try {
    const { cards } = req.body; // Expects array of { id, order }

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json("Invalid cards array provided.");
    }

    // Start a Transaction
    // This ensures that either ALL cards update successfully, or NONE do.
    await db.query("BEGIN");
    
    for (const card of cards) {
      await db.query(
        'UPDATE cards SET "order" = $1 WHERE id = $2',
        [card.order, card.id]
      );
    }

    // Commit changes if loop finishes without errors
    await db.query("COMMIT");
    
    res.status(200).json("Card orders updated successfully.");

  } catch (err) {
    // Rollback changes if any update fails to prevent data corruption
    await db.query("ROLLBACK");
    console.error("Reorder Transaction Failed:", err.message);
    res.status(500).json("Server Error during reorder.");
  }
});

module.exports = router;