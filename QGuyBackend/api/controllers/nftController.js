const { network, ethers } = require("hardhat");
const contract = require("../../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

if (process.env.NODE_ENV === "development") {
  // Use localhost provider for development
  provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
} else if (process.env.NODE_ENV === "testnet") {
  // Use Goerli testnet provider for production
  const alchemyProvider = new ethers.providers.AlchemyProvider(
    (network = "goerli"),
    API_KEY
  );
  // Connect the signer to a wallet using the private key or mnemonic phrase of the account
  provider = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
} else {
  throw new Error("Invalid environment specified.");
}

// Function to stake an NFT
async function stakeNFT(tokenId, privateKey) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.stakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    // return success if successful
    return { success: true, message: "NFT staked successfully" };
  } catch (error) {
    const revertReason = extractRevertReason(error.message);
    console.error("Error staking NFT:", revertReason);
    return { success: false, message: "Error staking NFT: " + revertReason };
  }
}

// Function to stake an NFT
async function unstakeNFT(tokenId, privateKey) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.unstakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    // return success if successful
    return { success: true, message: "NFT unstaked successfully" };
  } catch (error) {
    const revertReason = extractRevertReason(error.message);
    console.error("Error unstaking NFT:", revertReason);
    return { success: false, message: "Error unstaking NFT: " + revertReason };
  }
}

function extractRevertReason(errorMessage) {
  const regex = /reverted with reason string '(.+?)'/;
  const match = errorMessage.match(regex);
  return match ? match[1] : null;
}

module.exports = { stakeNFT, unstakeNFT };
