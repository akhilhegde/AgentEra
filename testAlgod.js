const algosdk = require("algosdk");
const ALGOD_SERVER = "https://testnet-api.4160.nodely.dev";
const ALGOD_PORT = 443;
const ALGOD_TOKEN = "";
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

async function main() {
  try {
    // Generate a new account just to see the structure of a 0 balance account
    const account = algosdk.generateAccount();
    const accountInfo = await algodClient.accountInformation(account.addr).do();
    console.log("Empty account info:", Object.keys(accountInfo));
    console.log("amount:", accountInfo.amount);
    
    // Now let's try a known testnet account. 
    // I'll just use a common testnet faucet address if possible, but let's just see the structure.
    console.log(accountInfo);
  } catch (err) {
    console.error(err);
  }
}
main();
