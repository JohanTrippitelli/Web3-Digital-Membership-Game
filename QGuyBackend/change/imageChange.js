const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const { storeImages } = require("../utils/uploadToPinata");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

async function updateNFTImages() {
  const newImageURLs = []; // Array of new image URLs or IPFS hashes
  const imagesLocation = "./images/newImages";

  let provider;
  let signer;

  if (process.env.UPLOAD_TO_PINATA == "true") {
    const { responses: imageUploadResponses, files } = await storeImages(
      imagesLocation
    );
    for (imageIndex in imageUploadResponses) {
      newImageURLs.push(`ipfs://${imageUploadResponses[imageIndex].IpfsHash}`);
    }
    console.log("Image URIs uploaded. They are:");
    console.log(newImageURLs);
  }

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

  const tokenCount = await smartContract.getTokenCounter();

  for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
    const setImageTx = await smartContract.setImage(
      tokenId,
      newImageURLs[tokenId]
    );
    await setImageTx.wait();
    console.log(`Updated image for NFT with tokenId: ${tokenId}`);
  }

  console.log("NFT image update completed.");
  console.log(
    `The updated token URI at index 0 is: ${await smartContract.tokenURI(0)}`
  );
}

updateNFTImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
