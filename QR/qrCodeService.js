const https = require("https");
const fs = require("fs");

// Generate a QR code image using the QR Code API
function generateQRCode(qrCodeData) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeData}`;
    https
      .get(apiUrl, (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          reject(`Error: ${statusCode}`);
          res.resume();
          return;
        }

        let data = "";
        res.setEncoding("binary");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(`Error: ${err.message}`);
      });
  });
}

// Save a QR code image to a file
function saveQRCodeImage(imageData, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, imageData, "binary", (err) => {
      if (err) {
        reject(`Error: ${err.message}`);
      } else {
        resolve();
      }
    });
  });
}

// Example usage
async function generateAndSaveQRCode(qrCodeData, filePath) {
  try {
    const imageData = await generateQRCode(qrCodeData);
    await saveQRCodeImage(imageData, filePath);
    console.log(`Saved QR code image to ${filePath}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

generateAndSaveQRCode("https://example.com", "./example.png");
