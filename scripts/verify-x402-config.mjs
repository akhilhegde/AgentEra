/**
 * Full x402 Configuration Verification
 * 
 * Checks both payer and receiver accounts on Algorand TestNet.
 * Never prints mnemonic or private key.
 * 
 * Usage: node scripts/verify-x402-config.mjs
 */
import algosdk from "algosdk";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
config({ path: resolve(ROOT, ".env") });

const USDC_ASA_ID = 10458941;
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = 443;

const payerAddress = process.env.PAYER_ADDRESS;
const receiverAddress = process.env.RECEIVER_ADDRESS;
const payerMnemonic = process.env.PAYER_MNEMONIC;
const usdcAsaId = process.env.USDC_ASA_ID;
const facilitatorUrl = process.env.FACILITATOR_URL;

// Check .gitignore
const gitignore = readFileSync(resolve(ROOT, ".gitignore"), "utf-8");
const envProtected = gitignore.includes(".env");

console.log("═══════════════════════════════════════════════════════");
console.log("  🔍 AgentHub x402 Configuration Verification");
console.log("═══════════════════════════════════════════════════════\n");

// 1. Env vars check
console.log("📋 .env Variables:");
console.log(`   PAYER_ADDRESS:     ${payerAddress || "❌ NOT SET"}`);
console.log(`   PAYER_MNEMONIC:    ${payerMnemonic ? "🔒 SET (redacted)" : "❌ NOT SET"}`);
console.log(`   RECEIVER_ADDRESS:  ${receiverAddress || "❌ NOT SET"}`);
console.log(`   USDC_ASA_ID:       ${usdcAsaId || "❌ NOT SET"}`);
console.log(`   FACILITATOR_URL:   ${facilitatorUrl || "❌ NOT SET"}`);
console.log(`   .gitignore:        ${envProtected ? "✅ .env protected" : "❌ .env NOT protected"}`);

// 2. Validate mnemonic matches payer address (without printing mnemonic)
if (payerMnemonic) {
  try {
    const account = algosdk.mnemonicToSecretKey(payerMnemonic);
    const derivedAddr = account.addr.toString();
    const matches = derivedAddr === payerAddress;
    console.log(`   Mnemonic→Address: ${matches ? "✅ Matches PAYER_ADDRESS" : "❌ MISMATCH"}`);
  } catch {
    console.log(`   Mnemonic→Address: ❌ Invalid mnemonic`);
  }
}

const algodClient = new algosdk.Algodv2("", ALGOD_SERVER, ALGOD_PORT);

async function checkAccount(label, address) {
  console.log(`\n${label}:`);
  console.log(`   Address: ${address}`);

  if (!address || address.includes("YOUR_")) {
    console.log(`   ❌ Not configured`);
    return { exists: false };
  }

  if (!algosdk.isValidAddress(address)) {
    console.log(`   ❌ Invalid Algorand address format`);
    return { exists: false };
  }

  try {
    const info = await algodClient.accountInformation(address).do();
    const algoBalance = Number(info.amount) / 1e6;
    const assets = info.assets || [];
    const usdcAsset = assets.find((a) => Number(a.assetId) === USDC_ASA_ID);
    const usdcOptedIn = !!usdcAsset;
    const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;

    console.log(`   💰 ALGO Balance:  ${algoBalance} ALGO`);
    console.log(`   ${usdcOptedIn ? "✅" : "❌"} USDC Opted-in: ${usdcOptedIn ? "YES" : "NO"}`);
    if (usdcOptedIn) {
      console.log(`   💵 USDC Balance:  ${usdcBalance} USDC`);
    }

    return { exists: true, algoBalance, usdcOptedIn, usdcBalance };
  } catch (err) {
    console.log(`   ⚠️  Account not found (never funded): ${err.message || err}`);
    return { exists: false };
  }
}

const payer = await checkAccount("💳 PAYER (pays for skills)", payerAddress);
const receiver = await checkAccount("🏦 RECEIVER (receives payments)", receiverAddress);

// Final verdict
console.log("\n═══════════════════════════════════════════════════════");
console.log("  📊 VERDICT");
console.log("═══════════════════════════════════════════════════════");

const issues = [];
if (!payer.exists) issues.push("Payer account not found on TestNet");
if (payer.exists && !payer.usdcOptedIn) issues.push("Payer not opted into USDC");
if (payer.exists && payer.usdcBalance === 0) issues.push("Payer has 0 USDC");
if (!receiver.exists) issues.push("Receiver account not found on TestNet");
if (receiver.exists && !receiver.usdcOptedIn) issues.push("Receiver not opted into USDC");
if (!payerMnemonic) issues.push("PAYER_MNEMONIC not set");
if (!envProtected) issues.push(".env not in .gitignore");

if (issues.length === 0) {
  console.log("\n   ✅ ALL CHECKS PASSED — Ready for x402 payments!\n");
} else {
  console.log(`\n   ⚠️  ${issues.length} issue(s) found:`);
  issues.forEach((i) => console.log(`      • ${i}`));
  console.log("");
}
