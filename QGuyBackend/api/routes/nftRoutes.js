const express = require("express");
const router = express.Router();
//define cache and pass to functions
const NodeCache = require("node-cache");
const cache = new NodeCache();

const { stakeNFT, unstakeNFT } = require("../controllers/nftController");

// Route to stake an NFT
router.post("/stake", async (req, res) => {
  const { tokenId, walletAddress, privateKey } = req.body;
  const result = await stakeNFT(tokenId, walletAddress, privateKey, cache);
  res.json(result);
});

// Route to unstake an NFT
router.post("/unstake", async (req, res) => {
  const { tokenId, walletAddress, privateKey } = req.body;
  const result = await unstakeNFT(tokenId, walletAddress, privateKey, cache);
  res.json(result);
});

module.exports = router;
