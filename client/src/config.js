// client/src/config.js

// Change this to TRUE when you want to push to GitHub/Production
const isProduction = true; 

export const API_URL = isProduction 
  ? "https://pm-server-1ely.onrender.com" // <--- Your REAL Render URL
  : "http://localhost:5000";