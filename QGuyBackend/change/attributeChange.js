const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const { storeImages } = require("../utils/uploadToPinata");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

async function updateNFTAttributes() {
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

  const tokenuri = await smartContract.tokenURI(0);
  console.log("Acquired token URI is:", tokenuri);

  // Extract the Base64 portion of the tokenURI
  var base64Data = tokenuri.split(",")[1];

  // Decode the Base64 string
  const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
  // Parse the JSON string into a JavaScript object
  var jsonObject = JSON.parse(decodedData);

  // Now you can access the properties of the JSON object
  const cardTrait = jsonObject.attributes.find(
    (trait) => trait.trait_type === "Rank"
  );
  const cardValue = cardTrait.value;

  if (cardValue == "2") {
    cardTrait.value = "3";
  } else if (cardValue == "3") {
    cardTrait.value = "4";
  } else if (cardValue == "4") {
    cardTrait.value = "5";
  } else if (cardValue == "5") {
    cardTrait.value = "6";
  } else if (cardValue == "6") {
    cardTrait.value = "7";
  } else if (cardValue == "7") {
    cardTrait.value = "8";
  } else if (cardValue == "8") {
    cardTrait.value = "9";
  } else if (cardValue == "9") {
    cardTrait.value = "10";
  } else if (cardValue == "10") {
    cardTrait.value = "Jack";
  } else if (cardValue == "Jack") {
    cardTrait.value = "Queen";
  } else if (cardValue == "Queen") {
    cardTrait.value = "King";
  } else if (cardValue == "King") {
    cardTrait.value = "Ace";
  }

  const newAttributes = jsonObject.attributes;
  const updatedAttributes = JSON.stringify(newAttributes);

  await smartContract.setAttributes(0, updatedAttributes);

  console.log("Updated attributes are:", updatedAttributes);
  console.log("Updated Token URI is:", await smartContract.tokenURI(0));
}

updateNFTAttributes().catch((error) => {
  console.error(error);
  process.exit(1);
});
