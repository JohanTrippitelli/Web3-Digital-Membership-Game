const hre = require("hardhat");
const fs = require("fs");
const { ethers } = hre;
const { parseEther } = ethers.utils;
const { writeFileSync } = fs;

async function main() {
  // Deploy the NFT contract
  const NFT = await ethers.getContractFactory("MyNFT"); // Load the NFT contract factory
  const nft = await NFT.deploy({
    gasLimit: 5000000,
    gasPrice: ethers.utils.parseUnits("30", "gwei"),
  });
  // Deploy the NFT contract to the network with gas limit and gasPrice

  // Wait for the contract to be deployed
  await nft.deployed();

  console.log(`NFT contract deployed`);
  // Log a message indicating that the NFT has been deployed

  const contractAddress = nft.address;
  writeFileSync("./contract-address.txt", contractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
