const db = require("./db"); // Import the database connection module

function initializeDatabase() {
  // Table 1: ML Data
  const createMLDataTableQuery = `
    CREATE TABLE IF NOT EXISTS ml_data (
      user_name VARCHAR(255) NOT NULL UNIQUE,
      encrypted_password VARCHAR(255) NOT NULL,
      region VARCHAR(255) NOT NULL,
      gender VARCHAR(255) NOT NULL,
      fits JSON,
      likes JSON,
      dislikes JSON,
      PRIMARY KEY (user_name)
    );
  `;

  // Table 2: User Data
  const createUserDataTableQuery = `
CREATE TABLE IF NOT EXISTS user_data (
  user_name VARCHAR(255) NOT NULL UNIQUE,
  wallet_address VARCHAR(255) NOT NULL,
  secure_private_key VARCHAR(255), 
  wallet_hidden BOOLEAN NOT NULL,
  tokens JSON,
  PRIMARY KEY (user_name)
);
`;

  // Table 3: Token Data
  const createTokenDataTableQuery = `
    CREATE TABLE IF NOT EXISTS token_data (
      token BIGINT NOT NULL,
      staked BOOLEAN NOT NULL,
      fit1 JSON,
      fit2 JSON,
      PRIMARY KEY (token)
    );
  `;

  // Execute Queries
  db.query(createMLDataTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table 'ml_data':", err);
    } else {
      console.log("Table 'ml_data' created successfully");
    }
  });

  db.query(createUserDataTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table 'user_data':", err);
    } else {
      console.log("Table 'user_data' created successfully");
    }
  });

  db.query(createTokenDataTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table 'token_data':", err);
    } else {
      console.log("Table 'token_data' created successfully");
    }
  });
}

module.exports = { initializeDatabase };
