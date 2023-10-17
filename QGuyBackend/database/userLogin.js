const db = require("./db");
const bcrypt = require("bcrypt");

async function verifyUser(userName, password) {
  return new Promise((resolve, reject) => {
    // Fetch encrypted password from the database
    const query = "SELECT encrypted_password FROM ml_data WHERE user_name = ?";
    db.query(query, [userName], async (err, results) => {
      if (err) return reject(err);
      if (!results.length) return reject(new Error("User not found"));

      // Compare the provided password with stored hashed password
      const match = await bcrypt.compare(
        password,
        results[0].encrypted_password
      );
      if (!match) return reject(new Error("Invalid password"));

      resolve({ message: "Login successful" });
    });
  });
}

module.exports = {
  verifyUser,
};
