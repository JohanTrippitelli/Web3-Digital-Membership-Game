// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721, Ownable {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    int256 private s_membership_status;
    string private attributes;
    string private fit;

    mapping(uint256 => int256) private s_tokenIdToMembershipStatus;
    event CreatedNFT(uint256 indexed tokenId, int256 membership_status);

    constructor(
        int256 membership_status,
        string memory lowSvg,
        string memory highSvg,
        string memory Fit,
        string memory Attributes
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_membership_status = membership_status;
        fit = Fit;
        attributes = Attributes;
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
    }

    function mintNft(int256 membership_status) public {
        s_tokenIdToMembershipStatus[s_tokenCounter] = membership_status;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(s_tokenCounter, membership_status);
    }

    // You could also just upload the raw SVG and have solildity convert it!
    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        // example:
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
        // would return ""
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    //data:image/svg+xml;base64 represents the prefix needed for image data
    //data:application/json;base64 represents the prefix needed for JSON data
    //Both of these are used for Base64 encoding of our NFT image data and metadata

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
        string memory imageURI = s_lowImageURI;
        int256 membershipStatus = s_tokenIdToMembershipStatus[tokenId];

        if (membershipStatus == 0) {
            imageURI = s_lowImageURI;
        } else if (membershipStatus == 1) {
            imageURI = s_highImageURI;
        }
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
                                attributes,
                                fit,
                                '"image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getmembershipStatus() public view returns (int256) {
        return s_membership_status;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getFit() public view returns (string memory) {
        return fit;
    }

    function getAttributes() public view returns (string memory) {
        return attributes;
    }

    function setFit(string memory Fit) public {
        fit = Fit;
    }

    function setAttributes(string memory Attributes) public {
        attributes = Attributes;
    }

    //change from public
    function setMembership(int256 status, uint256 tokenId) public {
        s_membership_status = status;
        s_tokenIdToMembershipStatus[tokenId] = s_membership_status;
    }
}
