// ===========================================
// AgentHub Shared Constants
// ===========================================

/** USDC ASA ID on Algorand Testnet */
export const USDC_TESTNET_ASA_ID = 10458941;

/** Algorand Testnet Explorer base URL */
export const ALGORAND_TESTNET_EXPLORER = "https://testnet.explorer.perawallet.app/tx";

/** Build explorer URL for a transaction */
export function getExplorerUrl(txId: string): string {
  return `${ALGORAND_TESTNET_EXPLORER}/${txId}`;
}

/** Skill categories with display info */
export const SKILL_CATEGORIES = [
  { id: "Coding", label: "Coding", icon: "💻", color: "#6366f1" },
  { id: "Career", label: "Career", icon: "💼", color: "#8b5cf6" },
  { id: "Writing", label: "Writing", icon: "✍️", color: "#ec4899" },

  { id: "Business", label: "Business", icon: "📊", color: "#f59e0b" },
  { id: "Design", label: "Design", icon: "🎨", color: "#ef4444" },
  { id: "Education", label: "Education", icon: "📚", color: "#22c55e" },
] as const;
