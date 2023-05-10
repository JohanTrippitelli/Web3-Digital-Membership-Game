const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
const fit =
  '"fit": [{"trait_type": "suit", "value": "diamonds"}, {"trait_type": "head", "value": "none"}, {"trait_type": "outer_chest", "value": "none"}, {"trait_type": "inner_chest", "none": "nude"}, {"trait_type": "legs", "value": "none"}, {"trait_type": "feet", "value": "none"},],';
const attributes =
  '"attributes": [{"trait_type": "Rank", "value": "King"}, {"trait_type": "suit", "value": "diamonds"},';
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const membership_status = 1;

  const lowSVG = fs.readFileSync("./images/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = fs.readFileSync("./images/happy.svg", {
    encoding: "utf8",
  });

  log("----------------------------------------------------");
  arguments = [membership_status, lowSVG, highSVG, fit, attributes];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
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
    await verify(dynamicSvgNft.address, arguments);
  }
};

module.exports.tags = ["all", "dynamicsvg", "main"];
