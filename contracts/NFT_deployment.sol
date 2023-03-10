// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => bool) private _validQRCodeData;

    constructor() ERC721("MyNFT", "MNFT") {}

    // Function to add valid QR code data
    function addValidQRCodeData(string memory qrCodeData) public {
        _validQRCodeData[qrCodeData] = true;
    }

    // Function to check if a QR code is associated with a valid NFT
    function isQRCodeDataValid(
        string memory qrCodeData
    ) public view returns (bool) {
        return _validQRCodeData[qrCodeData];
    }

    function mintNFT(
        address recipient,
        string memory tokenURI,
        string memory qrCodeData
    ) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        // Check if the QR code data is valid and associated with an NFT
        require(isQRCodeDataValid(qrCodeData), "Invalid QR code data");
        // Mint a new NFT and assign it to the recipient address
        _mint(recipient, newItemId);
        // Set the token URI for the new NFT
        _setTokenURI(newItemId, tokenURI);
        _tokenIds.increment();
        return newItemId;
    }
}
