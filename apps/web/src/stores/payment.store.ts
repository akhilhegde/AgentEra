// ===========================================
// Payment History Store (Zustand)
// ===========================================
import { create } from "zustand";
import type { SkillExecutionResponse } from "../services/api";

interface PaymentRecord {
  id: string;
  skillId: string;
  skillName: string;
  amount: string;
  currency: string;
  status: string;
  transactionId: string;
  network: string;
  explorerUrl: string;
  timestamp: string;
  result: string;
}

interface PaymentStore {
  history: PaymentRecord[];
  addPayment: (response: SkillExecutionResponse, skillName: string) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  history: [],
  addPayment: (response, skillName) =>
    set((state) => ({
      history: [
        {
          id: crypto.randomUUID(),
          skillId: response.skill,
          skillName,
          amount: response.payment.amount,
          currency: response.payment.currency,
          status: response.payment.status,
          transactionId: response.transactionId,
          network: response.payment.network,
          explorerUrl: response.explorerUrl,
          timestamp: new Date().toISOString(),
          result: response.result.content,
        },
        ...state.history,
      ],
    })),
}));
