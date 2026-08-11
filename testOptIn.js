const algosdk = require("algosdk");

try {
  const suggestedParams = {
    fee: 1000,
    firstRound: 1,
    lastRound: 1000,
    genesisID: "testnet-v1.0",
    genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
  };

  const senderAddress = "NN2TLR5WXYDC74KEHGW2MP4KQ7AJLCKQFJ6A2QJ3WSEKJGNFDI2UCKSFJA";

  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: senderAddress,
    amount: 0,
    assetIndex: 10458941,
    suggestedParams,
  });
  
  console.log("Success");
} catch (e) {
  console.error("Error thrown:", e.message);
}
