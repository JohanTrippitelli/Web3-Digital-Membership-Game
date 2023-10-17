/**Warning this Mock VMS is not production approved! Must be Altered. Only to be used in local testing */
const crypto = require("crypto");

const LOCAL_KEY = crypto.randomBytes(32); // DO NOT use static keys in production

function encrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", LOCAL_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString("base64"); // IV + Ciphertext
}

function decrypt(ciphertext) {
  const buffer = Buffer.from(ciphertext, "base64");
  const iv = buffer.slice(0, 16);
  const encryptedText = buffer.slice(16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", LOCAL_KEY, iv);
  return decipher.update(encryptedText) + decipher.final();
}

module.exports = { encrypt, decrypt };
