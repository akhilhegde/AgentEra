import algosdk from "algosdk";

// TestNet public API nodes
const ALGOD_SERVER = "https://testnet-api.4160.nodely.dev";
const ALGOD_PORT = 443;
const ALGOD_TOKEN = "";

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// AgentHub USDC on TestNet
export const USDC_ASA_ID = 10458941;

export const getAlgodClient = () => algodClient;

export const fetchAlgodData = async (address: string) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    
    // ALGO balance is in microAlgos
    const algoMicro = accountInfo.amount || 0;
    const algoBalance = (Number(algoMicro) / 1_000_000).toFixed(6);

    let usdcBalance = "0.00";
    let hasUsdcOptIn = false;

    if (accountInfo.assets) {
      const usdcAsset = accountInfo.assets.find((asset: any) => asset["asset-id"] === USDC_ASA_ID);
      if (usdcAsset) {
        hasUsdcOptIn = true;
        // USDC has 6 decimals
        usdcBalance = (Number(usdcAsset.amount) / 1_000_000).toFixed(6);
      }
    }

    return {
      algoBalance,
      usdcBalance,
      hasUsdcOptIn,
    };
  } catch (error) {
    console.error("Error fetching account info from Algorand", error);
    throw error;
  }
};
