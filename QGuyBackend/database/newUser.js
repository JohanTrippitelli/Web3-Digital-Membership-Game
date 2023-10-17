// Imports
const db = require("./db");
const bcrypt = require("bcrypt");

// A higher "saltRounds" value means a slower hashing process and thus provides more security
const saltRounds = 10;

function addUser(userName, password, region, gender, callback) {
  if (!userName || !password || !region || !gender) {
    return callback(new Error("Please provide all required parameters."));
  }

  // Hash the password using bcrypt
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return callback(err);
    }

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
    db.query(
      mlDataQuery,
      [
        userName,
        hashedPassword,
        region,
        gender,
        emptyJsonArray,
        emptyJsonArray,
        emptyJsonArray,
      ],
      (err, mlDataResults) => {
        if (err) {
          console.error("Error inserting data into ml_data:", err);
          return callback(err);
        }

        console.log("User added to ml_data:", mlDataResults);
        callback(null, mlDataResults); // <-- This line was missing!
      }
    );
  });
}

module.exports = { addUser };
