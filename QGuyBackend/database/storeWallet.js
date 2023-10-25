const pool = require("./db"); // Your DB connection module
const kms = require("./mockKMS"); // Your mock KMS client module

async function checkUserExists(userName) {
  try {
    const query = `SELECT 1 FROM ml_data WHERE user_name = ? LIMIT 1`;
    const results = await pool.query(query, [userName]);
    return results.length > 0;
  } catch (err) {
    console.error("Error checking user existence:", err);
    throw err;
  }
}

async function storeWalletData(userName, walletAddress, plainPrivateKey) {
  try {
    // Encrypt the private key using your mock KMS
    const encryptedPrivateKey = kms.encrypt(plainPrivateKey);

    const query = `
          INSERT INTO user_data (user_name, wallet_address, secure_private_key, wallet_hidden, tokens) 
          VALUES (?, ?, ?, ?, ?)
      `;

    const defaultWalletHidden = false;
    const emptyTokensList = JSON.stringify([]); // Convert empty array to a JSON string

    await pool.query(query, [
      userName,
      walletAddress,
      encryptedPrivateKey,
      defaultWalletHidden,
      emptyTokensList,
    ]);

    return { message: "Data stored successfully" };
  } catch (error) {
    console.error("Error storing wallet data:", error);
    throw error;
  }
}

module.exports = {
  checkUserExists,
  storeWalletData,
};
