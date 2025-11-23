/**
 * Input Validation Middleware
 * Checks for the presence and valid format of credentials 
 * before processing Registration or Login requests.
 */
module.exports = function(req, res, next) {
  // Extract potential payload fields from the request body
  const { email, name, password } = req.body;

  /**
   * Helper: Validates email syntax using Regex.
   * Ensures the string adheres to standard email patterns (user@domain.com).
   */
  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  // --- Registration Flow ---
  if (req.path === "/register") {
    // 1. Check for missing fields (Name, Email, Password are required)
    if (![email, name, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } 
    // 2. Check for valid email format
    else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  } 
  
  // --- Login Flow ---
  else if (req.path === "/login") {
    // 1. Check for missing fields (Email, Password are required)
    if (![email, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } 
    // 2. Check for valid email format
    else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  }

  // Validation passed: proceed to the controller/route handler
  next();
};