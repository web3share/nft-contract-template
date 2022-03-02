// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PublicMintNFTTemplate is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public maxTokenSupply;

    uint256 public numTokensMinted;

    uint256 public pricePerNFT;

    string public baseTokenURI;

    /// @notice Mapping of addresses who have claimed tokens
    mapping(address => bool) public luckyAddress;

    bool public publicSaleStarted;

    bool public raffleStarted;

    uint256 public lastRaffleBlockTimeStamp;

    uint256 randNonce = 0;

    /// ============ Errors ============

    event BaseURIChanged(string baseURI);

    event PublicSaleMint(address minter, uint256 amountOfNFTs);

    modifier whenPublicSaleStarted() {
        require(publicSaleStarted, "Public sale has not started");
        _;
    }

    modifier whenRaffleEnable() {
        require(raffleStarted, "raffle has not started");
        if (lastRaffleBlockTimeStamp > 0) {
            console.log(
                "lastRaffleBlockTimeStamp %v",
                lastRaffleBlockTimeStamp
            );
            console.log(
                "lastRaffleBlockTimeStamp + 24 hours %v",
                lastRaffleBlockTimeStamp + 24 hours
            );
            console.log("block.timestamp %v", block.timestamp);
            require(
                lastRaffleBlockTimeStamp + 24 hours < block.timestamp,
                "raffle interval must not less than 24 hours"
            );
        }
        lastRaffleBlockTimeStamp = block.timestamp;
        _;
    }

    constructor(
        string memory baseURI,
        string memory _name,
        string memory _symbol,
        uint256 _maxTokenSupply
    ) ERC721(_name, _symbol) {
        baseTokenURI = baseURI;
        maxTokenSupply = _maxTokenSupply;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function batchMint(address[] memory recipients, uint256[] memory ids)
        external
        onlyOwner
    {
        require(recipients.length > 0, "At least one recipient");
        require(
            recipients.length == ids.length,
            "Recipients and amounts count not matched"
        );
        require(
            totalSupply() + ids.length <= maxTokenSupply,
            "Minting would exceed max supply"
        );

        for (uint256 i = 0; i < recipients.length; ++i) {
            _safeMint(recipients[i], ids[i]);
            numTokensMinted += 1;
        }
    }

    function setPricePerNFT(uint256 _pricePerNFT) public onlyOwner {
        pricePerNFT = _pricePerNFT;
    }

    function getPricePerNFT() public view returns (uint256) {
        return pricePerNFT;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }

    function mint(uint256 amountOfNFTs) external payable whenPublicSaleStarted {
        require(totalSupply() < maxTokenSupply, "All tokens have been minted");
        require(
            totalSupply() + amountOfNFTs <= maxTokenSupply,
            "Minting would exceed max supply"
        );
        require(amountOfNFTs > 0, "Must mint at least one nft");
        console.log("pricePerNFT : %d", pricePerNFT);
        console.log("amountOfNFTs : %d", amountOfNFTs);
        console.log("msg.value : %d", msg.value);
        require(
            pricePerNFT * amountOfNFTs == msg.value,
            "Matic amount is incorrect"
        );

        for (uint256 i = 0; i < amountOfNFTs; i++) {
            uint256 tokenID = numTokensMinted + 1;
            numTokensMinted += 1;
            _safeMint(msg.sender, tokenID);
        }
        emit PublicSaleMint(msg.sender, amountOfNFTs);
    }

    function togglePublicSaleStarted() external onlyOwner {
        publicSaleStarted = !publicSaleStarted;
    }

    function toggleRaffleStarted() external onlyOwner {
        raffleStarted = !raffleStarted;
    }

    error AlreadyInLuckyList(address);
    event Raffle(address indexed account, uint256 tokenID);

    function raffle() external whenRaffleEnable {
        uint256 nonce = randNonce;

        randNonce += 1;

        uint256 tokenId = random(nonce);

        console.log("tokenId %s tokens", tokenId);

        address tokenOwner = ownerOf(tokenId);

        if (luckyAddress[tokenOwner]) {
            revert AlreadyInLuckyList(tokenOwner);
        } else {
            luckyAddress[tokenOwner] = true;
        }
        emit Raffle(tokenOwner, tokenId);
    }

    function random(uint256 nonce) public view returns (uint256) {
        return
            (uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, nonce)
                )
            ) % (numTokensMinted - 1)) + 1;
    }

    function withdrawAll() public onlyOwner {
        uint256 balance = address(this).balance;
        _widthdraw(owner(), balance);
    }

    function _widthdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Failed to widthdraw Ether");
    }
    
}
