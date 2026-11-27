# QOM NFT — Marketplace & Mint (Qom chain)

A community-built front-end for NFTs on **Qom chain** (EVM 33303, native QOMX):
browse ERC-721 collections, deploy your own collection, and mint — all signed
by your own wallet. Nothing is custodied by this site.

**Live:** https://ql1-infinite42-guppy-histoire.github.io/qom-nft/
**Chain:** RPC `https://rpc.qomx.io` · Explorer https://scan.qomx.io

> 🚧 Under development — use at your own risk. The banner is shown on the site
> itself, in English and Japanese.

## Status (2026-11-27)

- **Browse: live.** Seeded with the only ERC-721 found on-chain so far,
  *Qomx Demo NFT* (QDN, `0x4BFbd5C7d4f728FA066Ed8337D025aAF65A1662B`, 1 token).
  Any ERC-721 collection can be added by address; collections you deploy here
  are added automatically. The registry is stored in your browser
  (localStorage) — there is no server.
- **Mint: live.** Two steps, both from your wallet:
  1. Deploy your own collection (a standard OpenZeppelin ERC-721, see below).
  2. Mint NFTs into it, each with its own metadata URI.
- **Trading (list / buy): NOT available.** It needs a dedicated market
  contract, which has **not** been deployed. Who would deploy it and under
  what rules (fees, etc.) is an open decision — see `DESIGN.md`. The site says
  this plainly instead of showing fake trading UI.

## The collection contract

`contracts/QomCollection.sol` — a minimal OpenZeppelin ERC-721
(`ERC721URIStorage` + `Ownable`):

- The deployer is the owner and the only minter.
- `mint(to, uri)` issues sequential token IDs starting at 1, each with its own
  metadata URI.
- No admin function can move anyone's tokens; contract ownership controls
  minting only.
- Compiled with solc 0.8.26, `evmVersion: paris`, optimizer 200 runs
  (`tools/compile.js`); the site deploys the resulting bytecode from
  `docs/collection-artifact.json`.
- Local tests (`tools/test-local.js`, Ganache): 8/8 pass — deploy, mint,
  ownership, tokenURI, and non-owner mint reverts.

## Notes and limits

- Metadata and images are hosted by creators (IPFS or their own web space);
  this site only reads the token URI. If metadata cannot be fetched, the card
  says so instead of inventing content.
- Token lists are read via `ERC721Enumerable` when a collection supports it,
  otherwise from `Transfer` logs; display is capped at 100 tokens per
  collection (the cap is shown on the page when it applies).
- Gas: sends use the chain-observed rule from QOM DEX — the chain charges at
  least 50% of the gas *limit*, so the site sends estimate × 1.2.
- No analytics, no server, no keys ever requested. The site is static files
  under `docs/`.

## Related

- QOM DEX — https://qomdex.com/
- QOM Aggregator — https://ql1-infinite42-guppy-histoire.github.io/qom-aggregator/
- QOM Faucet — https://ql1-infinite42-guppy-histoire.github.io/qom-faucet/

Built by the community — not an official product. MIT License.
