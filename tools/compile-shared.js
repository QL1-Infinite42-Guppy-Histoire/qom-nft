const fs = require("fs");
const path = require("path");
const solc = require("solc");
const src = fs.readFileSync(path.join(__dirname, "..", "contracts", "QomCollectionShared.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "QomCollectionShared.sol": { content: src } },
  settings: {
    evmVersion: "paris",
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
function findImport(p) {
  try { return { contents: fs.readFileSync(path.join(__dirname, "..", "node_modules", p), "utf8") }; }
  catch (e) { return { error: "not found: " + p }; }
}
const out = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
if (out.errors) for (const e of out.errors) { console.log(e.severity, e.formattedMessage); if (e.severity === "error") process.exit(1); }
const c = out.contracts["QomCollectionShared.sol"]["QomCollectionShared"];
fs.writeFileSync(path.join(__dirname, "..", "docs", "collection-shared-artifact.json"), JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object }));
console.log("compiled OK; bytecode bytes:", c.evm.bytecode.object.length / 2);
