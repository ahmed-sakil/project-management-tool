const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

// 1. CREATE A CARD
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

// 2. GET CARDS FOR A SPECIFIC LIST
router.get("/:listId", authorization, async (req, res) => {
  try {
    const { listId } = req.params;

    const cards = await db.query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY "order" ASC',
      [listId]
    );

    res.json(cards.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// 3. UPDATE CARD (Drag-and-drop position/list change)
router.put("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { list_id, order } = req.body;

    const updatedCard = await db.query(
      'UPDATE cards SET list_id = $1, "order" = $2 WHERE id = $3 RETURNING *',
      [list_id, order, id]
    );

    if (updatedCard.rows.length === 0) {
      return res.status(404).json("Card not found.");
    }

    res.json(updatedCard.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// 4. UPDATE MULTIPLE CARD ORDERS (Batch reorder)
router.patch("/reorder", authorization, async (req, res) => {
  try {
    const { cards } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json("Invalid cards array provided.");
    }

    await db.query("BEGIN");
    
    for (const card of cards) {
      await db.query(
        'UPDATE cards SET "order" = $1 WHERE id = $2',
        [card.order, card.id]
      );
    }

    await db.query("COMMIT");
    res.status(200).json("Card orders updated successfully.");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Reorder transaction failed:", err.message);
    res.status(500).json("Server Error during reorder.");
  }
});

module.exports = router;