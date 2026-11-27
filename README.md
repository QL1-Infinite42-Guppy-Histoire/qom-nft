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
- **Mint: live.** Everything is signed by your wallet:
  1. Deploy your own collection — two templates (see below): *standard*
     (each token has its own metadata) or *shared image* (one metadata for
     every token; cheapest for same-art collections).
  2. Mint — either the **simple flow** (attach an image; the site builds
     the metadata and stores it on-chain as a data URI, no external
     hosting; the image is kept in your browser so the same art can be
     minted again without re-uploading) or the **advanced flow** (your own
     metadata URI). On-chain storage is expensive on this chain (≈705 gas
     per stored character), so the simple flow auto-downscales large
     images and shows an estimated cost before you sign; for shared-image
     collections the metadata is stored once and each mint is cheap.
     IPFS pinning with your own API key is **not** built — see `DESIGN.md`
     §2.1/§4 for the comparison and the open decision.
- **Trading (list / buy): NOT available.** It needs a dedicated market
  contract, which has **not** been deployed. Who would deploy it and under
  what rules (fees, etc.) is an open decision — see `DESIGN.md`. The site says
  this plainly instead of showing fake trading UI.

## The collection contract

Two templates, both minimal OpenZeppelin ERC-721 with the deployer as owner
and only minter, and no admin function that can move anyone's tokens:

- `contracts/QomCollection.sol` (`ERC721URIStorage` + `Ownable`) —
  **standard**: `mint(to, uri)` issues sequential IDs from 1, each with its
  own metadata URI. Local tests 8/8 (`tools/test-local.js`).
- `contracts/QomCollectionShared.sol` (`ERC721` + `Ownable`) — **shared
  image**: one metadata URI stored in the contract (`setSharedURI`) is
  returned for every token; `mint(to)` needs no URI. Local tests 7/7
  (`tools/test-shared.js`).

Both compiled with solc 0.8.26, `evmVersion: paris`, optimizer 200 runs
(`tools/compile.js`, `tools/compile-shared.js`); the site deploys the
bytecode from `docs/collection-artifact.json` /
`docs/collection-shared-artifact.json`.

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
