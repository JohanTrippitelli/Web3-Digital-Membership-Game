const express = require("express");
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Include the NFT routes
const nftRoutes = require("./routes/nftRoutes");
app.use("/api/nft", nftRoutes);

module.exports = app;
