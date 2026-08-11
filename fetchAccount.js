const algosdk = require("algosdk");

const ALGOD_SERVER = "https://testnet-api.4160.nodely.dev";
const ALGOD_PORT = 443;
const ALGOD_TOKEN = "";

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

const address = "NN2TLR5WXYDC74KEHGW2MP4KQ7AJLCKQFJ6A2QJ3WSEKJGNFDI2UCKSFJA";

async function main() {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    console.log("accountInfo.amount:", accountInfo.amount);
    console.log("accountInfo.assets:", accountInfo.assets ? accountInfo.assets.length : 0);
    console.log(JSON.stringify(accountInfo, null, 2));
  } catch (err) {
    console.error(err);
  }
}
main();
