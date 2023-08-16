// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicPngNft is ERC721Enumerable, Ownable {
    uint256 private s_tokenCounter;
    bool private s_isQR;
    uint256 s_mintFee;

    mapping(uint256 => int256) private s_tokenIdToMembershipStatus;
    mapping(uint256 => string) private s_tokenIdToImageURL;
    mapping(uint256 => string) private s_tokenIdToAttributes;
    mapping(uint256 => bool) private s_tokenIdToStaked;

    //Event Definition
    event CreatedNFT(uint256 indexed tokenId, int256 membership_status);
    event NFTStaked(address indexed staker, uint256 indexed tokenId);
    event NFTUnstaked(address indexed unstaker, uint256 indexed tokenId);

    constructor(uint256 mintFee) ERC721("Dynamic PNG NFT", "DSN") {
        s_tokenCounter = 0;
        s_mintFee = mintFee;
    }

    function mintNft(
        int256 membership_status,
        string memory imageURL,
        string memory attributes,
        bool isQR
    ) public payable {
        require(msg.value >= s_mintFee, "More ETH required");

        //set state variables and mapping according to the given parameters
        s_isQR = isQR;
        //membership
        s_tokenIdToMembershipStatus[s_tokenCounter] = membership_status;
        //imageURL
        s_tokenIdToImageURL[s_tokenCounter] = imageURL;
        //attributes
        s_tokenIdToAttributes[s_tokenCounter] = attributes;
        //Mint the NFT now, increment the token counter, and emit the created event
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(s_tokenCounter, membership_status);
    }

    //The baseURI is an inherint attribute of the ERC721 which we will override in this function to properly convert our metadata
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    //Given token ID (which points to the medata of our NFT) we use the function tokenURI to encode the JSON metadata into Base64 data
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        //Set the necessary variables from the state variable mappings
        string memory imageURL = s_tokenIdToImageURL[tokenId];
        string memory attributes = s_tokenIdToAttributes[tokenId];
        // Retrieve the staking status of the NFT
        bool staked = s_tokenIdToStaked[tokenId];

        //The following return statement utilizes abi.encodepacked as a way of concatonating prefixes with our metadata then casting as a string
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"Q", ',
                                '"attributes":',
                                attributes,
                                ',"image":"',
                                imageURL,
                                '","staked":"',
                                staked ? "true" : "false",
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function stakeNFT(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can stake the NFT"
        );
        require(!s_tokenIdToStaked[tokenId], "NFT is already staked");

        // Add any additional staking logic here, such as updating balances or permissions

        s_tokenIdToStaked[tokenId] = true;

        // Emit the event after the NFT is staked
        emit NFTStaked(msg.sender, tokenId);
    }

    function unstakeNFT(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can unstake the NFT"
        );
        require(s_tokenIdToStaked[tokenId], "NFT is not staked");

        // Add any additional unstaking logic here

        s_tokenIdToStaked[tokenId] = false;

        // Emit the event after the NFT is unstaked
        emit NFTUnstaked(msg.sender, tokenId);
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getStaked(uint256 tokenId) public view returns (bool) {
        return s_tokenIdToStaked[tokenId];
    }

    function getMembershipStatus(uint256 tokenId) public view returns (int256) {
        return s_tokenIdToMembershipStatus[tokenId];
    }

    function getAttributes(
        uint256 tokenId
    ) public view returns (string memory) {
        return s_tokenIdToAttributes[tokenId];
    }

    function getImage(uint256 tokenId) public view returns (string memory) {
        return s_tokenIdToImageURL[tokenId];
    }

    function setAttributes(
        uint256 tokenId,
        string memory attributes
    ) public onlyOwner {
        s_tokenIdToAttributes[tokenId] = attributes;
    }

    function setMembership(uint256 tokenId, int256 status) public onlyOwner {
        s_tokenIdToMembershipStatus[tokenId] = status;
    }

    function setImage(uint256 tokenId, string memory image) public onlyOwner {
        int256 membership_status = getMembershipStatus(tokenId);
        if (membership_status == 1) {
            s_tokenIdToImageURL[tokenId] = image;
        }
    }

    function setMintFee(uint256 mintFee) public onlyOwner {
        s_mintFee = mintFee;
    }
}
