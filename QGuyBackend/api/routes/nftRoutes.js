const express = require("express");
const router = express.Router();

const {
  stakeNFT,
  unstakeNFT,
  getNFTAttributes,
  getNewTokenIdForWallet,
  upgradeAttributes,
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

// Route to get tokenIds owned by a user based on the smart contract
router.get("/:walletAddress/tokenIds", async (req, res) => {
  const { walletAddress } = req.params;
  const tokenIds = await getNewTokenIdForWallet(walletAddress);
  res.json({ tokenIds }); // Wrap the tokenIds in an object for consistent JSON response
});

// Route to upgrade attributes of a specific token
router.patch("/:tokenId/upgrade", async (req, res) => {
  const { tokenId } = req.params;

  try {
    // Perform the attribute upgrade logic using the provided tokenId
    const upgradeResult = await upgradeAttributes(tokenId);

    if (upgradeResult.success) {
      res.json(upgradeResult);
    } else {
      res.status(400).json(upgradeResult); // Return an error response
    }
  } catch (error) {
    console.error("Error upgrading attributes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while upgrading attributes",
    });
  }
});

module.exports = router;
