// Import the caching library
const NodeCache = require("node-cache");
//Other Imports
const { ethers } = require("ethers");
const contract = require("../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");

const contractAddress = process.env.CONTRACT_ADDRESS; //Deployed contract address
const contractABI = contract.abi;
const API_KEY = process.env.API_KEY;
// Create a new instance of the cache
const cache = new NodeCache();

async function startEventCapture() {
  // Set up Ethereum provider (e.g., Hardhat provider or ethers.providers.JsonRpcProvider)
  console.log("Setting up Provider");
  if (process.env.NODE_ENV === "development") {
    // Use localhost provider and signer for development
    provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  } else if (process.env.NODE_ENV === "testnet") {
    // Use Goerli testnet provider and signer for production
    const provider = new ethers.providers.AlchemyProvider(
      (network = "goerli"),
      API_KEY
    );
  } else {
    throw new Error("Invalid environment specified.");
  }
  console.log("---------------------------------------");

  // Connect to the contract using the ABI and contract address
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  console.log("Listening for an Event");

  // Listen for NFTStaked events
  contract.on("NFTStaked", async (staker, tokenId, event) => {
    //extract on chain attributes
    const attributes = await contract.getAttributes(tokenId);
    //update
    updateCache(staker, tokenId, attributes);
    //log
    console.log(
      `NFTStaked event captured. Staker: ${staker}, TokenId: ${tokenId}`
    );
    console.log(`Attributes at ${tokenId} are: `, getAttributes(tokenId));
  });

  // Listen for NFTUnstaked events
  contract.on("NFTUnstaked", (unstaker, tokenId, event) => {
    // Remove the attributes for the tokenId from the in-memory cache
    removeCache(unstaker, tokenId);
    console.log(
      `NFTUnstaked event captured. Unstaker: ${unstaker}, TokenId: ${tokenId}`
    );
    console.log(`Attributes at ${tokenId} are: `, getAttributes(tokenId));
  });
}

function updateCache(staker, tokenId, attributes) {
  // Update the tokenId -> attributes cache
  updateToken(tokenId.toString(), attributes);
  //Update the address -> tokenIds
  updateWallet(staker, tokenId);
}

async function removeCache(unstaker, tokenId) {
  //retrieve the current attributes from cache update on chain attributes and remove the tokenId from the cache
  const attributes = getAttributes(tokenId);

  //Update on-chain data using the retrieved attributes
  try {
    // Assuming you have a function in your smart contract to update attributes on-chain

    await contract.setAttributes(tokenId, attributes);
    console.log("cache attributes are:", attributes);
    // Successfully updated on-chain data, now proceed to Step 3

    // Step 3: Remove the token ID from the cache
    cache.del(tokenId.toString());
  } catch (error) {
    // Handle any errors that might occur during the on-chain update
    console.error("Error updating on-chain data:", error);
    // Optionally, you can choose to leave the data in the cache if the on-chain update fails
    // Alternatively, you can retry the on-chain update later.
  }
}

function updateToken(tokenId, attributes) {
  cache.set(tokenId.toString(), attributes);
}

function updateWallet(walletAddress, tokenId) {
  // Get the existing staked token IDs for the wallet address from the cache (if any)
  const stakedTokens = cache.get(walletAddress) || new Set();

  // Add the new staked token ID to the set
  stakedTokens.add(tokenId);

  // Update the cache with the updated set of staked token IDs for the wallet address
  cache.set(walletAddress, stakedTokens);
}

// Function to retrieve staked token IDs for a given wallet address from the cache
function getStakedTokens(walletAddress) {
  // Get the staked token IDs for the wallet address from the cache (if any)
  return cache.get(walletAddress) || new Set();
}

// Function to retrieve attributes for a token ID from the cache
function getAttributes(tokenId) {
  // Get the attributes for the token ID from the cache
  return cache.get(tokenId.toString()) || null;
}

// Start the event capture process
startEventCapture();
