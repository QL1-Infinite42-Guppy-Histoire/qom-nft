// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title QomCollectionShared — an ERC-721 collection where EVERY token
/// shares one metadata URI, stored once in the contract.
/// Built for same-art collections: the (possibly data-URI) metadata is paid
/// for once via setSharedURI, and each mint then costs only the base mint
/// gas. The deployer is the owner and the only minter, as in QomCollection.
contract QomCollectionShared is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;
    string private _sharedURI;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function setSharedURI(string calldata uri) external onlyOwner {
        _sharedURI = uri;
    }

    function sharedURI() external view returns (string memory) {
        return _sharedURI;
    }

    function mint(address to) external onlyOwner returns (uint256) {
        _ids.increment();
        uint256 id = _ids.current();
        _safeMint(to, id);
        return id;
    }

    function totalMinted() external view returns (uint256) {
        return _ids.current();
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        _requireMinted(id);
        return _sharedURI;
    }
}
