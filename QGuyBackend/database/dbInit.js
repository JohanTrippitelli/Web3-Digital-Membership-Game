// dbInit.js
const db = require("./db"); // Import the database connection module

// Function to create tables and perform any other database initialization tasks
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      decision_data JSON
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table:", err);
    } else {
      console.log('Table "users" created successfully');
    }
  });
}

module.exports = { initializeDatabase };
