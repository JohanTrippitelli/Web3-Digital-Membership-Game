const express = require("express");
const dbInit = require("../database/dbInit"); // Import the database initialization module
const app = express();

// Initialize the database when your application starts
dbInit.initializeDatabase();

// Middleware to parse JSON data
app.use(express.json());

// Include the NFT routes
const nftRoutes = require("./routes/nftRoutes");
app.use("/api/nft", nftRoutes);

module.exports = app;
