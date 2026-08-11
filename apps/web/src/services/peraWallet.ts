import { PeraWalletConnect } from "@perawallet/connect";
import { useWalletStore } from "../stores/wallet.store";
import { fetchAlgodData } from "./algorand";

// Instantiate the wallet connect sdk
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true,
});

export const connectWallet = async () => {
  const store = useWalletStore.getState();
  store.setIsConnecting(true);
  try {
    const newAccounts = await peraWallet.connect();
    if (newAccounts.length > 0) {
      store.setAddress(newAccounts[0]);
      await refreshWalletData(newAccounts[0]);
    }
  } catch (error: any) {
    if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
      store.setError("Failed to connect Pera Wallet: " + (error?.message || "Unknown error"));
      console.error("Connection error:", error);
    } else {
      store.setIsConnecting(false);
    }
  }
};

export const disconnectWallet = async () => {
  const store = useWalletStore.getState();
  try {
    await peraWallet.disconnect();
  } catch (error) {
    console.error("Disconnect error", error);
  } finally {
    store.disconnect();
  }
};

export const reconnectSession = async () => {
  const store = useWalletStore.getState();
  try {
    const accounts = await peraWallet.reconnectSession();
    if (accounts.length > 0) {
      // Setup disconnect listener
      peraWallet.connector?.on("disconnect", () => {
        store.disconnect();
      });
      store.setAddress(accounts[0]);
      await refreshWalletData(accounts[0]);
    }
  } catch (error: any) {
    if (error?.message?.includes("Session disconnected")) {
      await disconnectWallet();
    } else {
      console.error("Reconnect error:", error);
    }
  }
};

export const refreshWalletData = async (address: string) => {
  const store = useWalletStore.getState();
  store.setIsLoadingBalance(true);
  try {
    const data = await fetchAlgodData(address);
    store.setBalances(data.algoBalance, data.usdcBalance, data.hasUsdcOptIn);
  } catch (error: any) {
    console.error("Failed to fetch wallet data", error);
    store.setError("Failed to fetch balances.");
  } finally {
    store.setIsLoadingBalance(false);
  }
};

export const getPeraWallet = () => peraWallet;
