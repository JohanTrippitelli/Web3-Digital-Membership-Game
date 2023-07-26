const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

async function stake() {
  let provider;
  let signer;

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

  await smartContract.stakeNFT(0);
  console.log("Staking complete");
}

stake().catch((error) => {
  console.error(error);
  process.exit(1);
});
