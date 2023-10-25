// Imports
const db = require("./db");
const bcrypt = require("bcrypt");

// A higher "saltRounds" value means a slower hashing process and thus provides more security
const saltRounds = 10;

async function addUser(userName, password, region, gender) {
  if (!userName || !password || !region || !gender) {
    throw new Error("Please provide all required parameters.");
  }

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Define the SQL query to add to ml_data
    const mlDataQuery = `
      INSERT INTO ml_data (
          user_name, encrypted_password, region, gender,
          fits, likes, dislikes
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const emptyJsonArray = JSON.stringify([]);

    // Insert the user data into ml_data
    const mlDataResults = await db.query(mlDataQuery, [
      userName,
      hashedPassword,
      region,
      gender,
      emptyJsonArray,
      emptyJsonArray,
      emptyJsonArray,
    ]);

    console.log("User added to ml_data:", mlDataResults);
    return mlDataResults;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = { addUser };
