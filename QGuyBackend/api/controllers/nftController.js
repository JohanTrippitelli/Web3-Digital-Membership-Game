const { network, ethers } = require("hardhat");
const contract = require("../../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;
const {
  updateToken,
  updateWallet,
  removeToken,
  getStakedTokens,
  getAttributes,
} = require("../../storage/cache");

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
async function stakeNFT(tokenId, walletAddress, privateKey, cache) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.stakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    let stakedTokens, stakedTokensAsString;
    stakedTokens = getStakedTokens(walletAddress, cache);
    stakedTokensAsString = Array.from(stakedTokens, (token) =>
      token.toString()
    );
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${stakedTokensAsString}`
    );

    //Extract on chain attributes and update cache
    const attributes = await smartContract.getAttributes(tokenId);
    updateCache(walletAddress, tokenId, attributes, cache);

    //Get the wallet address' tokens
    stakedTokens = getStakedTokens(walletAddress, cache);
    stakedTokensAsString = Array.from(stakedTokens, (token) =>
      token.toString()
    );
    //logs
    console.log(
      `Attributes at ${tokenId} are: `,
      getAttributes(tokenId, cache)
    );
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${stakedTokensAsString}`
    );
    // return success if successful
    return { success: true, message: "NFT staked successfully" };
  } catch (error) {
    const revertReason = extractRevertReason(error.message);
    console.error("Error staking NFT:", revertReason);
    return { success: false, message: "Error staking NFT: " + revertReason };
  }
}

// Function to stake an NFT
async function unstakeNFT(tokenId, walletAddress, privateKey, cache) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.unstakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    // Remove the attributes for the tokenId from the in-memory cache
    removeCache(walletAddress, tokenId, smartContract, cache);

    //Get the wallet address' tokens
    const stakedTokens = getStakedTokens(walletAddress, cache);
    console.log("This is the cache:", stakedTokens);
    const stakedTokensAsString = Array.from(stakedTokens, (token) =>
      token.toString()
    );
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${stakedTokensAsString}`
    );
    // return success if successful
    return { success: true, message: "NFT unstaked successfully" };
  } catch (error) {
    const revertReason = extractRevertReason(error.message);
    console.error("Error unstaking NFT:", revertReason);
    return { success: false, message: "Error unstaking NFT: " + revertReason };
  }
}

function updateCache(walletAddress, tokenId, attributes, cache) {
  // Update the tokenId -> attributes cache
  updateToken(tokenId.toString(), attributes, cache);
  //Update the address -> tokenIds
  updateWallet(walletAddress, tokenId, cache);
}

async function removeCache(walletAddress, tokenId, contract, cache) {
  //retrieve the current attributes from cache update on chain attributes and remove the tokenId from the cache
  const attributes = getAttributes(tokenId, cache);

  //Update on-chain data using the retrieved attributes
  try {
    // Update attributes on-chain
    const unstakingTx = await contract.setAttributes(tokenId, attributes);
    await unstakingTx.wait();

    // Remove the token ID from the cache
    removeToken(walletAddress, tokenId, cache);
  } catch (error) {
    // Handle any errors that might occur during the on-chain update
    console.error("Error updating on-chain data:", error);
  }
}

function extractRevertReason(errorMessage) {
  const regex = /reverted with reason string '(.+?)'/;
  const match = errorMessage.match(regex);
  return match ? match[1] : null;
}

module.exports = { stakeNFT, unstakeNFT };
