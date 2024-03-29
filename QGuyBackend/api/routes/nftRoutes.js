const express = require("express");
const router = express.Router();

const {
  mintNFT,
  stakeNFT,
  unstakeNFT,
  getNFTAttributes,
  getNFTAttributesBackup,
  getNewTokenIdForWallet,
  upgradeAttributes,
  switchSuit,
  setFit,
  setFitBackup,
  switchFits,
} = require("../controllers/nftController");

// Route to minting an NFT
router.post("/mint", async (req, res) => {
  const { privateKey, name, eth } = req.body;

  try {
    // Perform the switch logic using the provided tokenId
    const mintResult = await mintNFT(privateKey, name, eth);

    if (mintResult.success) {
      res.json(mintResult);
    } else {
      res.status(400).json(mintResult); // Return an error response
    }
  } catch (error) {
    console.error("Error minting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while minting",
    });
  }
});

// Route to stake an NFT
router.post("/stake", async (req, res) => {
  const { tokenId, walletAddress, privateKey } = req.body;
  const result = await stakeNFT(tokenId, walletAddress, privateKey);
  res.json(result);
});

// Route to unstake an NFT
router.delete("/unstake", async (req, res) => {
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

// Route to get Backup NFT attributes
router.get("/:tokenId/attributesBackup", async (req, res) => {
  const { tokenId } = req.params;
  const attributes = await getNFTAttributesBackup(tokenId);
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

// Route to upgrade attributes of a specific token
router.patch("/:tokenId/switchSuit", async (req, res) => {
  const { tokenId } = req.params;
  const { newSuit } = req.body;

  try {
    // Perform the attribute upgrade logic using the provided tokenId
    const swithcResult = await switchSuit(tokenId, newSuit);

    if (swithcResult.success) {
      res.json(swithcResult);
    } else {
      res.status(400).json(swithcResult); // Return an error response
    }
  } catch (error) {
    console.error("Error switching suits:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while swithcing suits",
    });
  }
});

// Route to switch a Fit of a specific token
router.patch("/:tokenId/setFit", async (req, res) => {
  const { tokenId } = req.params;
  const { newFit, bodyPart } = req.body;

  try {
    // Perform the attribute upgrade logic using the provided tokenId
    const swithcResult = await setFit(tokenId, bodyPart, newFit);

    if (swithcResult.success) {
      res.json(swithcResult);
    } else {
      res.status(400).json(swithcResult); // Return an error response
    }
  } catch (error) {
    console.error("Error setting fits:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while setting fits",
    });
  }
});

// Route to switch a Fit of a specific token
router.patch("/:tokenId/setFitBackup", async (req, res) => {
  const { tokenId } = req.params;
  const { newFit, bodyPart } = req.body;

  try {
    // Perform the fit setting logic using the provided tokenId
    const setResult = await setFitBackup(tokenId, bodyPart, newFit);

    if (setResult.success) {
      res.json(setResult);
    } else {
      res.status(400).json(setResult); // Return an error response
    }
  } catch (error) {
    console.error("Error setting backup fits:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while setting backup fits",
    });
  }
});

router.patch("/:tokenId/switch", async (req, res) => {
  const { tokenId } = req.params;

  try {
    // Perform the switch logic using the provided tokenId
    const switchResult = await switchFits(tokenId);

    if (switchResult.success) {
      res.json(switchResult);
    } else {
      res.status(400).json(switchResult); // Return an error response
    }
  } catch (error) {
    console.error("Error switching fits:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while switching fits",
    });
  }
});

module.exports = router;
