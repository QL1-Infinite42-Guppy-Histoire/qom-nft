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
en:{connect:"Connect Wallet",connected:"Connected",close:"Close",disconnect:"Disconnect",wrongChain:"Wrong network — switch to Qom chain (33303)",noWallet:"No wallet found. Open this page in your wallet's browser (e.g. MetaMask).",openInWallet:"Open in MetaMask",brandSub:"Marketplace & Mint",devNotice:"🚧 Under development — this site is experimental. Use at your own risk: you sign everything with your own wallet and pay your own gas.",tabMarket:"Market",tabMint:"Mint",marketTitle:"Browse NFTs",tradeNotice:"Trading is not available yet: listing and buying need a market contract, which has not been deployed. The plan is to let buyers pay in Q or QOMX (buyer's choice); who deploys the contract and the final rules are still being decided — for now this page is browse-only.",collectionLbl:"Collection",onlyMine:"Only mine",refresh:"Refresh",addColPh:"Add a collection by address (0x…)",addCol:"Add collection",mintTitle:"Mint",mintIntro:"Two steps: deploy your own collection contract (once), then mint NFTs into it. Everything is signed by your wallet.",deployTitle:"1. Create your collection",deployNote:"Deploys a standard ERC-721 collection contract from YOUR wallet. You become its owner and the only minter. This site never holds your keys or your NFTs. Deployment costs gas, paid by you.",colNamePh:"Collection name (e.g. My Art)",colSymbolPh:"Symbol (e.g. MYART)",deployBtn:"Deploy my collection",mintOneTitle:"2. Mint an NFT",mintOneNote:"Mint from a collection you own. The NFT goes straight to the recipient's wallet.",mintColLbl:"Collection (one you own)",recipientLbl:"Recipient address",uriLbl:"Metadata URI (https://… or ipfs://…)",mintBtn:"Mint NFT",metaHelpTitle:"What is a metadata URI?",metaHelp:"A link to a small JSON file describing the NFT (name, description, image). Upload the JSON and the image to IPFS or your own web space first, then paste the JSON's URL here. This site does not host files.",moreTools:"More tools",toolAgg:"QOM Aggregator",toolFaucet:"QOM Faucet",loading:"Loading…",noTokens:"No tokens found in this collection.",notErc721:"That address is not an ERC-721 contract.",badAddress:"Enter a valid address.",tokensWord:"tokens",contractWord:"contract",showingFirst:"Showing the first {n} tokens.",metaFail:"Metadata unavailable",unnamed:"Unnamed",ownerWord:"Owner",noImage:"No image",needConnect:"Connect your wallet first.",notOwner:"Your wallet does not own this collection (owner: {a}).",deployedOk:"Collection deployed: {a}",deploying:"Deploying… check your wallet.",minting:"Minting… check your wallet.",mintedOk:"Minted token #{id} — sent to {a}.",fillAll:"Fill in every field.",artifactFail:"The collection contract data failed to load, so deploy and mint are unavailable right now.",txFailed:"The transaction failed or was rejected.",rpcError:"Could not read from the chain (RPC error). Reload to retry.",viewExplorer:"View on the explorer",footNote:"Built by the community — not an official product. · RPC: https://rpc.qomx.io · Chain ID: 33303 · Native: QOMX · Collections are standard ERC-721 (OpenZeppelin), deployed by each creator from their own wallet."},
ja:{connect:"ウォレット接続",connected:"接続中",close:"閉じる",disconnect:"切断",wrongChain:"ネットワークが違います。Qom chain（33303）に切り替えてください",noWallet:"ウォレットが見つかりません。ウォレット（MetaMask等）のブラウザで開いてください。",openInWallet:"MetaMaskで開く",brandSub:"マーケット＆ミント",devNotice:"🚧 開発中です。このサイトは試験的なものです。利用は自己責任でお願いします。署名はすべて自分のウォレットで行い、ガス代も自己負担です。",tabMarket:"マーケット",tabMint:"ミント",marketTitle:"NFT を見る",tradeNotice:"売買はまだできません。出品と購入にはマーケット用コントラクトが必要ですが、まだデプロイされていません。購入時の支払いは Q か QOMX を買い手が選べる形を予定していますが、誰がデプロイし、どういうルールにするかは検討中のため、当面は閲覧のみです。",collectionLbl:"コレクション",onlyMine:"自分のだけ",refresh:"更新",addColPh:"コレクションをアドレスで追加（0x…）",addCol:"コレクション追加",mintTitle:"ミント",mintIntro:"手順は2つです。まず自分のコレクションのコントラクトをデプロイし（1回だけ）、そこへ NFT をミントします。すべて自分のウォレットで署名します。",deployTitle:"1. コレクションを作る",deployNote:"標準的な ERC-721 コレクションのコントラクトを、あなたのウォレットからデプロイします。あなたが所有者になり、ミントできるのはあなただけです。このサイトが鍵や NFT を預かることはありません。デプロイにはガス代がかかります（自己負担）。",colNamePh:"コレクション名（例：My Art）",colSymbolPh:"シンボル（例：MYART）",deployBtn:"コレクションをデプロイ",mintOneTitle:"2. NFT をミントする",mintOneNote:"自分が所有するコレクションからミントします。NFT は受取人のウォレットへ直接届きます。",mintColLbl:"コレクション（自分が所有するもの）",recipientLbl:"受取アドレス",uriLbl:"メタデータ URI（https://… または ipfs://…）",mintBtn:"NFT をミント",metaHelpTitle:"メタデータ URI とは？",metaHelp:"NFT の情報（名前、説明、画像）を示す小さな JSON ファイルへのリンクです。JSON と画像を先に IPFS や自分の置き場所へ上げてから、その JSON の URL をここへ貼ってください。このサイトはファイルを預かりません。",moreTools:"ほかのツール",toolAgg:"QOM アグリゲーター",toolFaucet:"QOM フォーセット",loading:"読み込み中…",noTokens:"このコレクションにトークンはありません。",notErc721:"そのアドレスは ERC-721 コントラクトではありません。",badAddress:"正しいアドレスを入力してください。",tokensWord:"トークン",contractWord:"コントラクト",showingFirst:"最初の {n} 件を表示しています。",metaFail:"メタデータを取得できません",unnamed:"名前なし",ownerWord:"所有者",noImage:"画像なし",needConnect:"先にウォレットを接続してください。",notOwner:"このコレクションの所有者はあなたのウォレットではありません（所有者： {a}）。",deployedOk:"コレクションをデプロイしました： {a}",deploying:"デプロイ中…ウォレットを確認してください。",minting:"ミント中…ウォレットを確認してください。",mintedOk:"トークン #{id} をミントし、{a} へ送りました。",fillAll:"すべての項目を入力してください。",artifactFail:"コレクションのコントラクト情報を読み込めなかったため、今はデプロイとミントができません。",txFailed:"トランザクションが失敗したか、拒否されました。",rpcError:"チェーンから読み取れませんでした（RPCエラー）。再読み込みしてください。",viewExplorer:"エクスプローラーで見る",footNote:"コミュニティによる開発で、公式のものではありません。· RPC: https://rpc.qomx.io · Chain ID: 33303 · ネイティブ: QOMX · コレクションは標準 ERC-721（OpenZeppelin）で、各作成者が自分のウォレットからデプロイします。"}
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
let artifact = null;       // { abi, bytecode } of QomCollection
let colInfoCache = {};     // addr -> { name, symbol, enumerable }
let loadSeq = 0;

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

async function loadMarket() {
  const addr = $("colSelect").value;
  const grid = $("grid");
  grid.replaceChildren();
  if (!addr) return;
  const seq = ++loadSeq;
  setMsg($("marketMsg"), t("loading"));
  $("colMeta").textContent = "";
  try {
    const info = await colInfo(addr);
    if (!info.is721) { setErr($("marketMsg"), t("notErc721")); return; }
    const c = new ethers.Contract(addr, ERC721_READ, readProvider);
    const latest = await readProvider.getBlockNumber();
    const { ids, total, capped } = await collectionTokenIds(c, info, latest);
    if (seq !== loadSeq) return;
    $("colMeta").textContent = `${info.name || "?"} (${info.symbol || "?"}) · ${total} ${t("tokensWord")} · ${t("contractWord")} ${short(addr)}` + (capped ? " · " + t("showingFirst").replace("{n}", CFG.maxTokensShown) : "");
    if (!ids.length) { setMsg($("marketMsg"), t("noTokens")); return; }
    setMsg($("marketMsg"), "");
    let shown = 0;
    for (const id of ids) {
      if (seq !== loadSeq) return;
      let owner = "", uri = "";
      try { owner = await c.ownerOf(id); } catch (e) { continue; }
      if ($("onlyMine").checked && (!account || owner.toLowerCase() !== account.toLowerCase())) continue;
      try { uri = await c.tokenURI(id); } catch (e) {}
      const meta = await fetchMetadata(uri);
      if (seq !== loadSeq) return;
      grid.appendChild(tokenCard(id, owner, meta));
      shown++;
    }
    if (!shown) setMsg($("marketMsg"), t("noTokens"));
  } catch (e) {
    if (seq === loadSeq) setErr($("marketMsg"), t("rpcError"));
  }
}

function tokenCard(id, owner, meta) {
  const card = document.createElement("div");
  card.className = "nft-card";
  const name = meta && typeof meta.name === "string" && meta.name ? meta.name : t("unnamed");
  const imgUrl = meta && typeof meta.image === "string" ? ipfsToHttp(meta.image) : "";
  if (imgUrl && /^https:\/\//.test(imgUrl)) {
    const img = document.createElement("img");
    img.alt = name;
    img.loading = "lazy";
    img.src = imgUrl;
    img.onerror = () => { const d = document.createElement("div"); d.className = "nft-noimg"; d.textContent = t("noImage"); img.replaceWith(d); };
    card.appendChild(img);
  } else {
    const d = document.createElement("div");
    d.className = "nft-noimg";
    d.textContent = meta ? t("noImage") : t("metaFail");
    card.appendChild(d);
  }
  const nm = document.createElement("div");
  nm.className = "nft-name";
  nm.textContent = name + " ";
  const idSpan = document.createElement("span");
  idSpan.className = "nft-id";
  idSpan.textContent = "#" + id.toString();
  nm.appendChild(idSpan);
  card.appendChild(nm);
  const ow = document.createElement("div");
  ow.className = "nft-owner";
  ow.textContent = t("ownerWord") + ": " + short(owner);
  card.appendChild(ow);
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = "ERC-721";
  card.appendChild(chip);
  return card;
}

/* ---------- selects ---------- */
async function rebuildSelects() {
  const regs = registry();
  const colSel = $("colSelect"), mintSel = $("mintColSelect");
  const prevCol = colSel.value, prevMint = mintSel.value;
  colSel.replaceChildren(); mintSel.replaceChildren();
  for (const addr of regs) {
    for (const sel of [colSel, mintSel]) {
      const o = document.createElement("option");
      o.value = addr;
      o.textContent = short(addr);
      sel.appendChild(o);
    }
  }
  if (prevCol && regs.includes(prevCol)) colSel.value = prevCol;
  if (prevMint && regs.includes(prevMint)) mintSel.value = prevMint;
  // Fill in names as they resolve (labels only; values stay addresses).
  for (const addr of regs) {
    colInfo(addr).then((info) => {
      if (!info.is721) return;
      const label = `${info.name || "?"} (${info.symbol || "?"}) · ${short(addr)}`;
      for (const sel of [colSel, mintSel]) {
        const o = sel.querySelector(`option[value="${addr}"]`);
        if (o) o.textContent = label;
      }
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
  setMsg($("deployMsg"), t("deploying"));
  try {
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const deployTx = await factory.getDeployTransaction(name, symbol);
    const tx = await sendGas(deployTx);
    const receipt = await tx.wait();
    const addr = receipt.contractAddress;
    registryAdd(addr);
    delete colInfoCache[addr];
    await rebuildSelects();
    $("colSelect").value = addr;
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
$("colSelect").addEventListener("change", loadMarket);
$("onlyMine").addEventListener("change", loadMarket);
$("refreshBtn").addEventListener("click", () => { delete colInfoCache[$("colSelect").value]; loadMarket(); });
$("addColBtn").addEventListener("click", async () => {
  const raw = $("addColAddr").value.trim();
  if (!ethers.isAddress(raw)) return setErr($("marketMsg"), t("badAddress"));
  const addr = ethers.getAddress(raw);
  delete colInfoCache[addr];
  const info = await colInfo(addr);
  if (!info.is721) return setErr($("marketMsg"), t("notErc721"));
  registryAdd(addr);
  await rebuildSelects();
  $("colSelect").value = addr;
  $("addColAddr").value = "";
  loadMarket();
});
$("deployBtn").addEventListener("click", onDeploy);
$("mintBtn").addEventListener("click", onMint);
$("dlgClose").addEventListener("click", () => $("walletDlg").close());
$("dlgDisconnect").addEventListener("click", disconnectWallet);

(async function init() {
  applyLang();
  applyThemeIcon();
  try {
    const r = await fetch("collection-artifact.json");
    if (r.ok) artifact = await r.json();
  } catch (e) {}
  await rebuildSelects();
  await silentRestore();
  watchInjected();
  loadMarket();
})();
