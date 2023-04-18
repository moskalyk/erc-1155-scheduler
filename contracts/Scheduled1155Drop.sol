// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ScheduledDrop is ERC1155Holder, ERC1155, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter public tokenIdCounter;
    address public relayer;

    constructor() public ERC1155("https://bafybeiexkawaqp73gomrf6wtbluqlrzzfojmiggfuugkpslnozyit2yp3u.ipfs.nftstorage.link/{id}.json") {}

    function setRelayer(address relayer_) onlyOwner public {
        relayer = relayer_;
    }

    function premint(uint amount_, string memory newUri_) public {
        require(msg.sender == relayer);
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        _mint(address(this), tokenId, amount_, "");
        _setURI(newUri_);
    }

    function claim(address address_, uint id_) public {
        require(msg.sender == relayer);
        require(ERC1155(this).balanceOf(address_, id_) == 0);
        ERC1155(this).safeTransferFrom(address(this), address_, id_, 1, "");
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Receiver) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}