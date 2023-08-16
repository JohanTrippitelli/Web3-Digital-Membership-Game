// Imports
const { ethers } = require("ethers");
const contract = require("../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");

const contractAddress = process.env.CONTRACT_ADDRESS; //Deployed contract address
const contractABI = contract.abi;
const API_KEY = process.env.API_KEY;

async function startEventCapture() {
  // Set up Ethereum provider (e.g., Hardhat provider or ethers.providers.JsonRpcProvider)
  console.log("Setting up Provider");
  if (process.env.NODE_ENV === "development") {
    // Use localhost provider and signer for development
    provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  } else if (process.env.NODE_ENV === "testnet") {
    // Use Goerli testnet provider and signer for production
    provider = new ethers.providers.AlchemyProvider(
      (network = "goerli"),
      API_KEY
    );
  } else {
    throw new Error("Invalid environment specified.");
  }
  console.log("---------------------------------------");

  // Connect to the contract using the ABI and contract address
  const smartContract = new ethers.Contract(
    contractAddress,
    contractABI,
    provider
  );

  console.log("Listening for an Event");

  // Listen for NFTStaked events
  smartContract.on("NFTStaked", async (staker, tokenId, event) => {
    //log
    console.log(
      `NFTStaked event captured. Staker: ${staker}, TokenId: ${tokenId}`
    );
  });

  // Listen for NFTUnstaked events
  smartContract.on("NFTUnstaked", (unstaker, tokenId, event) => {
    console.log(
      `NFTUnstaked event captured. Unstaker: ${unstaker}, TokenId: ${tokenId}`
    );
  });
}

// Start the event capture process
startEventCapture();
