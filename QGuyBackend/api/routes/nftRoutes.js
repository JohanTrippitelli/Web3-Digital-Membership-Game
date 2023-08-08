const express = require("express");
const router = express.Router();

const {
  stakeNFT,
  unstakeNFT,
  getNFTAttributes,
} = require("../controllers/nftController");

// Route to stake an NFT
router.post("/stake", async (req, res) => {
  const { tokenId, walletAddress, privateKey } = req.body;
  const result = await stakeNFT(tokenId, walletAddress, privateKey);
  res.json(result);
});

// Route to unstake an NFT
router.post("/unstake", async (req, res) => {
  const { tokenId, walletAddress, privateKey } = req.body;
  const result = await unstakeNFT(tokenId, walletAddress, privateKey);
  res.json(result);
});

// Route to get NFT attributes
router.get("/:tokenId/attributes", async (req, res) => {
  const { tokenId } = req.params;
  const attributes = await getNFTAttributes(tokenId);
  res.json(attributes);
});

module.exports = router;
