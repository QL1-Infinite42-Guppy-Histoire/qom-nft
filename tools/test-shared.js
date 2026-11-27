const { ethers } = require("ethers");
const Ganache = require("ganache");
const artifact = require("../docs/collection-shared-artifact.json");

(async () => {
  const provider = new ethers.BrowserProvider(Ganache.provider({ logging: { quiet: true } }));
  const owner = await provider.getSigner(0);
  const other = await provider.getSigner(1);
  const ownerAddr = await owner.getAddress(), otherAddr = await other.getAddress();
  let pass = 0, fail = 0;
  const ok = (cond, label, extra) => { console.log((cond ? "PASS" : "FAIL"), label, extra || ""); cond ? pass++ : fail++; };

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
  const c = await factory.deploy("Shared Art", "SHRD");
  await c.waitForDeployment();
  ok((await c.name()) === "Shared Art" && (await c.owner()) === ownerAddr, "deploy + owner");

  const imgB64 = Buffer.alloc(4 * 1024, 66).toString("base64");
  const meta = JSON.stringify({ name: "Shared #art", description: "", image: "data:image/webp;base64," + imgB64 });
  const dataUri = "data:application/json;base64," + Buffer.from(meta).toString("base64");

  let tx = await c.mint(otherAddr); let rc = await tx.wait();
  ok((await c.tokenURI(1)) === "", "tokenURI empty before set", "mint gas " + rc.gasUsed.toString());
  tx = await c.setSharedURI(dataUri); rc = await tx.wait();
  console.log("     setSharedURI one-time gas (4KB image data URI):", rc.gasUsed.toString(), "≈", (Number(rc.gasUsed) * 53.571428571429).toFixed(0), "QOMX milli-units ->", (Number(rc.gasUsed) * 53571428571429 / 1e18).toFixed(1), "QOMX");
  ok((await c.sharedURI()) === dataUri, "sharedURI stored");
  ok((await c.tokenURI(1)) === dataUri, "token 1 sees shared URI");
  tx = await c.mint(otherAddr); rc = await tx.wait();
  ok((await c.tokenURI(2)) === dataUri && (await c.totalMinted()) === 2n, "token 2 shares the same URI", "mint gas " + rc.gasUsed.toString() + " ≈ " + (Number(rc.gasUsed) * 53571428571429 / 1e18).toFixed(2) + " QOMX");
  let reverted = false;
  try { await (await c.connect(other).setSharedURI("ipfs://x")).wait(); } catch (e) { reverted = true; }
  ok(reverted, "non-owner setSharedURI reverts");
  reverted = false;
  try { await (await c.connect(other).mint(otherAddr)).wait(); } catch (e) { reverted = true; }
  ok(reverted, "non-owner mint reverts");
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
