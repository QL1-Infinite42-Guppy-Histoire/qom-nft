"use strict";
/* QOM NFT — browse + mint front-end for Qom chain (33303).
   No custody: deploys and mints are signed by the visitor's own wallet.
   Trading (list/buy) is intentionally absent until a market contract is
   deployed — that deployment is a separate, undecided step. */

const CFG = {
  chainId: 33303,
  chainHex: "0x8237",
  rpc: "https://rpc.qomx.io",
  explorer: "https://scan.qomx.io",
  ipfsGateway: "https://ipfs.io/ipfs/",
  seedCollections: ["0x4BFbd5C7d4f728FA066Ed8337D025aAF65A1662B"], // Qomx Demo NFT (the only ERC-721 found on-chain, 2026-11-27)
  maxTokensShown: 100,
};

const I18N = {
en:{connect:"Connect Wallet",connected:"Connected",close:"Close",disconnect:"Disconnect",wrongChain:"Wrong network — switch to Qom chain (33303)",noWallet:"No wallet found. Open this page in your wallet's browser (e.g. MetaMask).",openInWallet:"Open in MetaMask",brandSub:"Marketplace & Mint",devNotice:"🚧 Under development — this site is experimental. Use at your own risk: you sign everything with your own wallet and pay your own gas.",tabMarket:"Market",tabMint:"Mint",marketTitle:"Browse NFTs",tradeNotice:"Trading is not available yet: listing and buying need a market contract, which has not been deployed. The plan is to let buyers pay in Q or QOMX (buyer's choice); who deploys the contract and the final rules are still being decided — for now this page is browse-only.",collectionLbl:"Collection",onlyMine:"Only mine",refresh:"Refresh",addColPh:"Add a collection by address (0x…)",addCol:"Add collection",searchPh:"Search by name, token ID or collection…",allCollections:"All collections",collectionsWord:"collections",statItems:"Items",statOwners:"Owners",statType:"Type",typeSharedShort:"Shared image",tradingChip:"Trading: not available yet",statusLbl:"Status",sortLbl:"Sort",sortIdAsc:"Token ID: low to high",sortIdDesc:"Token ID: high to low",filtersLbl:"Filters",noResults:"No tokens match your filters.",dlgDescription:"Description",dlgAttributes:"Attributes",dlgDetails:"Details",dlgContract:"Contract",dlgTokenId:"Token ID",dlgTokenUri:"Token URI",buyBtn:"Buy now",buyUnavailable:"Trading is not available yet — no market contract has been deployed, so nothing can be bought or sold here yet.",mintTitle:"Mint",mintIntro:"Two steps: deploy your own collection contract (once), then mint NFTs into it. Everything is signed by your wallet.",deployTitle:"1. Create your collection",deployNote:"Deploys a standard ERC-721 collection contract from YOUR wallet. You become its owner and the only minter. This site never holds your keys or your NFTs. Deployment costs gas, paid by you.",colNamePh:"Collection name (e.g. My Art)",colSymbolPh:"Symbol (e.g. MYART)",deployBtn:"Deploy my collection",mintOneTitle:"3. Advanced — mint with a metadata URI",mintOneNote:"For standard collections: mint with a metadata URI you prepared yourself (the original method). The NFT goes to the recipient above.",mintColLbl:"Collection (one you own)",recipientLbl:"Recipient address",uriLbl:"Metadata URI (https://… or ipfs://…)",mintBtn:"Mint NFT",colTypeLbl:"Collection type",typeStandard:"Standard — each token has its own metadata",typeShared:"Shared image — one metadata for all tokens (cheapest for same-art collections)",typeNote:"Shared-image collections store the metadata once, in the contract; every token then shows the same art and name, and each mint is cheap. Standard collections give every token its own metadata URI.",simpleTitle:"2. Simple mint — just attach an image",simpleNote:"Attach an image, name the NFT, and mint — the site builds the metadata and stores it on-chain as a data URI (no external hosting, no accounts). The image is kept in this browser, so the same art can be minted again without re-uploading.",imgLbl:"Image",nftNameLbl:"NFT name",nftNamePh:"e.g. My Art",descLbl:"Description (optional)",imgInfoOrig:"Original image: {a} KB",imgInfoUsed:"Stored image: {b} KB",estCost:"Estimated cost ≈ {x} QOMX (an estimate at the current gas price)",setImgBtn:"Set this image on the collection (one time)",mintImgBtn:"Mint with this image",copiesLbl:"Copies",copiesNote:"Each copy is a separate transaction with its own wallet confirmation.",needImage:"Attach an image first.",needSetFirst:"Set this image on the collection first (button above), then mint.",needName:"Give the NFT a name first.",imgSetOk:"Collection image set — you can mint with it now.",settingImg:"Setting the image… check your wallet.",sharedAdvNote:"The selected collection is a shared-image collection: its metadata is set for the whole collection in the simple section above, so per-token URIs don't apply here.",bigImgWarn:"This image is large ({b} KB stored). On-chain storage is expensive — a smaller image is recommended.",progressMinted:"Minted {a} of {b}.",metaHelpTitle:"What is a metadata URI?",metaHelp:"A link to a small JSON file describing the NFT (name, description, image). Upload the JSON and the image to IPFS or your own web space first, then paste the JSON's URL here. This site does not host files.",moreTools:"More tools",toolAgg:"QOM Aggregator",toolFaucet:"QOM Faucet",loading:"Loading…",noTokens:"No tokens found in this collection.",notErc721:"That address is not an ERC-721 contract.",badAddress:"Enter a valid address.",tokensWord:"tokens",contractWord:"contract",showingFirst:"Showing the first {n} tokens.",metaFail:"Metadata unavailable",unnamed:"Unnamed",ownerWord:"Owner",noImage:"No image",needConnect:"Connect your wallet first.",notOwner:"Your wallet does not own this collection (owner: {a}).",deployedOk:"Collection deployed: {a}",deploying:"Deploying… check your wallet.",minting:"Minting… check your wallet.",mintedOk:"Minted token #{id} — sent to {a}.",fillAll:"Fill in every field.",artifactFail:"The collection contract data failed to load, so deploy and mint are unavailable right now.",txFailed:"The transaction failed or was rejected.",rpcError:"Could not read from the chain (RPC error). Reload to retry.",viewExplorer:"View on the explorer",footNote:"Built by the community — not an official product. · RPC: https://rpc.qomx.io · Chain ID: 33303 · Native: QOMX · Collections are standard ERC-721 (OpenZeppelin), deployed by each creator from their own wallet."},
ja:{connect:"ウォレット接続",connected:"接続中",close:"閉じる",disconnect:"切断",wrongChain:"ネットワークが違います。Qom chain（33303）に切り替えてください",noWallet:"ウォレットが見つかりません。ウォレット（MetaMask等）のブラウザで開いてください。",openInWallet:"MetaMaskで開く",brandSub:"マーケット＆ミント",devNotice:"🚧 開発中です。このサイトは試験的なものです。利用は自己責任でお願いします。署名はすべて自分のウォレットで行い、ガス代も自己負担です。",tabMarket:"マーケット",tabMint:"ミント",marketTitle:"NFT を見る",tradeNotice:"売買はまだできません。出品と購入にはマーケット用コントラクトが必要ですが、まだデプロイされていません。購入時の支払いは Q か QOMX を買い手が選べる形を予定していますが、誰がデプロイし、どういうルールにするかは検討中のため、当面は閲覧のみです。",collectionLbl:"コレクション",onlyMine:"自分のだけ",refresh:"更新",addColPh:"コレクションをアドレスで追加（0x…）",addCol:"コレクション追加",searchPh:"名前・トークンID・コレクションで検索…",allCollections:"すべてのコレクション",collectionsWord:"コレクション",statItems:"アイテム",statOwners:"所有者数",statType:"形式",typeSharedShort:"画像共有",tradingChip:"売買はまだできません",statusLbl:"状態",sortLbl:"並び替え",sortIdAsc:"トークンID： 小さい順",sortIdDesc:"トークンID： 大きい順",filtersLbl:"フィルター",noResults:"条件に合うトークンがありません。",dlgDescription:"説明",dlgAttributes:"属性",dlgDetails:"詳細",dlgContract:"コントラクト",dlgTokenId:"トークンID",dlgTokenUri:"トークンURI",buyBtn:"購入する",buyUnavailable:"売買はまだできません。マーケット用コントラクトが未デプロイのため、ここでは何も売買できません。",mintTitle:"ミント",mintIntro:"手順は2つです。まず自分のコレクションのコントラクトをデプロイし（1回だけ）、そこへ NFT をミントします。すべて自分のウォレットで署名します。",deployTitle:"1. コレクションを作る",deployNote:"標準的な ERC-721 コレクションのコントラクトを、あなたのウォレットからデプロイします。あなたが所有者になり、ミントできるのはあなただけです。このサイトが鍵や NFT を預かることはありません。デプロイにはガス代がかかります（自己負担）。",colNamePh:"コレクション名（例：My Art）",colSymbolPh:"シンボル（例：MYART）",deployBtn:"コレクションをデプロイ",mintOneTitle:"3. 詳細設定 — メタデータ URI でミント",mintOneNote:"標準コレクション用： 自分で用意したメタデータ URI でミントします（従来の方式）。宛先は上の受取アドレスです。",mintColLbl:"コレクション（自分が所有するもの）",recipientLbl:"受取アドレス",uriLbl:"メタデータ URI（https://… または ipfs://…）",mintBtn:"NFT をミント",colTypeLbl:"コレクションの形式",typeStandard:"標準 — トークンごとにメタデータを持つ",typeShared:"画像共有 — 全トークンで1つのメタデータ（同じ絵柄のコレクション向け・最安）",typeNote:"画像共有ではメタデータを契約内に1回だけ保存し、全トークンが同じ絵柄と名前になります。ミントは1回ごとに安く済みます。標準ではトークンごとに別のメタデータ URI を持てます。",simpleTitle:"2. かんたんミント — 画像を添付するだけ",simpleNote:"画像を添付して名前を付けるだけで、サイトがメタデータを作り、データ URI としてチェーン上に保存します（外部ホスティングもアカウントも不要）。画像はこのブラウザに保存されるので、同じ絵柄を再アップロードなしで何度でもミントできます。",imgLbl:"画像",nftNameLbl:"NFT の名前",nftNamePh:"例：My Art",descLbl:"説明（任意）",imgInfoOrig:"元の画像： {a} KB",imgInfoUsed:"保存する画像： {b} KB",estCost:"費用の目安 ≈ {x} QOMX（現在のガス価格での概算）",setImgBtn:"この画像をコレクションに設定（1回だけ）",mintImgBtn:"この画像でミント",copiesLbl:"個数",copiesNote:"1個ごとに別のトランザクションとウォレット確認が必要です。",needImage:"先に画像を添付してください。",needSetFirst:"先に上のボタンでこの画像をコレクションに設定してからミントしてください。",needName:"先に名前を付けてください。",imgSetOk:"コレクションに画像を設定しました。ミントできます。",settingImg:"画像を設定中…ウォレットを確認してください。",sharedAdvNote:"選択中のコレクションは画像共有形式です。メタデータは上の簡易セクションでコレクション全体に設定するため、ここでのトークンごとの URI 指定は使えません。",bigImgWarn:"画像が大きいです（保存サイズ {b} KB）。チェーン上の保存は高くつくため、小さい画像をおすすめします。",progressMinted:"{b} 個中 {a} 個をミントしました。",metaHelpTitle:"メタデータ URI とは？",metaHelp:"NFT の情報（名前、説明、画像）を示す小さな JSON ファイルへのリンクです。JSON と画像を先に IPFS や自分の置き場所へ上げてから、その JSON の URL をここへ貼ってください。このサイトはファイルを預かりません。",moreTools:"ほかのツール",toolAgg:"QOM アグリゲーター",toolFaucet:"QOM フォーセット",loading:"読み込み中…",noTokens:"このコレクションにトークンはありません。",notErc721:"そのアドレスは ERC-721 コントラクトではありません。",badAddress:"正しいアドレスを入力してください。",tokensWord:"トークン",contractWord:"コントラクト",showingFirst:"最初の {n} 件を表示しています。",metaFail:"メタデータを取得できません",unnamed:"名前なし",ownerWord:"所有者",noImage:"画像なし",needConnect:"先にウォレットを接続してください。",notOwner:"このコレクションの所有者はあなたのウォレットではありません（所有者： {a}）。",deployedOk:"コレクションをデプロイしました： {a}",deploying:"デプロイ中…ウォレットを確認してください。",minting:"ミント中…ウォレットを確認してください。",mintedOk:"トークン #{id} をミントし、{a} へ送りました。",fillAll:"すべての項目を入力してください。",artifactFail:"コレクションのコントラクト情報を読み込めなかったため、今はデプロイとミントができません。",txFailed:"トランザクションが失敗したか、拒否されました。",rpcError:"チェーンから読み取れませんでした（RPCエラー）。再読み込みしてください。",viewExplorer:"エクスプローラーで見る",footNote:"コミュニティによる開発で、公式のものではありません。· RPC: https://rpc.qomx.io · Chain ID: 33303 · ネイティブ: QOMX · コレクションは標準 ERC-721（OpenZeppelin）で、各作成者が自分のウォレットからデプロイします。"}
};
let lang = "en";
try { lang = localStorage.getItem("qomnft-lang") || "en"; } catch (e) {}
if (!I18N[lang]) lang = "en";
const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
const $ = (id) => document.getElementById(id);
const short = (a) => (a && a.length > 14 ? a.slice(0, 6) + "…" + a.slice(-4) : a || "");

let provider = null;       // ethers BrowserProvider (injected)
let signer = null;
let account = null;
let artifact = null;       // { abi, bytecode } of QomCollection (standard)
let artifactShared = null; // { abi, bytecode } of QomCollectionShared (shared image)
let colInfoCache = {};     // addr -> { name, symbol, enumerable }
let loadSeq = 0;
let marketSel = "ALL";     // selected collection address, or "ALL"
let tokenCache = {};       // addr -> { info, tokens: [{id, owner, uri, meta}], total, capped, loaded, error }

const readProvider = new ethers.JsonRpcProvider(CFG.rpc);
const ERC721_READ = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function supportsInterface(bytes4) view returns (bool)",
  "function owner() view returns (address)",
];

/* ---------- registry ---------- */
function registry() {
  let extra = [];
  try { extra = JSON.parse(localStorage.getItem("qomnft-collections") || "[]"); } catch (e) {}
  const all = [...CFG.seedCollections, ...extra];
  const seen = new Set(), out = [];
  for (const a of all) {
    if (!ethers.isAddress(a)) continue;
    const c = ethers.getAddress(a);
    if (!seen.has(c)) { seen.add(c); out.push(c); }
  }
  return out;
}
function registryAdd(addr) {
  let extra = [];
  try { extra = JSON.parse(localStorage.getItem("qomnft-collections") || "[]"); } catch (e) {}
  extra.push(addr);
  try { localStorage.setItem("qomnft-collections", JSON.stringify(extra)); } catch (e) {}
}

/* ---------- collection reading ---------- */
async function colInfo(addr) {
  if (colInfoCache[addr]) return colInfoCache[addr];
  const c = new ethers.Contract(addr, ERC721_READ, readProvider);
  const info = { addr, name: "", symbol: "", enumerable: false, is721: false };
  try { info.is721 = await c.supportsInterface("0x80ac58cd"); } catch (e) {}
  if (info.is721) {
    try { info.name = await c.name(); } catch (e) {}
    try { info.symbol = await c.symbol(); } catch (e) {}
    try { info.enumerable = await c.supportsInterface("0x780e9d63"); } catch (e) {}
    // Shared-image collections expose sharedURI(); probe for it.
    try {
      const sc = new ethers.Contract(addr, ["function sharedURI() view returns (string)"], readProvider);
      info.sharedURI = await sc.sharedURI();
      info.shared = true;
    } catch (e) { info.shared = false; }
  }
  colInfoCache[addr] = info;
  return info;
}

function ipfsToHttp(u) {
  if (typeof u !== "string") return "";
  if (u.startsWith("ipfs://")) return CFG.ipfsGateway + u.slice(7).replace(/^ipfs\//, "");
  return u;
}

async function fetchMetadata(uri) {
  if (!uri) return null;
  if (uri.startsWith("data:application/json;base64,")) {
    try { return JSON.parse(atob(uri.slice("data:application/json;base64,".length))); } catch (e) { return null; }
  }
  const url = ipfsToHttp(uri);
  if (!/^https:\/\//.test(url)) return null;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}

async function collectionTokenIds(c, info, latestBlock) {
  if (info.enumerable) {
    const total = Number(await c.totalSupply());
    const ids = [];
    for (let i = 0; i < Math.min(total, CFG.maxTokensShown); i++) ids.push(await c.tokenByIndex(i));
    return { ids, total, capped: total > CFG.maxTokensShown };
  }
  // Fallback: derive the token set from Transfer logs (chain is small).
  const topic = ethers.id("Transfer(address,address,uint256)");
  const found = new Map();
  const CHUNK = 20000;
  for (let from = 0; from <= latestBlock; from += CHUNK) {
    const logs = await readProvider.getLogs({ address: info.addr, topics: [topic], fromBlock: from, toBlock: Math.min(from + CHUNK - 1, latestBlock) });
    for (const log of logs) {
      const id = BigInt(log.topics[3]);
      found.set(id.toString(), id);
    }
  }
  const ids = [...found.values()].sort((a, b) => (a < b ? -1 : 1));
  return { ids: ids.slice(0, CFG.maxTokensShown), total: ids.length, capped: ids.length > CFG.maxTokensShown };
}

function setMsg(el, text) { el.textContent = text || ""; el.className = "msg"; }
function setErr(el, text) { el.textContent = text || ""; el.className = "msg err"; }

/* ---------- market: cache, strip, header, grid, item dialog ---------- */
async function ensureCollectionLoaded(addr) {
  const existing = tokenCache[addr];
  if (existing && existing.loaded) return existing;
  const info = await colInfo(addr);
  const entry = { info, tokens: [], total: 0, capped: false, loaded: false, error: null };
  tokenCache[addr] = entry;
  if (!info.is721) { entry.error = "not721"; entry.loaded = true; return entry; }
  const c = new ethers.Contract(addr, ERC721_READ, readProvider);
  const latest = await readProvider.getBlockNumber();
  const { ids, total, capped } = await collectionTokenIds(c, info, latest);
  entry.total = total;
  entry.capped = capped;
  for (const id of ids) {
    let owner = "";
    try { owner = await c.ownerOf(id); } catch (e) { continue; }
    let uri = "";
    try { uri = await c.tokenURI(id); } catch (e) {}
    const meta = await fetchMetadata(uri);
    entry.tokens.push({ id, owner, uri, meta });
  }
  entry.loaded = true;
  return entry;
}
function invalidateTokens(addr) { delete tokenCache[addr]; }

async function loadMarket() {
  const seq = ++loadSeq;
  renderCollectionStrip();
  const addrs = marketSel === "ALL" ? registry() : [marketSel];
  // loadMarket() is the refresh entry point (init, connect, language change,
  // mint completion, Refresh button): re-read the current selection so newly
  // minted tokens show up. Chip switching / search / sort stay cache-only.
  for (const a of addrs) invalidateTokens(a);
  if (addrs.length) setMsg($("marketMsg"), t("loading"));
  try {
    for (const addr of addrs) {
      await ensureCollectionLoaded(addr);
      if (seq !== loadSeq) return;
    }
  } catch (e) {
    if (seq === loadSeq) setErr($("marketMsg"), t("rpcError"));
    return;
  }
  if (seq !== loadSeq) return;
  renderMarket();
}

function selectedAddrs() { return marketSel === "ALL" ? registry() : [marketSel]; }
function renderOrLoad() {
  if (selectedAddrs().every((a) => tokenCache[a] && tokenCache[a].loaded)) renderMarket();
  else loadMarket();
}
function selectCollection(value) {
  marketSel = value;
  renderCollectionStrip();
  renderOrLoad();
}

function renderCollectionStrip() {
  const strip = $("colStrip");
  if (!strip) return;
  strip.replaceChildren();
  const mkChip = (value, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "col-chip" + (marketSel === value ? " active" : "");
    b.textContent = label;
    b.addEventListener("click", () => selectCollection(value));
    strip.appendChild(b);
  };
  mkChip("ALL", t("allCollections"));
  for (const addr of registry()) {
    const info = colInfoCache[addr];
    mkChip(addr, info && info.is721 ? `${info.name || "?"} (${info.symbol || "?"}) · ${short(addr)}` : short(addr));
    if (!info) colInfo(addr).then(() => renderCollectionStrip()).catch(() => {});
  }
}

function tokenName(tok) {
  return tok.meta && typeof tok.meta.name === "string" && tok.meta.name ? tok.meta.name : t("unnamed");
}

function visibleTokens() {
  const q = $("searchInput").value.trim().toLowerCase();
  const mine = $("onlyMine").checked;
  const out = [];
  for (const addr of selectedAddrs()) {
    const entry = tokenCache[addr];
    if (!entry || !entry.loaded || entry.error) continue;
    for (const tok of entry.tokens) {
      if (mine && (!account || !tok.owner || tok.owner.toLowerCase() !== account.toLowerCase())) continue;
      if (q) {
        const hay = (tokenName(tok) + " " + tok.id.toString() + " " + (entry.info.name || "") + " " + (entry.info.symbol || "")).toLowerCase();
        if (!hay.includes(q)) continue;
      }
      out.push({ info: entry.info, tok });
    }
  }
  const dir = $("sortSel").value === "desc" ? -1 : 1;
  out.sort((a, b) => {
    if (a.tok.id !== b.tok.id) return (a.tok.id < b.tok.id ? -1 : 1) * dir;
    return a.info.addr < b.info.addr ? -1 : 1;
  });
  return out;
}

function renderHeader() {
  let items = 0, anyLoaded = false;
  const owners = new Set();
  for (const a of selectedAddrs()) {
    const e = tokenCache[a];
    if (!e || !e.loaded || e.error) continue;
    anyLoaded = true;
    items += e.total;
    for (const tok of e.tokens) if (tok.owner) owners.add(tok.owner.toLowerCase());
  }
  const link = $("colAddrLink");
  if (marketSel === "ALL") {
    $("colTitle").textContent = t("allCollections");
    $("colSymbol").textContent = "";
    link.textContent = "";
    link.removeAttribute("href");
    $("statType").textContent = "ERC-721";
  } else {
    const info = colInfoCache[marketSel];
    const entry = tokenCache[marketSel];
    $("colTitle").textContent = info && info.name ? info.name : short(marketSel);
    $("colSymbol").textContent = info && info.symbol ? info.symbol : "";
    link.textContent = short(marketSel);
    link.href = CFG.explorer + "/address/" + marketSel;
    $("statType").textContent = entry && entry.info && entry.info.shared ? t("typeSharedShort") : "ERC-721";
  }
  $("statItems").textContent = anyLoaded ? String(items) : "–";
  $("statOwners").textContent = anyLoaded ? String(owners.size) : "–";
}

function renderColMeta() {
  if (marketSel === "ALL") {
    let total = 0, capped = false, loadedCount = 0;
    for (const a of registry()) {
      const e = tokenCache[a];
      if (e && e.loaded && !e.error) { total += e.total; loadedCount++; if (e.capped) capped = true; }
    }
    $("colMeta").textContent = loadedCount ? `${registry().length} ${t("collectionsWord")} · ${total} ${t("tokensWord")}` + (capped ? " · " + t("showingFirst").replace("{n}", CFG.maxTokensShown) : "") : "";
    return;
  }
  const info = colInfoCache[marketSel];
  const e = tokenCache[marketSel];
  if (!info || !e || !e.loaded || e.error) { $("colMeta").textContent = ""; return; }
  $("colMeta").textContent = `${info.name || "?"} (${info.symbol || "?"}) · ${e.total} ${t("tokensWord")} · ${t("contractWord")} ${short(marketSel)}` + (e.capped ? " · " + t("showingFirst").replace("{n}", CFG.maxTokensShown) : "");
}

function renderMarket() {
  renderHeader();
  renderColMeta();
  const grid = $("grid");
  grid.replaceChildren();
  if (marketSel !== "ALL") {
    const e = tokenCache[marketSel];
    if (e && e.loaded && e.error === "not721") { setErr($("marketMsg"), t("notErc721")); return; }
  }
  const list = visibleTokens();
  for (const item of list) grid.appendChild(tokenCard(item.info, item.tok));
  const anyTokens = selectedAddrs().some((a) => { const e = tokenCache[a]; return e && e.loaded && !e.error && e.tokens.length > 0; });
  if (!list.length) setMsg($("marketMsg"), anyTokens ? t("noResults") : t("noTokens"));
  else setMsg($("marketMsg"), "");
}

function artworkEl(meta) {
  const name = meta && typeof meta.name === "string" && meta.name ? meta.name : t("unnamed");
  const imgUrl = meta && typeof meta.image === "string" ? ipfsToHttp(meta.image) : "";
  if (imgUrl && (/^https:\/\//.test(imgUrl) || (/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,/.test(imgUrl) && imgUrl.length <= 600000))) {
    const img = document.createElement("img");
    img.alt = name;
    img.loading = "lazy";
    img.src = imgUrl;
    img.onerror = () => { const d = document.createElement("div"); d.className = "nft-noimg"; d.textContent = t("noImage"); img.replaceWith(d); };
    return img;
  }
  const d = document.createElement("div");
  d.className = "nft-noimg";
  d.textContent = meta ? t("noImage") : t("metaFail");
  return d;
}

function tokenCard(info, tok) {
  const card = document.createElement("div");
  card.className = "nft-card";
  card.appendChild(artworkEl(tok.meta));
  const body = document.createElement("div");
  body.className = "nft-card-body";
  const col = document.createElement("div");
  col.className = "nft-col";
  col.textContent = info.name || short(info.addr);
  body.appendChild(col);
  const nm = document.createElement("div");
  nm.className = "nft-name";
  nm.textContent = tokenName(tok) + " ";
  const idSpan = document.createElement("span");
  idSpan.className = "nft-id";
  idSpan.textContent = "#" + tok.id.toString();
  nm.appendChild(idSpan);
  body.appendChild(nm);
  const ow = document.createElement("div");
  ow.className = "nft-owner";
  ow.textContent = t("ownerWord") + ": " + short(tok.owner);
  body.appendChild(ow);
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = "ERC-721";
  body.appendChild(chip);
  card.appendChild(body);
  card.addEventListener("click", () => openItem(info, tok));
  return card;
}

function openItem(info, tok) {
  const media = $("itemMedia");
  media.replaceChildren(artworkEl(tok.meta));
  $("itemCollection").textContent = (info.name || "?") + (info.symbol ? " (" + info.symbol + ")" : "");
  $("itemName").textContent = tokenName(tok) + " #" + tok.id.toString();
  const ownerLink = $("itemOwner");
  ownerLink.textContent = tok.owner || "";
  if (tok.owner) ownerLink.href = CFG.explorer + "/address/" + tok.owner; else ownerLink.removeAttribute("href");
  const desc = tok.meta && typeof tok.meta.description === "string" ? tok.meta.description : "";
  $("itemDescWrap").hidden = !desc;
  $("itemDesc").textContent = desc;
  const attrs = tok.meta && Array.isArray(tok.meta.attributes) ? tok.meta.attributes : [];
  const attrGrid = $("itemAttrs");
  attrGrid.replaceChildren();
  let attrCount = 0;
  for (const a of attrs) {
    if (!a || typeof a !== "object" || a.trait_type == null || a.value == null) continue;
    const box = document.createElement("div");
    box.className = "attr";
    const tt = document.createElement("span");
    tt.className = "attr-type";
    tt.textContent = String(a.trait_type);
    const vv = document.createElement("span");
    vv.className = "attr-value";
    vv.textContent = String(a.value);
    box.appendChild(tt);
    box.appendChild(vv);
    attrGrid.appendChild(box);
    attrCount++;
  }
  $("itemAttrsWrap").hidden = attrCount === 0;
  const cLink = $("itemContract");
  cLink.textContent = info.addr;
  cLink.href = CFG.explorer + "/address/" + info.addr;
  $("itemTokenId").textContent = tok.id.toString();
  const uriLink = $("itemUri");
  if (tok.uri) {
    uriLink.textContent = tok.uri.length > 72 ? tok.uri.slice(0, 72) + "…" : tok.uri;
    uriLink.href = ipfsToHttp(tok.uri);
    uriLink.hidden = false;
  } else { uriLink.hidden = true; }
  $("itemDlg").showModal();
}

/* ---------- selects (mint) + collection strip ---------- */
async function rebuildSelects() {
  const regs = registry();
  const mintSel = $("mintColSelect");
  const prevMint = mintSel.value;
  mintSel.replaceChildren();
  for (const addr of regs) {
    const o = document.createElement("option");
    o.value = addr;
    o.textContent = short(addr);
    mintSel.appendChild(o);
  }
  if (prevMint && regs.includes(prevMint)) mintSel.value = prevMint;
  renderCollectionStrip();
  // Fill in names as they resolve (labels only; values stay addresses).
  for (const addr of regs) {
    colInfo(addr).then((info) => {
      if (!info.is721) return;
      const label = `${info.name || "?"} (${info.symbol || "?"}) · ${short(addr)}`;
      const o = mintSel.querySelector(`option[value="${addr}"]`);
      if (o) o.textContent = label;
      renderCollectionStrip();
    }).catch(() => {});
  }
}

/* ---------- deploy & mint ---------- */
async function sendGas(txReq) {
  const est = await signer.estimateGas(txReq);
  txReq.gasLimit = (est * 120n) / 100n; // Qom chain charges >=50% of the gas limit; estimate x1.2 like qomdex
  return signer.sendTransaction(txReq);
}
function appendExplorerLink(el, hash) {
  el.appendChild(document.createTextNode(" · "));
  const a = document.createElement("a");
  a.href = CFG.explorer + "/tx/" + hash;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = t("viewExplorer");
  el.appendChild(a);
}

async function onDeploy() {
  if (!signer) return setErr($("deployMsg"), t("needConnect"));
  if (!artifact) return setErr($("deployMsg"), t("artifactFail"));
  const name = $("colName").value.trim(), symbol = $("colSymbol").value.trim();
  if (!name || !symbol) return setErr($("deployMsg"), t("fillAll"));
  const art = $("colType").value === "shared" ? artifactShared : artifact;
  if (!art) return setErr($("deployMsg"), t("artifactFail"));
  setMsg($("deployMsg"), t("deploying"));
  try {
    const factory = new ethers.ContractFactory(art.abi, art.bytecode, signer);
    const deployTx = await factory.getDeployTransaction(name, symbol);
    const tx = await sendGas(deployTx);
    const receipt = await tx.wait();
    const addr = receipt.contractAddress;
    registryAdd(addr);
    delete colInfoCache[addr];
    await rebuildSelects();
    marketSel = addr; invalidateTokens(addr);
    $("mintColSelect").value = addr;
    setMsg($("deployMsg"), t("deployedOk").replace("{a}", addr));
    appendExplorerLink($("deployMsg"), tx.hash);
    loadMarket();
  } catch (e) { setErr($("deployMsg"), t("txFailed")); }
}

async function onMint() {
  if (!signer) return setErr($("mintMsg"), t("needConnect"));
  if (!artifact) return setErr($("mintMsg"), t("artifactFail"));
  const addr = $("mintColSelect").value;
  const to = $("mintTo").value.trim(), uri = $("mintUri").value.trim();
  if (!addr || !ethers.isAddress(to) || !uri) return setErr($("mintMsg"), t("fillAll"));
  setMsg($("mintMsg"), t("minting"));
  try {
    const c = new ethers.Contract(addr, artifact.abi, signer);
    const owner = await c.owner();
    if (owner.toLowerCase() !== account.toLowerCase()) return setErr($("mintMsg"), t("notOwner").replace("{a}", short(owner)));
    const txReq = await c.mint.populateTransaction(ethers.getAddress(to), uri);
    const tx = await sendGas(txReq);
    const receipt = await tx.wait();
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = c.interface.parseLog(log);
        if (parsed && parsed.name === "Transfer") { tokenId = parsed.args[2]; break; }
      } catch (e) {}
    }
    if (tokenId === null) { try { tokenId = await c.totalMinted(); } catch (e) {} }
    setMsg($("mintMsg"), t("mintedOk").replace("{id}", tokenId !== null ? tokenId.toString() : "?").replace("{a}", short(to)));
    appendExplorerLink($("mintMsg"), tx.hash);
  } catch (e) { setErr($("mintMsg"), t("txFailed")); }
}

/* ---------- wallet (unified pattern, same as QOM DEX) ---------- */
function getInjectedProvider() {
  const eth = window.ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.find((p) => p.isMetaMask) || eth.providers[0];
  }
  return eth;
}
async function ensureChain(injected) {
  const cur = await injected.request({ method: "eth_chainId" });
  if (parseInt(cur, 16) === CFG.chainId) return;
  try {
    await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CFG.chainHex }] });
  } catch (e) {
    if (e && e.code === 4902) {
      await injected.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: CFG.chainHex, chainName: "Qom chain", nativeCurrency: { name: "QOMX", symbol: "QOMX", decimals: 18 }, rpcUrls: [CFG.rpc], blockExplorerUrls: [CFG.explorer] }],
      });
    } else { throw e; }
  }
}
function updateConnectBtn() {
  const btn = $("connectBtn");
  if (account) {
    btn.textContent = "🟢 " + short(account);
    btn.onclick = () => { $("dlgAddr").textContent = account; $("walletDlg").showModal(); };
  } else {
    btn.textContent = t("connect");
    btn.onclick = connectWallet;
  }
}
async function bindWallet(injected) {
  await ensureChain(injected);
  provider = new ethers.BrowserProvider(injected);
  signer = await provider.getSigner();
  account = await signer.getAddress();
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== CFG.chainId) { account = null; signer = null; updateConnectBtn(); alert(t("wrongChain")); return false; }
  updateConnectBtn();
  if (!$("mintTo").value) $("mintTo").value = account;
  return true;
}
async function connectWallet() {
  const injected = getInjectedProvider();
  if (!injected) {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile && confirm(t("noWallet") + "\n\n" + t("openInWallet") + "?")) {
      location.href = "https://metamask.app.link/dapp/" + location.host + location.pathname;
    } else { alert(t("noWallet")); }
    return;
  }
  try {
    await injected.request({ method: "eth_requestAccounts" });
    await bindWallet(injected);
    loadMarket();
  } catch (e) { /* user rejected */ }
}
async function silentRestore() {
  const injected = getInjectedProvider();
  if (!injected) { updateConnectBtn(); return; }
  try {
    const accs = await injected.request({ method: "eth_accounts" });
    if (accs && accs.length) { await bindWallet(injected); }
  } catch (e) {}
  updateConnectBtn();
}
async function disconnectWallet() {
  const injected = getInjectedProvider();
  if (injected) {
    try { await injected.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }); } catch (e) {}
  }
  provider = null; signer = null; account = null;
  $("walletDlg").close();
  updateConnectBtn();
}
function watchInjected() {
  const injected = getInjectedProvider();
  if (!injected || !injected.on) return;
  injected.on("accountsChanged", (accs) => {
    if (!accs || !accs.length) { provider = null; signer = null; account = null; updateConnectBtn(); }
    else { bindWallet(injected).then(() => loadMarket()).catch(() => {}); }
  });
  injected.on("chainChanged", () => { silentRestore().then(() => loadMarket()); });
}

/* ---------- language / theme / tabs ---------- */
function applyLang() {
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $("brandSub").textContent = t("brandSub");
  $("footNote").textContent = t("footNote");
  $("langBtn").textContent = lang === "en" ? "日本語" : "EN";
  document.documentElement.lang = lang === "ja" ? "ja" : "en";
  if (!account) updateConnectBtn();
}
function setLang(l) {
  lang = l;
  try { localStorage.setItem("qomnft-lang", l); } catch (e) {}
  applyLang();
  refreshSimpleMode();
  loadMarket();
}
function applyThemeIcon() { $("themeBtn").textContent = document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙"; }
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("guppy-theme", next); } catch (e) {}
  applyThemeIcon();
}
function showTab(name) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $("tab-market").hidden = name !== "market";
  $("tab-mint").hidden = name !== "mint";
}

/* ---------- wiring ---------- */
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
$("langBtn").addEventListener("click", () => setLang(lang === "en" ? "ja" : "en"));
$("themeBtn").addEventListener("click", toggleTheme);
$("onlyMine").addEventListener("change", renderOrLoad);
$("sortSel").addEventListener("change", () => renderMarket());
$("searchInput").addEventListener("input", () => renderMarket());
$("filterToggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("itemClose").addEventListener("click", () => $("itemDlg").close());
$("refreshBtn").addEventListener("click", () => {
  for (const a of selectedAddrs()) { delete colInfoCache[a]; invalidateTokens(a); }
  loadMarket();
});
$("addColBtn").addEventListener("click", async () => {
  const raw = $("addColAddr").value.trim();
  if (!ethers.isAddress(raw)) return setErr($("marketMsg"), t("badAddress"));
  const addr = ethers.getAddress(raw);
  delete colInfoCache[addr];
  invalidateTokens(addr);
  const info = await colInfo(addr);
  if (!info.is721) return setErr($("marketMsg"), t("notErc721"));
  registryAdd(addr);
  await rebuildSelects();
  marketSel = addr;
  $("addColAddr").value = "";
  loadMarket();
});
$("deployBtn").addEventListener("click", onDeploy);
$("mintBtn").addEventListener("click", onMint);
$("imgFile").addEventListener("change", onImageSelected);
$("nftName").addEventListener("input", () => { saveSimple(); renderSimpleInfo(); });
$("nftDesc").addEventListener("input", () => { saveSimple(); renderSimpleInfo(); });
$("setImgBtn").addEventListener("click", onSetImage);
$("mintImgBtn").addEventListener("click", onMintImage);
$("mintColSelect").addEventListener("change", () => { const a = $("mintColSelect").value; if (a) colInfo(a).then(refreshSimpleMode); else refreshSimpleMode(); });
$("dlgClose").addEventListener("click", () => $("walletDlg").close());
$("dlgDisconnect").addEventListener("click", disconnectWallet);

(async function init() {
  applyLang();
  applyThemeIcon();
  try {
    const r = await fetch("collection-artifact.json");
    if (r.ok) artifact = await r.json();
  } catch (e) {}
  try {
    const r2 = await fetch("collection-shared-artifact.json");
    if (r2.ok) artifactShared = await r2.json();
  } catch (e) {}
  restoreSimple();
  await rebuildSelects();
  await silentRestore();
  watchInjected();
  refreshSimpleMode();
  loadMarket();
})();

/* ---------- simple mint (attach an image) ---------- */
let simple = { imageData: "", rawKB: 0, uri: "" };
let gasPriceCache = { at: 0, wei: 0n };

function dataUrlBytes(u) {
  const i = u.indexOf(",");
  if (i < 0) return 0;
  return Math.floor((u.length - i - 1) * 3 / 4);
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function downscale(dataUrl, maxDim) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale >= 1) return resolve(dataUrl);
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL("image/webp", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
async function buildSimpleUri() {
  if (!simple.imageData) { simple.uri = ""; return; }
  const meta = { name: $("nftName").value.trim(), description: $("nftDesc").value.trim(), image: simple.imageData };
  const url = await fileToDataUrl(new Blob([JSON.stringify(meta)], { type: "application/json" }));
  simple.uri = "data:application/json;base64," + url.slice(url.indexOf(",") + 1);
}
function saveSimple() {
  try {
    localStorage.setItem("qomnft-simple", JSON.stringify({ imageData: simple.imageData, rawKB: simple.rawKB, name: $("nftName").value, desc: $("nftDesc").value }));
  } catch (e) { /* image too large for localStorage — it still works for this session */ }
}
function restoreSimple() {
  try {
    const s = JSON.parse(localStorage.getItem("qomnft-simple") || "null");
    if (!s) return;
    simple.imageData = s.imageData || "";
    simple.rawKB = s.rawKB || 0;
    if (s.name) $("nftName").value = s.name;
    if (s.desc) $("nftDesc").value = s.desc;
  } catch (e) {}
}
async function currentGasPrice() {
  if (Date.now() - gasPriceCache.at < 60000 && gasPriceCache.wei > 0n) return gasPriceCache.wei;
  try {
    const fee = await readProvider.getFeeData();
    if (fee.gasPrice) gasPriceCache = { at: Date.now(), wei: fee.gasPrice };
  } catch (e) {}
  return gasPriceCache.wei;
}
function estQomx(gas, wei) { return wei > 0n ? (Number(gas) * Number(wei) / 1e18) : 0; }
function fmtQomx(x) { return x >= 100 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2); }
// Measured locally (2026-11-27): a mint's gas ≈ 118,228 + ~705 per tokenURI char
// (the URI is stored on-chain); a shared-collection mint is ~62–96k gas flat.
function uriGas(uriLen) { return 118228 + 705 * uriLen; }

async function renderSimpleInfo() {
  const el = $("imgInfo");
  if (!simple.imageData) { el.textContent = ""; return; }
  const usedKB = dataUrlBytes(simple.imageData) / 1024;
  let txt = t("imgInfoOrig").replace("{a}", simple.rawKB.toFixed(1)) + " · " + t("imgInfoUsed").replace("{b}", usedKB.toFixed(1));
  if (usedKB > 24) txt += " · " + t("bigImgWarn").replace("{b}", usedKB.toFixed(1));
  await buildSimpleUri();
  const wei = await currentGasPrice();
  if (wei > 0n && simple.uri) {
    const addr = $("mintColSelect").value;
    const info = addr ? colInfoCache[addr] : null;
    if (info && info.shared) {
      const setCost = estQomx(uriGas(simple.uri.length), wei);
      const mintCost = estQomx(100000, wei);
      txt += " · " + t("estCost").replace("{x}", fmtQomx(info.sharedURI === simple.uri ? mintCost : setCost + mintCost));
    } else {
      txt += " · " + t("estCost").replace("{x}", fmtQomx(estQomx(uriGas(simple.uri.length), wei)));
    }
  }
  el.textContent = txt;
  const prev = $("imgPreview");
  prev.src = simple.imageData;
  prev.hidden = false;
}

function refreshSimpleMode() {
  const addr = $("mintColSelect").value;
  const info = addr ? colInfoCache[addr] : null;
  const isShared = !!(info && info.shared);
  $("setImgBtn").hidden = !isShared;
  $("sharedAdvNote").hidden = !isShared;
  $("mintBtn").disabled = isShared;
  renderSimpleInfo();
}

async function onImageSelected() {
  const f = $("imgFile").files && $("imgFile").files[0];
  if (!f) return;
  const raw = await fileToDataUrl(f);
  simple.rawKB = dataUrlBytes(raw) / 1024;
  simple.imageData = dataUrlBytes(raw) > 8192 ? await downscale(raw, 256) : raw;
  saveSimple();
  refreshSimpleMode();
}

async function checkMintReady(msgEl) {
  if (!signer) { setErr(msgEl, t("needConnect")); return null; }
  const addr = $("mintColSelect").value;
  const to = $("mintTo").value.trim();
  if (!addr || !ethers.isAddress(to)) { setErr(msgEl, t("fillAll")); return null; }
  const info = await colInfo(addr);
  return { addr, to: ethers.getAddress(to), info };
}
async function checkOwner(c, msgEl) {
  const owner = await c.owner();
  if (owner.toLowerCase() !== account.toLowerCase()) { setErr(msgEl, t("notOwner").replace("{a}", short(owner))); return false; }
  return true;
}
function mintedIdFromReceipt(c, receipt) {
  for (const log of receipt.logs) {
    try {
      const parsed = c.interface.parseLog(log);
      if (parsed && parsed.name === "Transfer") return parsed.args[2];
    } catch (e) {}
  }
  return null;
}

async function onSetImage() {
  const msgEl = $("simpleMsg");
  const ready = await checkMintReady(msgEl);
  if (!ready) return;
  if (!artifactShared) return setErr(msgEl, t("artifactFail"));
  if (!simple.imageData) return setErr(msgEl, t("needImage"));
  if (!$("nftName").value.trim()) return setErr(msgEl, t("needName"));
  await buildSimpleUri();
  setMsg(msgEl, t("settingImg"));
  try {
    const c = new ethers.Contract(ready.addr, artifactShared.abi, signer);
    if (!(await checkOwner(c, msgEl))) return;
    const tx = await sendGas(await c.setSharedURI.populateTransaction(simple.uri));
    await tx.wait();
    delete colInfoCache[ready.addr];
    await colInfo(ready.addr);
    setMsg(msgEl, t("imgSetOk"));
    appendExplorerLink(msgEl, tx.hash);
    refreshSimpleMode();
  } catch (e) { setErr(msgEl, t("txFailed")); }
}

async function onMintImage() {
  const msgEl = $("simpleMsg");
  const ready = await checkMintReady(msgEl);
  if (!ready) return;
  if (!simple.imageData) return setErr(msgEl, t("needImage"));
  if (!$("nftName").value.trim()) return setErr(msgEl, t("needName"));
  await buildSimpleUri();
  const copies = Math.max(1, Math.min(20, parseInt($("mintCopies").value || "1", 10) || 1));
  const isShared = !!ready.info.shared;
  const art = isShared ? artifactShared : artifact;
  if (!art) return setErr(msgEl, t("artifactFail"));
  setMsg(msgEl, t("minting"));
  try {
    const c = new ethers.Contract(ready.addr, art.abi, signer);
    if (!(await checkOwner(c, msgEl))) return;
    if (isShared && ready.info.sharedURI !== simple.uri) return setErr(msgEl, t("needSetFirst"));
    let lastId = null, lastHash = null;
    for (let i = 0; i < copies; i++) {
      const txReq = isShared ? await c.mint.populateTransaction(ready.to) : await c.mint.populateTransaction(ready.to, simple.uri);
      const tx = await sendGas(txReq);
      const receipt = await tx.wait();
      lastId = mintedIdFromReceipt(c, receipt);
      lastHash = tx.hash;
      if (copies > 1) setMsg(msgEl, t("progressMinted").replace("{a}", i + 1).replace("{b}", copies));
    }
    setMsg(msgEl, t("mintedOk").replace("{id}", lastId !== null ? lastId.toString() : "?").replace("{a}", short(ready.to)));
    if (lastHash) appendExplorerLink(msgEl, lastHash);
    loadMarket();
  } catch (e) { setErr(msgEl, t("txFailed")); }
}
