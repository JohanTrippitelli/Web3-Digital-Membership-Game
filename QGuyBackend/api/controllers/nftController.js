const { network, ethers } = require("hardhat");
const { createClient } = require("redis");
const contract = require("../../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const { storeImages } = require("../../utils/uploadToPinata");
const { addTransactionSupport } = require("ioredis/built/transaction");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;
let deployer;

//Set up RedisClient Server
let redisClient = createClient();

redisClient.on("ready", () => {
  console.log("Connected!");
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
Connect();

async function Connect() {
  await redisClient.connect();
}

// Set up image mapping
let imageMap; // Array of new image URLs or IPFS hashes
const imagesLocation = "./images/dynamicTesting";
imageMapping();

async function imageMapping() {
  if (process.env.UPLOAD_TO_PINATA == "true") {
    imageMap = await storeImages(imagesLocation);

    console.log("Image URIs uploaded to Mapping. They have keys:");
    console.log(Object.keys(imageMap));
  }
}

// Set up a mapping for the mint fee price based on the value of the card
const mintFeeMap = {
  2: "1",
  3: "1",
  4: "1",
  5: "1",
  6: "1",
  7: "1",
  8: "1",
  9: "1",
  10: "1",
  J: "1.5",
  Q: "2",
  K: "2.5",
  A: "3",
};

// Set up Attributes map start with a map with all the face value cards
const attributesMap = {
  JH: '[{"trait_type": "Rank", "value": "J"},{"trait_type": "suit", "value": "H"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  JS: '[{"trait_type": "Rank", "value": "J"},{"trait_type": "suit", "value": "S"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  JC: '[{"trait_type": "Rank", "value": "J"},{"trait_type": "suit", "value": "C"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  JD: '[{"trait_type": "Rank", "value": "J"},{"trait_type": "suit", "value": "D"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  QH: '[{"trait_type": "Rank", "value": "Q"},{"trait_type": "suit", "value": "H"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  QS: '[{"trait_type": "Rank", "value": "Q"},{"trait_type": "suit", "value": "S"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  QC: '[{"trait_type": "Rank", "value": "Q"},{"trait_type": "suit", "value": "C"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  QD: '[{"trait_type": "Rank", "value": "Q"},{"trait_type": "suit", "value": "D"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  KH: '[{"trait_type": "Rank", "value": "K"},{"trait_type": "suit", "value": "H"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  KS: '[{"trait_type": "Rank", "value": "K"},{"trait_type": "suit", "value": "S"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  KC: '[{"trait_type": "Rank", "value": "K"},{"trait_type": "suit", "value": "C"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  KD: '[{"trait_type": "Rank", "value": "K"},{"trait_type": "suit", "value": "D"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  AH: '[{"trait_type": "Rank", "value": "A"},{"trait_type": "suit", "value": "H"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  AS: '[{"trait_type": "Rank", "value": "A"},{"trait_type": "suit", "value": "S"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  AC: '[{"trait_type": "Rank", "value": "A"},{"trait_type": "suit", "value": "C"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
  AD: '[{"trait_type": "Rank", "value": "A"},{"trait_type": "suit", "value": "D"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]',
};

// Now using a for loop set all the values of the integer cards
attributesMapping();
async function attributesMapping() {
  for (i = 2; i <= 10; i++) {
    // Define each of the number/suit pairs for i
    const hearts = i.toString() + "H";
    const spades = i.toString() + "S";
    const clubs = i.toString() + "C";
    const diamonds = i.toString() + "D";

    // Add these pairings to the mapping
    attributesMap[
      hearts
    ] = `[{"trait_type": "Rank", "value": "${i.toString()}"},{"trait_type": "suit", "value": "H"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]`;
    attributesMap[
      spades
    ] = `[{"trait_type": "Rank", "value": "${i.toString()}"},{"trait_type": "suit", "value": "S"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]`;
    attributesMap[
      clubs
    ] = `[{"trait_type": "Rank", "value": "${i.toString()}"},{"trait_type": "suit", "value": "C"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]`;
    attributesMap[
      diamonds
    ] = `[{"trait_type": "Rank", "value": "${i.toString()}"},{"trait_type": "suit", "value": "D"}, {"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "none"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]`;
  }
}

// Set up provider and signer
if (process.env.NODE_ENV === "localhost") {
  // Use localhost provider for development
  provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  deployer = provider.getSigner();
} else if (process.env.NODE_ENV === "ganache") {
  // Use localhost provider for development
  provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
  deployer = provider.getSigner();
} else if (process.env.NODE_ENV === "testnet") {
  // Use Goerli testnet provider for production
  provider = new ethers.providers.AlchemyProvider(
    "goerli", // Provide the network value directly
    API_KEY
  );
  // Connect the signer to a wallet using the private key or mnemonic phrase of the account
  deployer = new ethers.Wallet(PRIVATE_KEY, provider);
} else {
  throw new Error("Invalid environment specified.");
}
const smartContractDeployer = new ethers.Contract(
  CONTRACT_ADDRESS,
  abi,
  deployer
);

//Mint function
async function mintNFT(privateKey, name, eth) {
  // Convert mintFee to Ether if needed
  const value = name[0];
  const mintFee = mintFeeMap[value];
  const mintFeeInEther = ethers.utils.parseEther(mintFee);

  const imageURL = imageMap[name];
  const attributes = attributesMap[name];

  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance with the correct signer
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  try {
    const mintTx = await smartContract.mintNft(
      1,
      imageURL,
      attributes,
      mintFeeInEther,
      {
        value: ethers.utils.parseEther(eth), // Convert eth to Wei and set it as msg.value
      }
    );
    await mintTx.wait();
    // return success if successful
    return { success: true, message: "NFT minted successfully" };
  } catch (error) {
    let revertReason = extractRevertReason(error.message);
    if (revertReason == null) {
      revertReason = error.message;
    }
    console.error("Error minting NFT:", revertReason);
    return { success: false, message: "Error minting NFT: " + revertReason };
  }
}

// Function to stake an NFT
async function stakeNFT(tokenId, walletAddress, privateKey) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.stakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    let stakedTokens, printStakedTokens;

    stakedTokens = await getValueFromRedis(walletAddress);
    if (stakedTokens == null) {
      printStakedTokens = "No Tokens at All";
    } else {
      printStakedTokens = stakedTokens;
    }
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} before staking`
    );

    //Extract on chain attributes and fit to update cache
    const attributes = await smartContract.getAttributes(tokenId);
    await updateCache(walletAddress, tokenId, attributes);

    //Get the wallet address' tokens
    stakedTokens = await getValueFromRedis(walletAddress);
    if (stakedTokens == null) {
      printStakedTokens = "No Tokens at All";
    } else {
      printStakedTokens = stakedTokens;
    }
    //logs
    console.log(
      `Attributes at ${tokenId} are: `,
      await getValueFromRedis(tokenId)
    );
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} after staking`
    );

    // return success if successful
    return { success: true, message: "NFT staked successfully" };
  } catch (error) {
    let revertReason = extractRevertReason(error.message);
    if (revertReason == null) {
      revertReason = error.message;
    }
    console.error("Error staking NFT:", revertReason);
    return { success: false, message: "Error staking NFT: " + revertReason };
  }
}

// Function to stake an NFT
async function unstakeNFT(tokenId, walletAddress, privateKey) {
  // Create a new signer using the private key and the provider
  const signer = new ethers.Wallet(privateKey, provider);
  // Create a contract instance
  const smartContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  try {
    // Perform the staking operation using the contract's staking function
    const stakingTx = await smartContract.unstakeNFT(tokenId);

    // Wait for the transaction to be mined
    await stakingTx.wait();

    let stakedTokens, printStakedTokens;

    stakedTokens = await getValueFromRedis(walletAddress);
    if (stakedTokens == null) {
      printStakedTokens = "No Tokens at All";
    } else {
      printStakedTokens = stakedTokens;
    }
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} before unstaking`
    );

    // Remove the attributes for the tokenId from the in-memory cache
    await removeCache(walletAddress, tokenId, smartContract);

    stakedTokens = await getValueFromRedis(walletAddress);
    if (stakedTokens == null) {
      printStakedTokens = "No Tokens at All";
    } else {
      printStakedTokens = stakedTokens;
    }
    //logs
    console.log(
      `Attributes at ${tokenId} are: `,
      await getValueFromRedis(tokenId)
    );
    console.log(
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} after unstaking`
    );

    // return success if successful
    return { success: true, message: "NFT unstaked successfully" };
  } catch (error) {
    const revertReason = extractRevertReason(error.message);
    console.error("Error unstaking NFT:", revertReason);
    return { success: false, message: "Error unstaking NFT: " + revertReason };
  }
}

//Retrieval of Attributes from the cache
async function getNFTAttributes(tokenId) {
  try {
    // Retrieve attributes from your off-chain database
    const attributes = await getValueFromRedis(tokenId);
    if (attributes != null) {
      return { success: true, attributes };
    } else {
      return {
        success: false,
        message: "Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error getting NFT attributes:", error);
    return { success: false, message: "Error getting NFT attributes" };
  }
}

//Retrieval of Backup Attributes from the cache
async function getNFTAttributesBackup(tokenId) {
  try {
    // Retrieve attributes from your off-chain database
    const attributes = await getValueFromRedis(tokenId + "Backup");
    if (attributes != null) {
      return { success: true, attributes };
    } else {
      return {
        success: false,
        message: "Backup Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error getting Backup NFT attributes:", error);
    return { success: false, message: "Error getting Backup NFT attributes" };
  }
}

//Retrieval of the tokenIds owned by the given smartContract
async function getNewTokenIdForWallet(walletAddress) {
  try {
    // Call the smart contract's balanceOf
    const balance = await smartContractDeployer.balanceOf(walletAddress);

    // Retrieve tokenIds owned by the wallet using tokenOfOwnerByIndex
    const tokenIds = [];
    for (let index = 0; index < balance; index++) {
      const tokenId = await smartContractDeployer.tokenOfOwnerByIndex(
        walletAddress,
        index
      );
      tokenIds.push(tokenId);
    }

    return tokenIds;
  } catch (error) {
    console.error("Error getting tokenIds for wallet:", error);
    return [];
  }
}

async function upgradeAttributes(tokenId) {
  try {
    // Retrieve attributes from your off-chain database
    const attributes = await getValueFromRedis(tokenId);
    if (attributes != null) {
      // Convert the attributes string into a JSON object
      const jsonObject = JSON.parse(attributes);
      // Extract the value from the JSON object
      // Find the object with "trait_type" of "Rank"
      const cardTrait = jsonObject.find((obj) => obj.trait_type === "Rank");
      const cardValue = cardTrait.value;
      // Upgrade accordingly
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
        cardTrait.value = "J";
      } else if (cardValue == "J") {
        cardTrait.value = "Q";
      } else if (cardValue == "Q") {
        cardTrait.value = "K";
      } else if (cardValue == "K") {
        cardTrait.value = "A";
      }
      // Change the backup
      const tokenBackup = tokenId + "Backup";
      const attributesBackup = getValueFromRedis(tokenBackup);
      // Convert the backup attributes string into a JSON object
      const jsonObjectBackup = JSON.parse(attributesBackup);
      // Find the object with "trait_type" of "Rank"
      const cardTraitBackup = jsonObjectBackup.find(
        (obj) => obj.trait_type === "Rank"
      );
      cardTraitBackup.value = cardTrait.value;

      // Turn the new result back into a string
      const updatedAttributes = JSON.stringify(jsonObject);
      const updatedAttributesbackup = JSON.stringify(jsonObjectBackup);
      // Set the key value pair in the cache
      await setValueInRedis(tokenId, updatedAttributes);
      await setValueInRedis(tokenBackup, updatedAttributesbackup);
      return { success: true, updatedAttributes };
    } else {
      return {
        success: false,
        message: "Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error upgrading the NFT attributes:", error);
    return { success: false, message: "Error upgrading the NFT attributes" };
  }
}

// Function to change the suit of the card
async function switchSuit(tokenId, newSuit) {
  try {
    // Retrieve attributes from your off-chain database
    const attributes = await getValueFromRedis(tokenId);
    if (attributes != null) {
      // Convert the attributes string into a JSON object
      const jsonObject = JSON.parse(attributes);
      // Find the object with "trait_type" of "suit"
      const cardTrait = jsonObject.find((obj) => obj.trait_type === "suit");
      cardTrait.value = newSuit;

      // Extract and alter the backup suit
      const tokenBackup = tokenId + "Backup";
      const attributesBackup = getValueFromRedis(tokenBackup);
      // Convert the backup attributes string into a JSON object
      const jsonObjectBackup = JSON.parse(attributesBackup);
      // Find the object with "trait_type" of "suit"
      const cardTraitBackup = jsonObjectBackup.find(
        (obj) => obj.trait_type === "suit"
      );
      cardTraitBackup.value = cardTrait.value;

      // Turn the new result back into a string
      const updatedJson = JSON.stringify(jsonObject);
      const updatedJsonBackup = JSON.stringify(jsonObjectBackup);
      // Set the key value pair in the cache
      await setValueInRedis(tokenId, updatedJson);
      await setValueInRedis(tokenBackup, updatedJsonBackup);
      return { success: true, updatedJson };
    } else {
      return {
        success: false,
        message: "Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error changing the NFT suit:", error);
    return { success: false, message: "Error changing the NFT suit" };
  }
}

async function setFit(tokenId, bodyPart, newFit) {
  try {
    const attributes = await getValueFromRedis(tokenId);
    if (attributes != null) {
      // Convert the attributes string into a JSON object
      const jsonObject = JSON.parse(attributes);
      // Find the object with "trait_type" of bodyPart
      const cardTrait = jsonObject.find((obj) => obj.trait_type === bodyPart);
      cardTrait.value = newFit;
      // Turn the new result back into a string
      const updatedJson = JSON.stringify(jsonObject);
      // Set the key value pair in the cache
      await setValueInRedis(tokenId, updatedJson);
      return { success: true, updatedJson };
    } else {
      return {
        success: false,
        message: "Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error changing the NFT Fit:", error);
    return { success: false, message: "Error changing the NFT Fit" };
  }
}

async function setFitBackup(tokenId, bodyPart, newFit) {
  try {
    const tokenBackup = tokenId + "Backup";
    const attributes = await getValueFromRedis(tokenBackup);
    if (attributes != null) {
      // Convert the attributes string into a JSON object
      const jsonObject = JSON.parse(attributes);
      // Find the object with "trait_type" of bodyPart
      const cardTrait = jsonObject.find((obj) => obj.trait_type === bodyPart);
      cardTrait.value = newFit;
      // Turn the new result back into a string
      const updatedJson = JSON.stringify(jsonObject);
      // Set the key value pair in the cache
      await setValueInRedis(tokenBackup, updatedJson);
      return { success: true, updatedJson };
    } else {
      return {
        success: false,
        message: "Attributes not found for the given tokenId",
      };
    }
  } catch (error) {
    console.error("Error changing the NFT Fit:", error);
    return { success: false, message: "Error changing the NFT Fit" };
  }
}

async function switchFits(tokenId) {
  try {
    // Extract fit and backup
    const tokenBackup = tokenId + "Backup";
    const fit = await getValueFromRedis(tokenId);
    const backupFit = await getValueFromRedis(tokenBackup);
    // Set fits swapped
    await setValueInRedis(tokenId, backupFit);
    await setValueInRedis(tokenBackup, fit);
    return { success: true, message: "Fits were successfuly swapped" };
  } catch (error) {
    console.error("Error switching fits", error);
    return { success: false, message: "Error switching fits" };
  }
}

async function updateCache(walletAddress, tokenId, attributes) {
  console.log("Adding Key ------------------------------------");
  let stakedTokens, stakersTokens;
  // Update the tokenId -> attributes
  await setValueInRedis(tokenId, attributes);

  // Set the tokenBackup -> attributes to empty
  const tokenBackup = tokenId + "Backup";
  // Extract the Rank and Suit from the attributes
  const jsonObject = JSON.parse(attributes);
  // Extract elements with "trait_type" values of "Rank" and "suit"
  const RankSuitElements = jsonObject.filter(
    (item) => item.trait_type === "Rank" || item.trait_type === "suit"
  );
  const additionalElements = [
    { trait_type: "head", value: "none" },
    { trait_type: "outer_chest", value: "none" },
    { trait_type: "inner_chest", value: "none" },
    { trait_type: "legs", value: "none" },
    { trait_type: "feet", value: "none" },
  ];
  // Concatenate the arrays
  const attributesBackup = RankSuitElements.concat(additionalElements);
  const attributesBackupString = JSON.stringify(attributesBackup);
  await setValueInRedis(tokenBackup, attributesBackupString);
  // Check to see if the walletAddress has any tokens associated with it
  stakedTokens = await getValueFromRedis(walletAddress);
  if (!stakedTokens) {
    // If stakedTokens is null or undefined, initialize an empty array
    stakersTokens = [tokenId];
  } else if (Array.isArray(stakedTokens)) {
    // If stakedTokens is already an array, push the tokenId
    stakedTokens.push(tokenId);
    stakersTokens = stakedTokens;
  } else {
    // If stakedTokens is neither null nor an array, handle it as needed (e.g., convert to an array)
    stakersTokens = [tokenId];
  }
  // Update the address -> tokenIds
  await setValueInRedis(walletAddress, stakersTokens);
}

async function removeCache(walletAddress, tokenId, contract) {
  console.log("Deleting Key ------------------------------------");
  //Update on-chain data using the retrieved attributes
  try {
    // Update attributes on-chain
    const attributes = await getValueFromRedis(tokenId);
    const unstakingTx = await smartContractDeployer.setAttributes(
      tokenId,
      attributes
    );
    await unstakingTx.wait();

    // Convert the attributes string into a JSON object
    const jsonObject = JSON.parse(attributes);
    // Find the object with "trait_type" of "Rank"
    const rank = jsonObject.find((obj) => obj.trait_type === "Rank");
    const rankValue = rank.value;
    const suit = jsonObject.find((obj) => obj.trait_type === "suit");
    const suitValue = suit.value;
    const name = rankValue + suitValue;

    // Change the on chain image
    smartContractDeployer.setImage(tokenId, imageMap[name]);

    //Remove the tokenId key
    await deleteKeyFromRedis(tokenId);
    // Remove the token ID from the list of the walletAdress
    const stakedTokens = await getValueFromRedis(walletAddress);
    if (stakedTokens.length == 1) {
      //walletAddress previously owned only this token therefore delete the key
      await deleteKeyFromRedis(walletAddress);
    } else {
      //walletAddress owned multiple tokens therefore remove this one from the list
      // Find the index of the element to remove
      const indexToRemove = stakedTokens.indexOf(tokenId);

      if (indexToRemove !== -1) {
        // If the element exists in the array, remove it using splice
        myList.splice(indexToRemove, 1);
        console.log("Element removed successfully:", tokenId);
      } else {
        console.log("Element not found in the list.");
      }
    }
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

// Function to get a value from Redis
async function getValueFromRedis(key) {
  try {
    const value = await redisClient.get(key.toString());
    return value;
  } catch (error) {
    return null;
  }
}

// Function to set a value in Redis
async function setValueInRedis(key, value) {
  try {
    await redisClient.set(key.toString(), value.toString());
    return true;
  } catch (error) {
    console.error("Error setting value in Redis:", error);
    return false;
  }
}

// Function to delete a key from Redis
async function deleteKeyFromRedis(key) {
  try {
    await redisClient.del(key.toString());
    return true;
  } catch (error) {
    console.error("Error deleting key from Redis:", error);
    return false;
  }
}

module.exports = {
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
};
