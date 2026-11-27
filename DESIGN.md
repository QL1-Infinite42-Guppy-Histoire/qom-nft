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

### 2.1 Simple mint (attach an image) — storage options compared

Added 2026-11-27 at the owner's request: a simple flow where the creator
attaches an image and the site builds the metadata. Where the image and
metadata live is the real design question; measured on this chain
(gasPrice ≈ 53,571 gwei, local Ganache gas measurement, 2026-11-27):

| Option | Cost shape | Constraints |
|---|---|---|
| **Data URI per token** (metadata JSON incl. base64 image stored in each tokenURI) | ≈118k gas + ~705 gas per URI char: a 1 KB image ≈ 79 QOMX **per mint**, 4 KB ≈ 287 QOMX per mint | No external service, no keys, permanent while the chain lives. But every mint re-pays the full storage — the worst fit for minting the same art many times. Block gas limit (100M) is not the binding constraint; cost is. |
| **Shared-image collection** (one metadata URI stored once in the contract; every token returns it) | Same data URI stored **once** (≈285 QOMX for a 4 KB image), then ≈3.3 QOMX per mint | Perfect for the stated use case (one art, many tokens). All tokens share name + image (token IDs still differ). Implemented as the second collection template, `QomCollectionShared` (tests 7/7). |
| **IPFS via a pinning service, creator's own API key** | Mint is cheap (≈6 QOMX, short ipfs:// URI); the service may cost money | Needs the creator's account + API key pasted into the browser (key handling risk; a restricted key is a must), the service's CORS/API shape, and the pin must be maintained or the image can disappear. **NOT built — whether to support a pinning service, and which one, is an owner decision (§4).** |
| Creator's own https hosting | Cheap mint, full control | Creator must run hosting; link rot is the creator's problem. Already possible via the advanced URI flow. |

**Built:** the simple flow generates the metadata in the browser
(auto-downscaling images over 8 KB to ≤256 px), shows the stored size and
an estimated cost at the live gas price before signing, and keeps the
image in the browser (localStorage) so the same art mints again without
re-uploading — with a copies field (each copy is its own transaction and
confirmation). It works with both templates: per-token data URIs for
standard collections, set-once + cheap mints for shared collections. The
original URI flow remains as "Advanced".

## 3. Marketplace design (frontend built; contract NOT deployed)

Trustless fixed-price trading needs a market contract:

- Seller lists (token escrowed in the contract, or traded via `approve` +
  atomic `buy` that pulls the token at purchase time — the approve-pull
  shape avoids escrow custody).
- The contract transfers the NFT and forwards payment in the same
  transaction; seller can cancel an unfilled listing.
- Optional protocol fee (bps) — a policy choice, not a technical need.

Until that contract exists, the site is browse-only and says so.

### 3.1 Payment currency — DECIDED: Option A, dual-price (owner, 2026-11-27, revised)

Requirement (owner spec): at purchase time the **buyer chooses to pay in Q**
(the Qom chain stablecoin, `0xd53D9f937537262F78AEC261785D731E9E829138`,
6 decimals) **or in QOMX**. The mechanism was first decided as Option B
(Q-denominated + conversion) earlier on 2026-11-27 and then **revised by
the owner the same day to Option A**, which is the design below. (The B
analysis is kept in git history; its two-step variant stays a possible
future front-end convenience, not the settlement design.)

**Option A — dual-price listings, pass-through settlement:**

- `list(collection, tokenId, priceQ, priceNative)` — the seller sets a Q
  price and/or a QOMX price; at least one must be > 0 (the call reverts if
  both are zero). A zero price means "not offered in that currency".
  Prices are fixed for the life of the listing (changing a price =
  cancel + relist).
- `buyWithQ(listingId)` — the buyer needs a Q allowance ≥ priceQ. The
  contract pulls Q buyer → seller and pulls the NFT seller → buyer in one
  transaction; if either leg fails, everything reverts and nothing moves.
- `buyWithQOMX(listingId)` — payable; `msg.value` must equal priceNative
  exactly (the front-end always sends the exact listing price, so no
  refund path exists and the contract makes no extra external call). The
  contract forwards the QOMX to the seller and pulls the NFT to the buyer
  in the same transaction.
- **The seller receives exactly the currency the buyer chose** (minus any
  fee). There is no conversion anywhere: the contract contains no Router,
  no oracle and no pool address. The only pinned token is Q.
- Fee: a `feeBps` parameter, taken in whichever currency was paid (split
  inside the same transaction; the contract never holds a balance). Its
  initial value is a §4 decision (0% is valid).
- `cancel(listingId)` — seller only. Custody shape: **approve-pull**
  (recommended) — the seller keeps the NFT until the moment of sale;
  `buy*` re-checks ownership and approval, so a stale listing (token
  moved, approval revoked) fails cleanly, and the front-end filters stale
  listings out of the buyable view. Escrow-at-list remains the §4
  alternative.
- Events: `Listed`, `Cancelled`, `Sold` (recording which currency was
  paid and the amount), so the front-end can rebuild the market view from
  logs alone.

**Display-only conversion.** The front-end may show an approximate
equivalent ("≈ … QOMX" under a Q price) from the official pool's spot
reserves (≈752 QOMX per Q on 2026-11-26), labelled as an estimate. Per
the owner's instruction it is never used for settlement — settlement is
always one of the seller's two stated prices, exactly as listed.

## 4. Open decisions (for the owner)

1. **Market contract:** deploy or not? If yes — from whose wallet, who is
   the contract owner, what fee (0% is a valid choice), approve-pull vs
   escrow?
1b. **Payment method (§3.1): DECIDED 2026-11-27, revised the same day —
   Option A dual-price pass-through** (seller sets Q and/or QOMX price;
   buyer chooses; seller receives that currency as-is; no conversion in
   settlement). Still open: approve-pull vs escrow, the fee's initial
   value, and whether listings get an optional expiry (v1 proposal:
   none — manual cancel + stale filtering only). Deployment is a
   separate phase, like the QOM DEX limit orders.
2. **Shared collection:** is (a) per-creator self-deploy enough, or is a
   shared/factory model wanted later?
2b. **Pinning service (§2.1):** should the simple mint also support IPFS
   pinning with the creator's own API key (e.g. Pinata)? If yes, which
   service, and may the key be remembered in the browser (localStorage)
   or must it be entered every time? Not built until decided.
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

## 6. UI redesign — OpenSea-style (owner order, 2026-11-27)

Goal: rebuild the front-end's look and layout in the OpenSea idiom while
keeping every existing function and every honesty rule. This is a display
redesign only: contracts, artifacts, mint logic and the trading status do
not change.

Layout:
- Sticky top bar: brand, a wide search field (filters loaded tokens by
  name / token id / collection), language, theme, wallet button.
- The 🚧 development / own-risk banner stays directly under the bar,
  always visible.
- Market view:
  - A collection strip (chips/cards for every registered collection plus
    "All collections", and the add-by-address control).
  - A collection header for the current selection: big name, symbol,
    contract address with explorer link, and a stats row limited to
    TRUTHFUL on-chain numbers — Items (token count), Owners (unique
    owners among loaded tokens), collection type — plus a "Trading: not
    available yet" chip. NO floor price, NO volume, NO fabricated stats
    (there is no market contract, so none exist).
  - A filter sidebar (collapsible on mobile): status filter (All / Mine),
    sort (token ID ascending / descending).
  - A large card grid; clicking a card opens an item detail dialog:
    big image, name, collection, owner (full, explorer link), contract,
    token ID, metadata description, attributes if the metadata has them,
    token URI link, and a DISABLED buy area that repeats the honest
    trading notice.
  - The trade notice remains visible in the market view itself.
- Mint view: the same three sections (deploy with type select, simple
  image mint, advanced URI mint) restyled as clean cards. ALL existing
  element ids and behaviours are preserved exactly.
- Style: fresh stylesheet in the OpenSea idiom — rounded (16px) cards,
  soft shadows, neutral surfaces, light/dark via the existing guppy-theme
  mechanism; the project fonts (Space Grotesk / Zen Kaku Gothic New) and
  the pink brand accent stay. Responsive: sidebar collapses under ~860px.
- Rendering safety is unchanged: everything chain- or metadata-derived is
  rendered with textContent; images only from https: or data:image URLs.
