import { create } from "zustand";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: "Algorand TestNet";
  algoBalance: string | null;
  usdcBalance: string | null;
  hasUsdcOptIn: boolean | null;
  isConnecting: boolean;
  isLoadingBalance: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  setAddress: (address: string | null) => void;
  setBalances: (algoBalance: string, usdcBalance: string, hasUsdcOptIn: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsLoadingBalance: (isLoadingBalance: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  network: "Algorand TestNet",
  algoBalance: null,
  usdcBalance: null,
  hasUsdcOptIn: null,
  isConnecting: false,
  isLoadingBalance: false,
  error: null,
  connect: () => set({ isConnecting: true, error: null }),
  disconnect: () => set({ isConnected: false, address: null, algoBalance: null, usdcBalance: null, hasUsdcOptIn: null }),
  setAddress: (address) => set({ isConnected: !!address, address, isConnecting: false }),
  setBalances: (algoBalance, usdcBalance, hasUsdcOptIn) => set({ algoBalance, usdcBalance, hasUsdcOptIn, isLoadingBalance: false }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setIsLoadingBalance: (isLoadingBalance) => set({ isLoadingBalance }),
  setError: (error) => set({ error, isConnecting: false }),
  clearError: () => set({ error: null }),
}));
