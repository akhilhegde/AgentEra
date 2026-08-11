const algosdk = require("algosdk");

async function main() {
  const algodClient = new algosdk.Algodv2("", "https://testnet-api.4160.nodely.dev", 443);
  
  // Use a random account
  const account = algosdk.generateAccount();
  const suggestedParams = await algodClient.getTransactionParams().do();
  
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    suggestedParams
  });
  
  const signedTxn = txn.signTxn(account.sk);
  
  // We expect this to fail because the account has 0 ALGO for fees, 
  // but it might enter the pool and get rejected, or just fail immediately.
  // Actually, we don't even need to send it. We can't use pendingTransactionInformation without sending it.
  
  // Let's just mock a msgpack response and decode it!
  const mockMsgpack = new Uint8Array([130, 163, 116, 120, 110, 130, 163, 115, 105, 103, 196, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 163, 116, 120, 110, 133, 163, 102, 101, 101, 205, 3, 232, 162, 102, 118, 1, 162, 108, 118, 205, 3, 232, 164, 115, 110, 100, 196, 32, 73, 107, 72, 85, 200, 202, 232, 45, 169, 7, 240, 194, 219, 14, 53, 9, 219, 137, 214, 226, 43, 85, 41, 16, 115, 121, 246, 216, 68, 178, 117, 242, 164, 116, 121, 112, 101, 165, 97, 120, 102, 101, 114, 175, 99, 111, 110, 102, 105, 114, 109, 101, 100, 45, 114, 111, 117, 110, 100, 206, 3, 242, 104, 13]);
  const decoded = algosdk.decodeMsgpack(mockMsgpack, algosdk.modelsv2.PendingTransactionResponse);
  
  console.log("Decoded keys:", Object.keys(decoded));
  console.log("confirmedRound:", decoded.confirmedRound);
  console.log("txn keys:", Object.keys(decoded.txn));
  console.log("txn.txn keys:", Object.keys(decoded.txn.txn));
  console.log("txn.txn type:", decoded.txn.txn.type);
}
main();
