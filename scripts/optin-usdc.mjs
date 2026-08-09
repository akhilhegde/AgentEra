/**
 * Opt-in Payer Wallet to USDC (ASA 10458941) on Algorand TestNet
 * 
 * Sends a 0-amount asset transfer to self (standard Algorand opt-in).
 * Never prints mnemonic or private key.
 * 
 * Usage: node scripts/optin-usdc.mjs
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

const mnemonic = process.env.PAYER_MNEMONIC;
const storedAddress = process.env.PAYER_ADDRESS;

if (!mnemonic || mnemonic.includes("your")) {
  console.error("❌ PAYER_MNEMONIC not configured in .env");
  process.exit(1);
}

// Recover account (never print the key)
const account = algosdk.mnemonicToSecretKey(mnemonic);
const address = account.addr.toString();

console.log("🔐 USDC Opt-in for Payer Wallet");
console.log("════════════════════════════════════════════════");
console.log(`📍 Address:  ${address}`);
console.log(`🎯 ASA ID:   ${USDC_ASA_ID}`);
console.log(`🌐 Network:  Algorand TestNet`);
console.log("════════════════════════════════════════════════\n");

const algodClient = new algosdk.Algodv2("", ALGOD_SERVER, ALGOD_PORT);

try {
  // Check if already opted in
  const accountInfo = await algodClient.accountInformation(address).do();
  const assets = accountInfo.assets || [];
  const alreadyOptedIn = assets.some((a) => Number(a.assetId) === USDC_ASA_ID);

  if (alreadyOptedIn) {
    console.log("✅ Already opted into USDC. No action needed.");
    process.exit(0);
  }

  // Get suggested params
  const suggestedParams = await algodClient.getTransactionParams().do();

  // Create opt-in transaction (0-amount asset transfer to self)
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: address,
    receiver: address,
    amount: 0,
    assetIndex: USDC_ASA_ID,
    suggestedParams,
  });

  // Sign the transaction
  const signedTxn = optInTxn.signTxn(account.sk);

  // Submit
  console.log("📤 Submitting opt-in transaction...");
  const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
  console.log(`📋 Transaction ID: ${txid}`);

  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const result = await algosdk.waitForConfirmation(algodClient, txid, 4);
  const confirmedRound = result.confirmedRound;

  console.log(`\n✅ USDC opt-in CONFIRMED!`);
  console.log(`   Round: ${confirmedRound}`);
  console.log(`   TX ID: ${txid}`);
  console.log(`   Explorer: https://testnet.explorer.perawallet.app/tx/${txid}`);
  console.log(`\n🚀 Next: Fund USDC at https://faucet.circle.com/ → Algorand Testnet`);

} catch (err) {
  console.error("❌ Opt-in failed:", err.message || err);
  process.exit(1);
}
