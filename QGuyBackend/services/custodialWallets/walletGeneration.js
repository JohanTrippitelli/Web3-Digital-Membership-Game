const ethers = require("ethers");
const db = require("../../database/db");
const kms = require("../../database/mockKMS");

class CustodialWalletService {
  generateWallet(userName, callback) {
    const wallet = ethers.Wallet.createRandom();

    // Encrypt the private key using your mock KMS
    const encryptedPrivateKey = kms.encrypt(wallet.privateKey);

    // Define the SQL query to insert the wallet data into `user_data`
    const query = `
      INSERT INTO user_data (
        user_name, wallet_address, wallet_hidden, tokens, secure_private_key
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const emptyTokensList = JSON.stringify([]);

    // Insert the wallet data into `user_data`
    db.query(
      query,
      [
        userName,
        wallet.address,
        true, // wallet_hidden set to true
        emptyTokensList, // empty list for tokens
        encryptedPrivateKey, // KMS encrypted private key
      ],
      (err, result) => {
        if (err) {
          console.error("Error storing the wallet in the database:", err);
          return callback(err);
        }
        console.log("Wallet stored successfully for user:", userName);
        callback(null, {
          userName: userName,
          address: wallet.address,
        });
      }
    );
  }
}

module.exports = CustodialWalletService;
