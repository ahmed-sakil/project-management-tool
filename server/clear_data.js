const { Client } = require('pg');

// ⚠️ PASTE YOUR RENDER CONNECTION STRING HERE
const connectionString = "postgresql://pm_db_ff8n_user:CRZIlcSp92mWONi7IoHoczYYfXqyBwj6@dpg-d4eupn7pm1nc7393e5rg-a.singapore-postgres.render.com/pm_db_ff8n";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const clearData = async () => {
  try {
    console.log("🔌 Connecting to Database...");
    await client.connect();
    
    console.log("🧹 Clearing all data...");
    
    // TRUNCATE empties the table but keeps the structure.
    // CASCADE ensures linked data (like boards belonging to a user) is deleted too.
    await client.query(`
      TRUNCATE TABLE users, boards, lists, cards CASCADE;
    `);

    console.log("✨ All data deleted! Tables are clean and ready.");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
  }
};

clearData();