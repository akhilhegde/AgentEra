const algosdk = require("algosdk");
const algodClient = new algosdk.Algodv2("", "https://testnet-api.4160.nodely.dev", 443);

async function main() {
  try {
    const txInfo = await algodClient.pendingTransactionInformation("MVMBOA53NBGXMDWQCBL2JTXIOL7CFY7BVGHFI2SCL3QVXIYO2XLQ").do();
    console.log("Keys of txInfo:", Object.keys(txInfo));
    console.log("confirmedRound:", txInfo.confirmedRound);
    console.log("txn keys:", Object.keys(txInfo.txn));
    console.log("txn.txn:", txInfo.txn.txn);
    console.log("txn.txn receiver:", txInfo.txn.txn.assetTransferParams?.receiver);
    console.log("txn.txn.arcv:", txInfo.txn.txn.arcv);
    
    // Dump for reference
    const util = require('util');
    console.log(util.inspect(txInfo, {showHidden: false, depth: null, colors: true}));
  } catch (err) {
    console.error(err);
  }
}
main();
