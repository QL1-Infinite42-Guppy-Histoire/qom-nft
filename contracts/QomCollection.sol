// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title QomCollection — a minimal, standard ERC-721 collection for Qom chain.
/// The deployer is the owner and the only minter. Each mint sets a per-token
/// metadata URI. No admin can move anyone's tokens; ownership of the contract
/// only controls minting (and can be renounced or transferred by the owner).
contract QomCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function mint(address to, string calldata uri) external onlyOwner returns (uint256) {
        _ids.increment();
        uint256 id = _ids.current();
        _safeMint(to, id);
        _setTokenURI(id, uri);
        return id;
    }

    function totalMinted() external view returns (uint256) {
        return _ids.current();
    }
}
