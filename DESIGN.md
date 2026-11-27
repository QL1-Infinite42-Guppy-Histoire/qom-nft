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

### 3.1 Payment currency — DECIDED: Option B, Q-denominated (owner, 2026-11-27)

Requirement (owner spec): at purchase time the **buyer chooses to pay in Q**
(the Qom chain stablecoin, `0xd53D9f937537262F78AEC261785D731E9E829138`,
6 decimals) **or in QOMX**. The owner decided **Option B**: all listings are
denominated **in Q only**, and paying with QOMX means converting QOMX→Q.
**The seller always receives Q**, whichever leg the buyer used (premise
included in the design report for the owner's confirmation). Option A
(dual-price pass-through) was considered and set aside by this decision.

The conversion itself has two shapes; the **main line is B1** (owner
instruction: develop the safer variant — conversion in the front-end, the
market contract stays simple). B2 is kept here for comparison.

#### B1 (main line) — two user-signed steps, simple market contract

The market contract only ever handles Q:

- `list(collection, tokenId, priceQ)` — seller lists at a fixed Q price.
  Custody shape: **approve-pull** (recommended) — the seller keeps the NFT
  and grants the market an approval; the token moves only inside `buy()`.
  (Escrow-at-list is the alternative; see §4.)
- `buy(listingId)` — requires the buyer's Q allowance; atomically pulls Q
  from buyer → seller (minus any fee) and pulls the NFT seller → buyer.
  If either leg fails the whole transaction reverts and no funds move.
  `buy()` re-checks that the seller still owns the token and the approval
  still stands, so a stale listing fails cleanly instead of mis-settling.
- `cancel(listingId)` — seller only. With approve-pull, revoking the
  approval or moving the token also makes a listing unfillable; the
  front-end filters such stale listings out of the buyable view by reading
  `ownerOf` + approval before rendering.
- Fee: a `feeBps` parameter (accrues in Q to a fee recipient). Its initial
  value is a §4 decision (0% is valid). No Router, no oracle, no pool
  address anywhere in the contract — Q's address is the only pinned token.

Paying with QOMX is a **front-end flow of two steps**, both signed by the
buyer:

1. **Swap step.** The site quotes the official pool through the Router
   (`getAmountsIn` for exactly `priceQ` out, on the same QOMX→Q path
   QOM DEX already uses live) and the buyer swaps with
   `swapETHForExactTokens`: they receive exactly `priceQ` of Q, and the
   Router refunds any excess QOMX automatically. The buyer's maximum spend
   is the quoted input × (1 + slippage tolerance) — if the pool moves past
   that, the swap reverts and the buyer keeps their QOMX (only gas is
   spent). Proposed parameters: slippage default **1%**, hard cap **5%**
   (tighter than the DEX's 10% because this is a purchase, not a trade);
   deadline **10 minutes**; the quote is re-read immediately before
   signing and the flow aborts if it moved beyond tolerance (the same
   displayed-quote discipline as QOM DEX).
2. **Buy step.** The site re-reads the listing (still active, same price,
   seller still owner) — if it changed, the flow stops with a clear
   message. Otherwise the buyer approves Q if needed (exact amount) and
   calls `buy()`. From this point there is **no rate exposure at all**:
   the price is fixed in Q and the buyer already holds exactly that much Q.

Failure and refund behaviour under B1:

- Swap reverts → nothing moved but gas; buyer keeps QOMX.
- Swap succeeds but the listing is gone before `buy()` → the buyer simply
  holds `priceQ` of Q **in their own wallet**. Nothing is locked in any
  contract, so there is nothing to refund; the site says so and links to
  the DEX if they want to swap back.
- `buy()` reverts → Q stays with the buyer (allowance may remain; no
  transfer happened).

Gas burden under B1: the **buyer** pays for the swap + (possible) Q
approval + `buy()` (2–3 transactions); the **seller** pays for listing
(and a one-time per-collection approval). Every send follows this chain's
rule (≥50% of the gas limit is charged), so each uses estimate × 1.2.
No party's gas is ever taken from sale proceeds.

Price-movement summary under B1: the item's price can never move (fixed
in Q). The only moving number is the QOMX→Q rate during step 1, bounded
by the buyer's own max-spend; after step 1 the exposure is zero.

#### B2 (comparison) — conversion inside the market contract

`buyWithQOMX(listingId)` payable: the contract quotes the Router, swaps
the buyer's QOMX→Q to itself, settles the sale in Q, and refunds leftover
QOMX — all in one transaction.

| Aspect | B1 two-step (main line) | B2 in-contract swap |
|---|---|---|
| Market contract | Q only; no Router/pool dependency; small audit surface | Router + pair pinned in; refund and reentrancy surface; much larger audit |
| Atomicity | Two steps; a failed buy after a successful swap leaves the buyer holding Q (in their own wallet — safe, but a visible intermediate state) | All-or-nothing in one tx; no intermediate state |
| Slippage enforcement | Bounded at the swap step (max-spend); buy step has no rate risk | Enforced on-chain at execution (strongest form) |
| Failure cost | Cheap failures (swap revert = small gas; buy never attempted with wrong state) | One heavy tx; a revert burns the full swap+settle gas |
| Pool failure / migration | Only the QOMX payment option breaks; Q purchases and the contract are unaffected; the front-end can point at a new pool freely | QOMX purchases break inside an immutable contract; fixing means redeploy + relist everything |
| Signatures | 2–3 (swap, maybe approve, buy) | 1 |
| Quote discipline | Front-end re-quote + abort (QOM DEX pattern, proven) | Contract-enforced min/max at execution |

B1 is the main line per the owner's instruction; B2's only decisive wins
are single-signature UX and on-chain slippage enforcement, bought with a
permanently larger, pool-coupled contract.

**Display-only conversion (both shapes).** Showing an approximate QOMX
equivalent under a Q price, from the pool's spot reserves (≈752 QOMX per
Q on 2026-11-26), is fine as a labelled estimate; it is never the
settlement price — settlement under B1 is the Router quote at swap time,
bounded by the buyer's max-spend.

## 4. Open decisions (for the owner)

1. **Market contract:** deploy or not? If yes — from whose wallet, who is
   the contract owner, what fee (0% is a valid choice), approve-pull vs
   escrow?
1b. **Payment method (§3.1): DECIDED 2026-11-27 — Option B, Q-denominated,
   B1 two-step conversion as the main line.** Still open inside it: the
   "seller always receives Q" premise (reported for confirmation),
   approve-pull vs escrow, the slippage parameters (proposed default 1% /
   cap 5% / 10-minute deadline), and whether listings get an optional
   expiry (v1 proposal: none — manual cancel + stale filtering only).
   Deployment is a separate phase, like the QOM DEX limit orders.
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
