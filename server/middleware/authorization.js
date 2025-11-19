const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Get the token from the header
    const jwtToken = req.header("token");

    // 2. Check if token exists
    if (!jwtToken) {
      return res.status(403).json("Not Authorized");
    }

    // 3. Verify the token
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET || "default_secret");

    // 4. Add the user_id to the request so we can use it later
    req.user = payload.user_id;

    // 5. Continue to the actual route
    next();

  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized");
  }
};