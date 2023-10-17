const db = require("./db"); // Your DB connection module
const kms = require("./mockKMS"); // Your mock KMS client module

function checkUserExists(userName, callback) {
  const query = `SELECT 1 FROM ml_data WHERE user_name = ? LIMIT 1`;
  db.query(query, [userName], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results.length > 0);
  });
}

function storeWalletData(userName, walletAddress, plainPrivateKey, callback) {
  // Encrypt the private key using your mock KMS
  const encryptedPrivateKey = kms.encrypt(plainPrivateKey);

  const query = `
        INSERT INTO user_data (user_name, wallet_address, secure_private_key, wallet_hidden, tokens) 
        VALUES (?, ?, ?, ?, ?)
    `;

  const defaultWalletHidden = false;
  const emptyTokensList = JSON.stringify([]); // Convert empty array to a JSON string

  db.query(
    query,
    [
      userName,
      walletAddress,
      encryptedPrivateKey,
      defaultWalletHidden,
      emptyTokensList,
    ],
    callback
  );
}

module.exports = {
  checkUserExists,
  storeWalletData,
};
