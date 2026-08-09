/**
 * Secure Payer Wallet Generator for AgentHub
 * 
 * This script generates a new Algorand TestNet payer account,
 * writes the mnemonic to .env, and NEVER prints the mnemonic.
 * 
 * Usage: node scripts/generate-payer-wallet.mjs
 */
import algosdk from "algosdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENV_PATH = resolve(ROOT, ".env");

// Generate a new account
const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

// In newer algosdk, addr is an Address object — use .toString()
const address = account.addr.toString();

// Validate the generated account
const isValid = algosdk.isValidAddress(address);
if (!isValid) {
  console.error("❌ Generated address failed validation. Aborting.");
  process.exit(1);
}

console.log("✅ New Algorand TestNet payer account generated successfully.");
console.log(`📍 Payer Public Address: ${address}`);
console.log("🔒 Mnemonic stored securely in .env (never printed).");

// Read existing .env or create from template
let envContent = "";
if (existsSync(ENV_PATH)) {
  envContent = readFileSync(ENV_PATH, "utf-8");
} else {
  envContent = `# AgentHub Environment Variables\n`;
}

// Replace or add PAYER_MNEMONIC
if (envContent.includes("PAYER_MNEMONIC=")) {
  envContent = envContent.replace(
    /PAYER_MNEMONIC=.*/,
    `PAYER_MNEMONIC=${mnemonic}`
  );
} else {
  envContent += `\nPAYER_MNEMONIC=${mnemonic}\n`;
}

// Replace or add PAYER_ADDRESS
if (envContent.includes("PAYER_ADDRESS=")) {
  envContent = envContent.replace(
    /PAYER_ADDRESS=.*/,
    `PAYER_ADDRESS=${address}`
  );
} else {
  // Add after PAYER_MNEMONIC line
  envContent = envContent.replace(
    `PAYER_MNEMONIC=${mnemonic}`,
    `PAYER_MNEMONIC=${mnemonic}\nPAYER_ADDRESS=${address}`
  );
}

writeFileSync(ENV_PATH, envContent, "utf-8");

console.log("\n📋 .env updated with:");
console.log("   ✅ PAYER_MNEMONIC (securely stored, not displayed)");
console.log(`   ✅ PAYER_ADDRESS=${address}`);
console.log("\n🚀 Next steps:");
console.log(`   1. Fund this address with TestNet ALGO: https://lora.algokit.io/testnet/fund`);
console.log(`   2. Opt-in to USDC (ASA ID 10458941)`);
console.log(`   3. Fund with TestNet USDC: https://faucet.circle.com/ → Algorand Testnet`);
