const algosdk = require('algosdk');
const algodToken = "";
const algodServer = "https://testnet-api.4160.nodely.dev";
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

async function test() {
  try {
    const status = await algodClient.status().do();
    const block = await algodClient.block(status["last-round"]).do();
    if (block.block.txns && block.block.txns.length > 0) {
        console.log(block.block.txns[0].txn);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
