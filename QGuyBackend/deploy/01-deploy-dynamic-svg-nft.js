const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const mintFee = ethers.utils.parseEther("0.01"); // Set the mint fee to 0.01 ETH

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  arguments = [mintFee];
  const dynamicPngNft = await deploy("DynamicPngNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dynamicPngNft.address, arguments);
  }

  // Log the contract address
  console.log("Contract deployed at:", dynamicPngNft.address);
};

module.exports.tags = ["all", "dynamicpng", "main"];
