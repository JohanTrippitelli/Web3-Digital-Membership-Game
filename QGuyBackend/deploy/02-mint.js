const { ethers, deployments } = require("hardhat");
const { storeImages } = require("../utils/uploadToPinata");

//Specify the base metaData
const fit =
  '[{"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "nude"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]';
const attributes =
  '[{"trait_type": "Rank", "value": "K"},{"trait_type": "suit", "value": "H"}]';
const attributes2 =
  '[{"trait_type": "Rank", "value": "Q"},{"trait_type": "suit", "value": "S"}]';

//Specify the image pathways
const imagesLocation = "./images/dynamicTesting";
let imageMapping;

module.exports = async function ({ getNamedAccounts }) {
  //set the base image array
  if (process.env.UPLOAD_TO_PINATA == "true") {
    imageMapping = await storeImages(imagesLocation);

    console.log("Image URIs uploaded to Mapping. They have keys:");
    console.log(Object.keys(imageMapping));
  }

  //Take the initial image as the deployed image
  PNG = imageMapping["KH"];

  // Retrieve the deployed contract
  const dynamicPngNft = await deployments.get("DynamicPngNft");
  const dynamicPngNftContract = await ethers.getContractAt(
    "DynamicPngNft",
    dynamicPngNft.address
  );

  // Dynamic Png
  const membership_status = 1;
  const mintFee = ethers.utils.parseEther("0.01"); // Set the mint fee to 0.01 ETH
  const dynamicPngNftMintTx = await dynamicPngNftContract.mintNft(
    membership_status,
    PNG,
    attributes,
    fit,
    false,
    { value: mintFee } // Pass the mint fee as the value field in the transaction
  );
  await dynamicPngNftMintTx.wait(1);

  const dynamicPngNftMintTx2 = await dynamicPngNftContract.mintNft(
    membership_status,
    PNG,
    attributes2,
    fit,
    false,
    {
      value: mintFee,
    }
  );
  await dynamicPngNftMintTx2.wait(1);

  // Transfer NFT to another address
  const accounts = await ethers.getSigners();
  const recipient = accounts[0].address;
  const deployer = accounts[0];
  await dynamicPngNftContract.transferFrom(deployer.address, recipient, 1);

  const tokenId = 0;

  console.log(
    `Dynamic PNG NFT index ${tokenId} Token URI: ${await dynamicPngNftContract.tokenURI(
      tokenId
    )}`
  );
};

module.exports.tags = ["all", "mint"];
