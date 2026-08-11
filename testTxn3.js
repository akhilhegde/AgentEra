const algosdk = require("algosdk");
const algodClient = new algosdk.Algodv2("", "https://testnet-api.4160.nodely.dev", 443);

async function main() {
  try {
    const txId = "MXKFCFZZX4ZVUJR5PHBIIJEQ3IX5CUARBSRF4HS3ISVWBBX7ETMQ";
    const txInfo = await algodClient.pendingTransactionInformation(txId).do();
    console.log("Keys of txInfo:", Object.keys(txInfo));
    console.log("confirmedRound:", txInfo.confirmedRound);
    console.log("txn keys:", Object.keys(txInfo.txn));
    
    if (txInfo.txn.txn) {
      console.log("txn.txn keys:", Object.keys(txInfo.txn.txn));
      console.log("txn.txn type:", txInfo.txn.txn.type);
      console.log("txn.txn assetTransfer:", txInfo.txn.txn.assetTransfer);
      console.log("txn.txn arcv:", txInfo.txn.txn.arcv);
    }
    
    // Dump for reference
    const util = require('util');
    console.log(util.inspect(txInfo, {showHidden: false, depth: null, colors: true}));
  } catch (err) {
    console.error("Error fetching txn:", err.message);
  }
}
main();
