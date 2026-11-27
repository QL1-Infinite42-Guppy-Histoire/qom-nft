# QOM NFT — design notes and open decisions

Written 2026-11-27. The site is published (browse + mint); trading awaits the
decisions in §4.

## 1. On-chain survey (2026-11-27, block ~156,896)

Method: Blockscout token census (`scan.qomx.io` API) + direct RPC reads.

- **ERC-721: exactly one contract exists** — Qomx Demo NFT (QDN),
  `0x4BFbd5C7d4f728FA066Ed8337D025aAF65A1662B`. Standard ERC-721 +
  Enumerable + Metadata interfaces; total supply 1; token #1 owned by
  `0xeDeFC1598048fA46e8a09bb490CC453EB69F7F06`, URI `ipfs://qomx-demo/1`.
- **ERC-1155: none.**
- **Marketplace: none found** (explorer search returns nothing; no contract
  on the chain is identifiable as a market). The chain's token census is
  complete per the explorer index, so "no NFT infrastructure yet" is a
  measured statement, not an assumption.
- **PUSH0 is supported** on this chain (a creation estimate executing PUSH0
  succeeded), unlike QL1. The collection contract is nevertheless compiled
  with `evmVersion: paris`, which works either way.

## 2. Mint design (built)

Options considered:

- **(a) Per-creator self-deploy (CHOSEN).** The site ships one standard
  ERC-721 collection contract (OpenZeppelin, owner-mint); each creator
  deploys their own instance from their own wallet and owns it outright.
  No operator deployment, no shared admin, no custody — consistent with how
  the rest of the Qom tooling works. Downside: one deployment gas cost per
  creator, and no single "official" collection.
- **(b) One shared collection.** A single contract everyone mints into.
  Needs someone to deploy and own it (a decision like §4), mixes all
  creators into one collection, and the owner key becomes a central point.
- **(c) Factory.** A factory contract that spawns per-creator collections
  (cheaper clones). Still needs a factory deployment decision; adds
  complexity for a chain with one demo NFT today. Can be revisited if (a)'s
  deployment cost ever matters.

Metadata: creators supply a per-token URI (https or ipfs) pointing to a JSON
(`name` / `description` / `image`). The site does not host files.

## 3. Marketplace design (frontend built; contract NOT deployed)

Trustless fixed-price trading needs a market contract:

- Seller lists (token escrowed in the contract, or traded via `approve` +
  atomic `buy` that pulls the token at purchase time — the approve-pull
  shape avoids escrow custody).
- The contract transfers the NFT and forwards payment in the same
  transaction; seller can cancel an unfilled listing.
- Optional protocol fee (bps) — a policy choice, not a technical need.

Until that contract exists, the site is browse-only and says so.

### 3.1 Payment currency — buyer chooses Q or QOMX (owner spec, 2026-11-27)

The owner has specified: at purchase time the **buyer chooses to pay in Q**
(the Qom chain stablecoin, `0xd53D9f937537262F78AEC261785D731E9E829138`,
6 decimals) **or in QOMX**. How listings carry prices is a design choice;
the options, with the recommendation first:

**Option A — dual-price listings, pass-through (RECOMMENDED).**
The seller sets a price in Q and/or a price in QOMX when listing (at least
one; setting both enables both). The buyer picks one of the offered
currencies; the contract forwards exactly that currency to the seller
(Q via `transferFrom`, QOMX as native value). No conversion anywhere.

- No dependency on the DEX pool, no rate race between quote and purchase,
  no slippage to argue about; the contract stays small and auditable.
- The buyer's choice is real for every currency the seller enabled; a
  seller who sets only one price accepts only that currency.
- Seller receives the currency the buyer chose — transparent, because the
  seller personally priced the item in that currency.

**Option B — single denomination + conversion at purchase.**
Listings are priced in one currency (e.g. Q); a buyer paying QOMX has the
contract swap QOMX→Q through the official Router in the same transaction
and pays the seller in Q (or the mirror image). Seller always receives the
listing currency.

- Problems: the only Q/QOMX pool is small (reserves measured 2026-11-26:
  ≈7.53M QOMX / ≈10,003 Q, so ≈752 QOMX per Q) — any sizeable converted
  purchase moves the price and needs slippage bounds, a deadline, and a
  refund path; the swap can fail and take the whole purchase down with it;
  the market contract grows a Router dependency and a much larger audit
  surface. The rate also moves between the buyer's click and the block
  that mines the purchase.
- A softer variant keeps conversion OUT of the contract: the front-end
  offers "swap first, then buy" as two user-signed steps (the existing
  QOM DEX / aggregator protections apply to the swap leg). This can be
  added later without changing the market contract.

**Display-only conversion (either option).** Showing an approximate
equivalent ("≈ 750 QOMX" under a Q price) using the pool's spot reserves
is fine as a labelled estimate; it must never be the settlement price.

**Open sub-questions for the owner:** accept Option A? If a fee is ever
charged, it applies per currency as paid under A. Under B someone must
also decide who bears slippage (naturally the buyer) and the max impact
allowed before a purchase refuses to execute.

## 4. Open decisions (for the owner)

1. **Market contract:** deploy or not? If yes — from whose wallet, who is
   the contract owner, what fee (0% is a valid choice), approve-pull vs
   escrow?
1b. **Payment method (§3.1):** the buyer-pays-in-Q-or-QOMX requirement is
   set by the owner; the open part is the mechanism — Option A dual-price
   pass-through (recommended) vs Option B single denomination with
   in-contract conversion, and, under B, the slippage rules. Deployment is a separate phase, like the QOM DEX limit orders.
2. **Shared collection:** is (a) per-creator self-deploy enough, or is a
   shared/factory model wanted later?
3. **Domain:** the site is on GitHub Pages
   (`ql1-infinite42-guppy-histoire.github.io/qom-nft/`). A subdomain such as
   `nft.qomdex.com` would need owner-side Cloudflare DNS + a Pages custom
   domain setting.
4. **QOM DEX link:** proposal — add "QOM NFT" to the qomdex.com footer
   tools row, next to the Aggregator and Faucet links (the NFT site already
   links back to all three). Not added yet; awaiting the owner's word.
5. **Dashboard / links hub:** not touched (owned by the dashboard redesign,
   same as the aggregator/faucet).

## 5. Safety notes

- All rendering of chain- or metadata-derived strings uses `textContent`;
  images load only from `https://` URLs (ipfs:// is rewritten to a gateway).
- The site never asks for keys; deploys and mints are signed in the user's
  wallet, with gas limit = estimate × 1.2 (this chain charges ≥50% of the
  limit).
- The development-stage / own-risk banner is always visible at the top of
  the page, in the selected language.
