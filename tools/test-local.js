const { ethers } = require("ethers");
const Ganache = require("ganache");
const artifact = require("../docs/collection-artifact.json");

(async () => {
  const provider = new ethers.BrowserProvider(Ganache.provider({ logging: { quiet: true } }));
  const owner = await provider.getSigner(0);
  const other = await provider.getSigner(1);
  const ownerAddr = await owner.getAddress(), otherAddr = await other.getAddress();
  let pass = 0, fail = 0;
  const ok = (cond, label) => { console.log((cond ? "PASS" : "FAIL"), label); cond ? pass++ : fail++; };

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
  const c = await factory.deploy("Test Collection", "TEST");
  await c.waitForDeployment();
  const addr = await c.getAddress();
  ok(await c.name() === "Test Collection" && await c.symbol() === "TEST", "name/symbol");
  ok((await c.owner()) === ownerAddr, "deployer is owner");
  ok(await c.supportsInterface("0x80ac58cd"), "ERC721 interface");

  const tx = await c.mint(otherAddr, "ipfs://example/1.json");
  await tx.wait();
  ok((await c.totalMinted()) === 1n, "totalMinted = 1");
  ok((await c.ownerOf(1)) === otherAddr, "token 1 owned by recipient");
  ok((await c.tokenURI(1)) === "ipfs://example/1.json", "tokenURI set");
  ok((await c.balanceOf(otherAddr)) === 1n, "balanceOf recipient = 1");

  let reverted = false;
  try { await (await c.connect(other).mint(otherAddr, "ipfs://x")).wait(); } catch (e) { reverted = true; }
  ok(reverted, "non-owner mint reverts");

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
