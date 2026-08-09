/**
 * Check Payer Wallet Status on Algorand TestNet
 * 
 * Checks: account existence, ALGO balance, USDC opt-in status.
 * Never prints mnemonic or private key.
 * 
 * Usage: node scripts/check-payer-status.mjs
 */
import algosdk from "algosdk";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env") });

const USDC_ASA_ID = 10458941;
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = 443;

const address = process.env.PAYER_ADDRESS;
if (!address) {
  console.error("❌ PAYER_ADDRESS not set in .env");
  process.exit(1);
}

console.log("🔍 Payer Wallet Status Check");
console.log("════════════════════════════════════════════════");
console.log(`📍 Address: ${address}`);
console.log(`🌐 Network: Algorand TestNet`);
console.log(`🎯 USDC ASA: ${USDC_ASA_ID}`);
console.log("════════════════════════════════════════════════\n");

const algodClient = new algosdk.Algodv2("", ALGOD_SERVER, ALGOD_PORT);

try {
  const accountInfo = await algodClient.accountInformation(address).do();

  // Balance in microAlgos → ALGO
  const algoBalance = Number(accountInfo.amount) / 1e6;
  const minBalance = Number(accountInfo.minBalance) / 1e6;

  console.log(`💰 ALGO Balance:     ${algoBalance} ALGO`);
  console.log(`📊 Min Balance:      ${minBalance} ALGO`);

  // Check USDC opt-in
  const assets = accountInfo.assets || [];
  const usdcAsset = assets.find((a) => Number(a.assetId) === USDC_ASA_ID);

  if (usdcAsset) {
    const usdcBalance = Number(usdcAsset.amount) / 1e6; // USDC has 6 decimals
    console.log(`✅ USDC Opted-in:    YES`);
    console.log(`💵 USDC Balance:     ${usdcBalance} USDC`);
  } else {
    console.log(`❌ USDC Opted-in:    NO`);
    console.log(`   → Opt-in required before receiving USDC.`);
  }

  console.log("\n════════════════════════════════════════════════");

  // Summary
  if (algoBalance === 0) {
    console.log("⚠️  Account has 0 ALGO. Fund it first:");
    console.log(`   https://lora.algokit.io/testnet/fund`);
  } else if (!usdcAsset) {
    console.log("⚠️  Account needs USDC opt-in. Run:");
    console.log("   node scripts/optin-usdc.mjs");
  } else if (Number(usdcAsset.amount) === 0) {
    console.log("⚠️  Account opted into USDC but has 0 balance. Fund USDC:");
    console.log("   https://faucet.circle.com/ → Algorand Testnet");
  } else {
    console.log("✅ Payer wallet is READY for x402 payments!");
  }

} catch (err) {
  if (err.message && err.message.includes("no accounts found")) {
    console.log("⚠️  Account not found on TestNet (0 ALGO, never funded).");
    console.log("   Fund it first: https://lora.algokit.io/testnet/fund");
  } else {
    console.error("❌ Error checking account:", err.message || err);
  }
}
