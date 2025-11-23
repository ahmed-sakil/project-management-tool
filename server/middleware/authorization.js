const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Authorization Middleware
 * Verifies the JWT token from the request header.
 * If valid, attaches the user ID to req.user for downstream use.
 */
module.exports = async (req, res, next) => {
  try {
    // Extract token from the custom 'token' header
    const jwtToken = req.header("token");

    // Deny access if no token is provided
    if (!jwtToken) {
      return res.status(403).json("Not Authorized");
    }

    // Verify token validity against the environment secret
    const payload = jwt.verify(
      jwtToken, 
      process.env.JWT_SECRET || "default_secret"
    );

    // Attach the authenticated user's ID to the request object
    // This allows subsequent routes to identify the user
    req.user = payload.user_id;

    // Proceed to the next middleware or route handler
    next();

  } catch (err) {
    // Log verification failure (e.g., expired token, invalid signature)
    console.error("Auth Middleware Error:", err.message);
    return res.status(403).json("Not Authorized");
  }
};