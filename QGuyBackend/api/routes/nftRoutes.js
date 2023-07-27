const express = require("express");
const router = express.Router();

const { stakeNFT, unstakeNFT } = require("../controllers/nftController");

// Route to stake an NFT
router.post("/stake", async (req, res) => {
  const { tokenId, privateKey } = req.body;
  const result = await stakeNFT(tokenId, privateKey);
  res.json(result);
});

// Route to unstake an NFT
router.post("/unstake", async (req, res) => {
  const { tokenId, privateKey } = req.body;
  const result = await unstakeNFT(tokenId, privateKey);
  res.json(result);
});

module.exports = router;
