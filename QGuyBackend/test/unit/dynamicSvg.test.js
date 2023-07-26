const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { getTimeLeft, getTimeRaw, startTimer } = require("../../timer/timer.js");

const mintFee = ethers.utils.parseEther("0.01"); // Set the mint fee to 0.01 ETH
const originalImageURL =
  "ipfs://QmdBtZa6dD21P3NzeXhsCeVfGF9wSbGNvq3iGEH9YY3BdB";
const alteredImageURL = "ipfs://QmbXU2B4Rh2LGrD3scLQ9VLgRtSD9pNA8BiprpJ8yrmBPv";
const originalURI =
  "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBQTkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiUSIsICJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjogIlJhbmsiLCAidmFsdWUiOiAiS2luZyJ9LHsidHJhaXRfdHlwZSI6ICJzdWl0IiwgInZhbHVlIjogImRpYW1vbmRzIn1dLCJmaXQiOlt7InRyYWl0X3R5cGUiOiAiaGVhZCIsICJ2YWx1ZSI6ICJub25lIn0seyJ0cmFpdF90eXBlIjogIm91dGVyX2NoZXN0IiwgInZhbHVlIjogIm5vbmUifSx7InRyYWl0X3R5cGUiOiAiaW5uZXJfY2hlc3QiLCAidmFsdWUiOiAibnVkZSJ9LHsidHJhaXRfdHlwZSI6ICJsZWdzIiwgInZhbHVlIjogIm5vbmUifSx7InRyYWl0X3R5cGUiOiAiZmVldCIsICJ2YWx1ZSI6ICJub25lIn1dLCJpbWFnZSI6ImlwZnM6Ly9RbWRCdFphNmREMjFQM056ZVhoc0NlVmZHRjl3U2JHTnZxM2lHRUg5WVkzQmRCIiwic3Rha2VkIjoiZmFsc2UifQ==";
const alteredURI =
  "data:application/json;base64,eyJuYW1lIjoiRHluYW1pYyBQTkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiUSIsICJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjogIlJhbmsiLCAidmFsdWUiOiAiS2luZyJ9LHsidHJhaXRfdHlwZSI6ICJzdWl0IiwgInZhbHVlIjogImRpYW1vbmRzIn1dLCJmaXQiOlt7InRyYWl0X3R5cGUiOiAiaGVhZCIsICJ2YWx1ZSI6ICJub25lIn0seyJ0cmFpdF90eXBlIjogIm91dGVyX2NoZXN0IiwgInZhbHVlIjogIm5vbmUifSx7InRyYWl0X3R5cGUiOiAiaW5uZXJfY2hlc3QiLCAidmFsdWUiOiAibnVkZSJ9LHsidHJhaXRfdHlwZSI6ICJsZWdzIiwgInZhbHVlIjogIm5vbmUifSx7InRyYWl0X3R5cGUiOiAiZmVldCIsICJ2YWx1ZSI6ICJub25lIn1dLCJpbWFnZSI6ImlwZnM6Ly9RbWJYVTJCNFJoMkxHckQzc2NMUTlWTGdSdFNEOXBOQThCaXBycEo4eXJtQlB2Iiwic3Rha2VkIjoiZmFsc2UifQ==";
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Dynamic PNG NFT Unit Tests", function () {
      let dynamicPngNft;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "dynamicpng"]);
        dynamicPngNft = await ethers.getContract("DynamicPngNft");
        initial_status = 1;
        initial_fit =
          '[{"trait_type": "head", "value": "none"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "nude"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]';
        initial_attributes =
          '[{"trait_type": "Rank", "value": "King"},{"trait_type": "suit", "value": "diamonds"}]';
      });

      describe("mintNft", () => {
        it("emits an event and creates the NFT with the original image and metadata", async function () {
          const status = 1; // membership status live
          await expect(
            dynamicPngNft.mintNft(
              status,
              originalImageURL,
              initial_attributes,
              initial_fit,
              false,
              { value: mintFee } // Pass the mint fee as the value field in the transaction
            )
          ).to.emit(dynamicPngNft, "CreatedNFT");
          const tokenCounter = await dynamicPngNft.getTokenCounter();
          assert.equal(tokenCounter.toString(), "1");
          const tokenURI = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenURI, originalURI);
        });

        it("alters the image when prompted and the membership status is one", async function () {
          const status = 1;
          const tokenId = 0;
          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );
          const tokenURI = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenURI, originalURI);

          //Now change the image using the setter function
          await dynamicPngNft.setImage(tokenId, alteredImageURL);
          const tokenURI2 = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenURI2, alteredURI);
        });

        it("does not alter the image when prompted and the membership status is 0", async function () {
          const status = 0;
          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );
          const tokenURI = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenURI, originalURI);

          //Now change the image using the setter function
          await dynamicPngNft.setImage(0, alteredImageURL);
          const tokenURI2 = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenURI2, originalURI);
        });
      });

      describe("Fit/Attribute altering", () => {
        it("sets the proper fit and attribute", async function () {
          const status = 0;
          const tokenuri = dynamicPngNft.tokenURI(0);
          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );
          const fit =
            '"fit": [{"trait_type": "head", "value": "hat"}, {"trait_type": "outer_chest", "value": "none"}, {"trait_type": "inner_chest", "none": "nude"}, {"trait_type": "legs", "value": "none"}, {"trait_type": "feet", "value": "none"},],';
          const attributes =
            '"attributes": [{"trait_type": "Rank", "value": "3"}, {"trait_type": "suit", "value": "diamonds"},';

          await dynamicPngNft.setFit(0, fit);
          await dynamicPngNft.setAttributes(0, attributes);

          const Fit = await dynamicPngNft.getFit(0);
          const Att = await dynamicPngNft.getAttributes(0);

          assert.equal(fit, Fit);
          assert.equal(Att, attributes);

          const uri = dynamicPngNft.tokenURI(0);
          assert.notEqual(uri, tokenuri);
        });
        it("collects JSON object from metadata and properly seperates sections", async function () {
          const status = 0;
          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );
          const tokenuri = await dynamicPngNft.tokenURI(0);
          assert.equal(tokenuri, originalURI);

          // Extract the Base64 portion of the tokenURI
          var base64Data = tokenuri.split(",")[1];

          // Decode the Base64 string
          const decodedData = Buffer.from(base64Data, "base64").toString(
            "utf-8"
          );
          // Parse the JSON string into a JavaScript object
          var jsonObject = JSON.parse(decodedData);

          // Now you can access the properties of the JSON object
          const headTrait = jsonObject.fit.find(
            (trait) => trait.trait_type === "head"
          );
          const headValue = headTrait.value;
          assert.equal(headValue.toString(), "none");

          //Set the value of head to hat
          const newFit =
            '[{"trait_type": "head", "value": "hat"},{"trait_type": "outer_chest", "value": "none"},{"trait_type": "inner_chest", "value": "nude"},{"trait_type": "legs", "value": "none"},{"trait_type": "feet", "value": "none"}]';
          await dynamicPngNft.setFit(0, newFit);

          const new_tokenuri = await dynamicPngNft.tokenURI(0);
          // Extract the Base64 portion of the tokenURI
          var new_base64Data = new_tokenuri.split(",")[1];

          // Decode the Base64 string
          const new_decodedData = Buffer.from(
            new_base64Data,
            "base64"
          ).toString("utf-8");
          // Parse the JSON string into a JavaScript object
          var new_jsonObject = JSON.parse(new_decodedData);

          // Now you can access the properties of the JSON object
          const new_headTrait = new_jsonObject.fit.find(
            (trait) => trait.trait_type === "head"
          );
          const new_headValue = new_headTrait.value;
          assert.equal(new_headValue.toString(), "hat");
        });
      });

      describe("Ownership functionality", () => {
        it("does not allow a non-owner to set a fit", async function () {
          const status = 1;

          // Mint the NFT to accounts[1]
          await dynamicPngNft.connect(accounts[1]).mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          const tokenId = 0;

          // Non-owner (accounts[1]) should not be able to set fit
          await expect(
            dynamicPngNft.connect(accounts[1]).setFit(tokenId, "newFit")
          ).to.be.reverted;
        });

        it("Allows the owner to set a fit", async function () {
          const status = 1;
          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );
          const tokenId = 0;

          // Owner should be able to set fit
          await dynamicPngNft.connect(accounts[0]).setFit(tokenId, "newFit");

          // Verify that the fit was set correctly
          const updatedFit = await dynamicPngNft.getFit(tokenId);
          assert.equal(updatedFit, "newFit");
        });

        it("transfers the NFT to another address and updates ownership", async function () {
          // Mint NFT to the deployer account
          const status = 1;
          await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          // Transfer NFT to another address
          const recipient = accounts[1].address;
          await dynamicPngNft.transferFrom(deployer.address, recipient, 0);

          // Check ownership address after transfer
          const newOwner = await dynamicPngNft.ownerOf(0);
          assert.equal(newOwner, recipient);
        });

        it("gives the proper tokenId when using tokenOfOwnerByIndex", async function () {
          const status = 1;
          await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          const jo = accounts[1].address;

          await dynamicPngNft.transferFrom(deployer.address, jo, 0);
          const tokenId = await dynamicPngNft.tokenOfOwnerByIndex(jo, 0);
          assert.equal(tokenId, 0);
        });

        it("gives the proper tokenId when ownership is transferred", async function () {
          const status = 1;
          await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          const jo = accounts[1];
          const bob = accounts[2];

          await dynamicPngNft.transferFrom(deployer.address, jo.address, 0);
          assert.equal(jo.address, await dynamicPngNft.ownerOf(0));

          // Jo approves the contract to transfer the token
          await dynamicPngNft.connect(jo).approve(dynamicPngNft.address, 0);

          // Transfer the token from jo to bob
          await dynamicPngNft
            .connect(jo)
            .transferFrom(jo.address, bob.address, 0);
          assert.equal(bob.address, await dynamicPngNft.ownerOf(0));

          assert.equal(
            await dynamicPngNft.tokenOfOwnerByIndex(bob.address, 0),
            0
          );

          await expect(dynamicPngNft.tokenOfOwnerByIndex(jo.address, 0)).to.be
            .reverted;
        });

        it("returns the proper tokenIds when there are multiple", async function () {
          const status = 1;
          let i = 0;

          while (i <= 4) {
            await dynamicPngNft.mintNft(
              status,
              originalImageURL,
              initial_attributes,
              initial_fit,
              false,
              { value: mintFee } // Pass the mint fee as the value field in the transaction
            );
            i++;
          }

          const jo = accounts[1];
          const bob = accounts[2];

          await dynamicPngNft.transferFrom(deployer.address, jo.address, 0);
          await dynamicPngNft.transferFrom(deployer.address, bob.address, 1);
          await dynamicPngNft.transferFrom(deployer.address, jo.address, 2);
          await dynamicPngNft.transferFrom(deployer.address, bob.address, 3);

          assert.equal(
            await dynamicPngNft.tokenOfOwnerByIndex(jo.address, 0),
            0
          );

          assert.equal(
            await dynamicPngNft.tokenOfOwnerByIndex(bob.address, 0),
            1
          );
          assert.equal(
            await dynamicPngNft.tokenOfOwnerByIndex(jo.address, 1),
            2
          );
          assert.equal(
            await dynamicPngNft.tokenOfOwnerByIndex(bob.address, 1),
            3
          );
        });
      });

      describe("staking", () => {
        it("staking is set to false initially", async function () {
          const status = 0;
          let stake;

          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          stake = await dynamicPngNft.getStaked(0);
          assert.equal(false, stake);

          await dynamicPngNft.stakeNFT(0);

          stake = await dynamicPngNft.getStaked(0);
          assert.equal(true, stake);
        });

        it("stakedNFT works and emits an event", async function () {
          const status = 0;
          let stake;

          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          await expect(dynamicPngNft.stakeNFT(0)).to.emit(
            dynamicPngNft,
            "NFTStaked"
          );

          stake = await dynamicPngNft.getStaked(0);
          assert.equal(true, stake);
        });

        it("unstakedNFT works and emits an event", async function () {
          const status = 0;
          let stake;

          const txResponse = await dynamicPngNft.mintNft(
            status,
            originalImageURL,
            initial_attributes,
            initial_fit,
            false,
            { value: mintFee } // Pass the mint fee as the value field in the transaction
          );

          await expect(dynamicPngNft.stakeNFT(0)).to.emit(
            dynamicPngNft,
            "NFTStaked"
          );

          stake = await dynamicPngNft.getStaked(0);
          assert.equal(true, stake);

          await expect(dynamicPngNft.unstakeNFT(0)).to.emit(
            dynamicPngNft,
            "NFTUnstaked"
          );

          stake = await dynamicPngNft.getStaked(0);
          assert.equal(false, stake);
        });
      });
    });
