const { ethers } = require("hardhat");

const contract = require("../../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

if (process.env.NODE_ENV === "development") {
  // Use localhost provider and signer for development
  provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  signer = provider.getSigner();
} else if (process.env.NODE_ENV === "testnet") {
  // Use Goerli testnet provider and signer for production
  const alchemyProvider = new ethers.providers.AlchemyProvider(
    (network = "goerli"),
    API_KEY
  );
  // Connect the signer to a wallet using the private key or mnemonic phrase of the account
  signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
} else {
  throw new Error("Invalid environment specified.");
}

// Create a contract instance
const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Function to stake an NFT
async function stakeNFT(tokenId) {
  accounts = await ethers.getSigners();
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract
      .connect(accounts[1])
      .stakeNFT(tokenId);

    // Wait for the transaction to be mined
    const receipt = await stakingTx.wait();

    // Check if the transaction was successful (status 0) or failed (status 1)
    if (receipt.status === 1) {
      return { success: true, message: "NFT staked successfully" };
    } else {
      // Transaction failed, handle the error
      console.error("Error staking NFT: Caller is not owner of this ID");
      return {
        success: false,
        message: "Error staking NFT: Caller is not owner of this ID",
      };
    }
  } catch (error) {
    // Handle other errors that may occur during the transaction
    console.error("Error staking NFT:", error);
    return { success: false, message: "Error staking NFT: " + error.message };
  }
}

// Function to unstake an NFT
async function unstakeNFT(tokenId) {
  try {
    // Perform the unstaking operation using the contract's unstaking function
    // Replace "unstakeNFT" with the actual function name in your contract
    const unstakingTx = await smartContract.unstakeNFT(tokenId);

    // Wait for the transaction to be mined
    await unstakingTx.wait();

    // Assuming the unstaking function emits an event for successful unstaking
    // You can check the event to ensure the unstaking was successful
    // For example, check if the "NFTUnstaked" event was emitted

    return { success: true, message: "NFT unstaked successfully" };
  } catch (error) {
    console.error("Error unstaking NFT:", error);
    return { success: false, message: "Error unstaking NFT" };
  }
}

module.exports = { stakeNFT, unstakeNFT };
