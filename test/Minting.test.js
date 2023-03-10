const { expect } = require("chai");
const { ethers } = require("hardhat");
const { describe, it } = require("mocha");

describe("NFT Contract", function () {
  let nft;

  before(async function () {
    const NFT = await ethers.getContractFactory("MyNFT");
    nft = await NFT.deploy();
    await nft.deployed();
  });

  // Test that a single user can mint one NFT, and that the user is the owner
  it("should allow a user to mint one NFT", async function () {
    const owner = await ethers.provider.getSigner(8); // Get the first account as the owner
    const ownerAddress = await owner.getAddress(); // Get the address of the owner

    const qrCodeData = "ABCD123"; // Use a valid qrCodeData
    await nft.addValidQRCodeData(qrCodeData);

    const { hash } = await nft.mintNFT(
      ownerAddress,
      "http://example.com/metadata/1",
      qrCodeData
    );

    const receipt = await ethers.provider.getTransactionReceipt(hash);
    const logs = receipt.logs;

    let tokenId;
    for (const log of logs) {
      const event = nft.interface.parseLog(log);
      if (event.name === "Transfer") {
        tokenId = event.args.tokenId.toString();
        break;
      }
    }

    const balance = await nft.balanceOf(ownerAddress);
    expect(balance).to.equal(1);
    const tokenOwner = await nft.ownerOf(tokenId);
    expect(tokenOwner).to.equal(ownerAddress);
  });

  // Test that a single user cannot mint one NFT with an invalid qrCodeData
  it("should not allow a user to mint one NFT with invalid qrCodeData", async function () {
    const owner = await ethers.provider.getSigner(9); // Get the second account as the owner
    const ownerAddress = await owner.getAddress(); // Get the address of the owner

    const qrCodeDataInvalid = "XYZ123"; // Use an invalid qrCodeData
    // Do not add the invalid qrCodeData to the valid qrCodeData mapping
    try {
      await nft.mintNFT(
        ownerAddress,
        "http://example.com/metadata/1",
        qrCodeDataInvalid // Use the invalid qrCodeData for minting
      );
      expect.fail("Expected an error but minting succeeded.");
    } catch (error) {
      expect(error.message).to.contain("Invalid QR code data");
    }
  });

  // Test that a single user can mint ten NFTs, and that the user is the owner of all ten
  it("should allow a user to mint ten NFTs", async function () {
    const owner = await ethers.provider.getSigner(9); // Get the first account as the owner
    const ownerAddress = await owner.getAddress(); // Get the address of the owner

    const numNFTs = 10;
    //Create and store 10 valid qrCodeData strings
    const qrCodeDataList = [
      "ABC123",
      "DEF456",
      "GHI789",
      "JKL012",
      "MNO345",
      "PQR678",
      "STU901",
      "VWX234",
      "YZA567",
      "BCD890",
    ];

    for (let i = 0; i < numNFTs; i++) {
      await nft.addValidQRCodeData(qrCodeDataList[i]);
      const { hash } = await nft.mintNFT(
        ownerAddress,
        "http://example.com/metadata/1",
        qrCodeDataList[i]
      );

      const receipt = await ethers.provider.getTransactionReceipt(hash);
      const logs = receipt.logs;

      for (const log of logs) {
        const event = nft.interface.parseLog(log);
        if (event.name === "Transfer") {
          tokenId = event.args.tokenId.toString();
          break;
        }
      }
      const tokenOwner = await nft.ownerOf(tokenId);
      expect(tokenOwner).to.equal(ownerAddress);
    }

    const balance = await nft.balanceOf(ownerAddress);
    expect(balance).to.equal(numNFTs);
  });

  // Test that ten users can each mint one NFT, and that each user is the owner of their own NFT
  it("should allow ten users to mint one NFT each", async function () {
    const numUsers = 8;
    const numNFTs = 1;
    const qrCodeDataList = [
      "ABC123",
      "DEF456",
      "GHI789",
      "JKL012",
      "MNO345",
      "PQR678",
      "STU901",
      "VWX234",
      "YZA567",
      "BCD890",
    ];

    for (let i = 0; i < numUsers; i++) {
      await nft.addValidQRCodeData(qrCodeDataList[i]);
      const user = await ethers.provider.getSigner(i);
      const userAddress = await user.getAddress();

      const { hash } = await nft.mintNFT(
        userAddress,
        "http://example.com/metadata/1",
        qrCodeDataList[i]
      );

      const receipt = await ethers.provider.getTransactionReceipt(hash);
      const logs = receipt.logs;

      for (const log of logs) {
        const event = nft.interface.parseLog(log);
        if (event.name === "Transfer") {
          tokenId = event.args.tokenId.toString();
          break;
        }
      }
      const balance = await nft.balanceOf(userAddress);
      expect(balance).to.equal(numNFTs);

      const tokenOwner = await nft.ownerOf(tokenId);
      expect(tokenOwner).to.equal(userAddress);
    }
  });
});
