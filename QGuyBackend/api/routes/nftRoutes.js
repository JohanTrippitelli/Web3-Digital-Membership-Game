const express = require("express");
const router = express.Router();

//Database
const { verifyUser } = require("../../database/userLogin");

const {
  newUser,
  connectWallet,
  createWallet,
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

// Route to post a new User
router.post("/newUser", async (req, res) => {
  const { userName, password, region, gender } = req.body;

  try {
    const result = await newUser(userName, password, region, gender);
    // Success case: send a 201 status code (created) with a success message.
    res.status(201).json({ message: "Success creating new user", result });
  } catch (err) {
    // Error case: send a 500 status code (internal server error) with an error message.
    res
      .status(500)
      .json({ message: "Failure creating new user", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const result = await verifyUser(userName, password);
    // Success: Send a 200 status code with a success message
    res.status(200).json(result);
  } catch (err) {
    // Failure: Send a 401 status code (unauthorized) with an error message
    res.status(401).json({ message: err.message });
  }
});

// Connect pre existing wallet to a user
router.post("/:userName/connectWallet", async (req, res) => {
  const { userName } = req.params;
  const { walletAddress, privateKey } = req.body;

  try {
    const result = await connectWallet(userName, walletAddress, privateKey);
    res.status(201).json({ message: "Success connecting new wallet", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failure connecting new wallet", error: err.message });
  }
});

// Create a wallet for an existing user
router.post("/:userName/createWallet", async (req, res) => {
  const { userName } = req.params;

  try {
    const result = await createWallet(userName);
    res.status(201).json({ message: "Success creating a new wallet", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failure creating a new wallet", error: err.message });
  }
});

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

// Route for wallet creation for non web3 users
router.post("/nonWeb3/createWallet", async (req, res) => {
  const { userName } = req.body;
  const result = await createWallet(userName);
  res.json(result);
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
