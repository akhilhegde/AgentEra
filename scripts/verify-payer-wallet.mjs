/**
 * Verify Payer Wallet — Safe Script
 * 
 * Prints ONLY the public address. Never prints mnemonic or private key.
 * 
 * Usage: node scripts/verify-payer-wallet.mjs
 */
import algosdk from "algosdk";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env") });

const mnemonic = process.env.PAYER_MNEMONIC;
const storedAddress = process.env.PAYER_ADDRESS;

if (!mnemonic || mnemonic === "your 25 word mnemonic goes here") {
  console.error("❌ PAYER_MNEMONIC not configured in .env");
  process.exit(1);
}

try {
  // Recover account from mnemonic to verify it's valid
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  const derivedAddress = account.addr.toString();

  console.log("🔍 Payer Wallet Verification");
  console.log("════════════════════════════════════════════════");
  console.log(`📍 Derived Address:  ${derivedAddress}`);
  console.log(`📍 Stored Address:   ${storedAddress || "(not set)"}`);
  console.log(`✅ Address Valid:    ${algosdk.isValidAddress(derivedAddress)}`);
  console.log(`✅ Addresses Match:  ${derivedAddress === storedAddress}`);
  console.log(`🔒 Mnemonic:        [REDACTED — never printed]`);
  console.log("════════════════════════════════════════════════");
  console.log(`\n🌐 Fund this address at:`);
  console.log(`   ALGO:  https://lora.algokit.io/testnet/fund`);
  console.log(`   USDC:  https://faucet.circle.com/ → Algorand Testnet`);
  console.log(`\n🔎 View on explorer:`);
  console.log(`   https://testnet.explorer.perawallet.app/address/${derivedAddress}`);
} catch (err) {
  console.error("❌ Invalid mnemonic in .env:", err.message);
  process.exit(1);
}
