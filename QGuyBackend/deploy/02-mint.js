const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts;

  //Dynamic SVG
  const membership_status = 0;
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(membership_status);
  await dynamicSvgNftMintTx.wait(1);

  console.log(
    `Dynamic SVG NFT index 0 Token URI: ${await dynamicSvgNft.tokenURI(0)}`
  );
};
