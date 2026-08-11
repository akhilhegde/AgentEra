const algosdk = require("algosdk");

const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  sender: "JV7CIQBYJ5BVOTDHNLOCOAX6BOGKVQWHVFCYIBWD3UPPTM64LKRYWRAUEQ",
  receiver: "JV7CIQBYJ5BVOTDHNLOCOAX6BOGKVQWHVFCYIBWD3UPPTM64LKRYWRAUEQ",
  amount: 1000,
  assetIndex: 12345,
  suggestedParams: {
    fee: 1000,
    firstRound: 1,
    lastRound: 1000,
    genesisID: "testnet-v1.0",
    genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
  }
});

console.log(txn.assetTransferParams);
console.log("receiver.toString():", txn.assetTransferParams.receiver.toString());
