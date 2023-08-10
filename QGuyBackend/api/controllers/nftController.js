const { network, ethers } = require("hardhat");
const { createClient } = require("redis");
const contract = require("../../artifacts/contracts/DynamicPngNft.sol/DynamicPngNft.json");
const { addTransactionSupport } = require("ioredis/built/transaction");
const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const abi = contract.abi;

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
const deployer = provider.getSigner();
const smartContractDeployer = new ethers.Contract(
  CONTRACT_ADDRESS,
  abi,
  deployer
);

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

    //Extract on chain attributes and update cache
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
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} before staking`
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
      `Wallet at address ${walletAddress} currently owns token ${printStakedTokens} after staking`
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
      // Turn the new result back into a string
      const updatedAttributes = JSON.stringify(jsonObject);
      // Set the key value pair in the cache
      await setValueInRedis(tokenId, updatedAttributes);
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

async function updateCache(walletAddress, tokenId, attributes) {
  console.log("Adding Key ------------------------------------");
  let stakedTokens, stakersTokens;
  // Update the tokenId -> attributes
  await setValueInRedis(tokenId, attributes);
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
  stakeNFT,
  unstakeNFT,
  getNFTAttributes,
  getNewTokenIdForWallet,
  upgradeAttributes,
};
