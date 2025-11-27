const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

/**
 * @route   POST /api/boards
 * @desc    Create a new project board
 */
router.post("/", authorization, async (req, res) => {
    try {
        const { title } = req.body;
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
 * @desc    Get My Boards + Shared Boards
 */
router.get("/", authorization, async (req, res) => {
    try {
        const myBoards = await db.query(
            "SELECT * FROM boards WHERE owner_id = $1 ORDER BY created_at DESC", 
            [req.user]
        );
        const sharedBoards = await db.query(
            `SELECT b.*, bm.role 
             FROM boards b 
             JOIN board_members bm ON b.id = bm.board_id 
             WHERE bm.user_id = $1 
             ORDER BY bm.joined_at DESC`,
            [req.user]
        );

        res.json({
            myBoards: myBoards.rows,
            sharedBoards: sharedBoards.rows
        });
    } catch (err) {
        console.error("Get All Boards Error:", err.message);
        res.status(500).json("Server Error");
    }
});

/**
 * @route   GET /api/boards/:id
 * @desc    Get a specific board (Owner OR Member)
 */
router.get("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if Board exists
    const boardResult = await db.query("SELECT * FROM boards WHERE id = $1", [id]);
    if (boardResult.rows.length === 0) return res.status(404).json("Board not found");

    const board = boardResult.rows[0];
    let role = null;

    // 2. Determine Role
    if (board.owner_id === req.user) {
        role = 'owner';
    } else {
        const memberCheck = await db.query(
            "SELECT role FROM board_members WHERE board_id = $1 AND user_id = $2",
            [id, req.user]
        );
        if (memberCheck.rows.length > 0) role = memberCheck.rows[0].role;
    }

    if (!role) return res.status(403).json("Not Authorized");

    res.json({ ...board, user_role: role });

  } catch (err) {
    console.error("Get Single Board Error:", err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route   POST /api/boards/:id/invite
 * @desc    Invite a user to the board via Email
 */
router.post("/:id/invite", authorization, async (req, res) => {
    try {
        const { id } = req.params; // Board ID
        const { email, role } = req.body; // User email to invite

        // 1. Check if Board exists and Requester is Owner
        const boardCheck = await db.query("SELECT * FROM boards WHERE id = $1", [id]);
        if (boardCheck.rows.length === 0) return res.status(404).json("Board not found");
        
        // Only Owner can invite (for now)
        if (boardCheck.rows[0].owner_id !== req.user) {
            return res.status(403).json("Only the owner can invite members");
        }

        // 2. Find the User by Email
        const userCheck = await db.query("SELECT id, name FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json("User with this email does not exist");
        }
        
        const inviteeId = userCheck.rows[0].id;

        // 3. Prevent inviting yourself
        if (inviteeId === req.user) {
            return res.status(400).json("You cannot invite yourself");
        }

        // 4. Check if already a member
        const memberCheck = await db.query(
            "SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2",
            [id, inviteeId]
        );
        if (memberCheck.rows.length > 0) {
            return res.status(400).json("User is already a member of this board");
        }

        // 5. Add to Board Members
        await db.query(
            "INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)",
            [id, inviteeId, role || 'editor']
        );

        // 6. Send Notification
        const notificationMsg = `You have been invited to join the board "${boardCheck.rows[0].title}"`;
        await db.query(
            "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
            [inviteeId, notificationMsg]
        );

        res.json({ message: "Invitation sent successfully!" });

    } catch (err) {
        console.error("Invite Error:", err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;