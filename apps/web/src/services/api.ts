// ===========================================
// API Client — Frontend service layer
// ===========================================

const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl ? `${envApiUrl.replace(/\/$/, "")}/api` : "/api";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  provider: string;
  endpoint: string;
  inputSchema: { type: string; label: string; placeholder: string; maxLength?: number };
  outputSchema: { type: string };
  rating: number;
  usageCount: number;
  status: string;
  icon: string;
}

export interface SkillExecutionResponse {
  success: boolean;
  skill: string;
  result: { content: string; format: string };
  payment: { status: string; network: string; amount: string; currency: string };
  transactionId: string;
  explorerUrl: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/** Fetch all skills from the registry */
export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE}/skills`);
  const data = await res.json();
  return data.skills || [];
}

export const fetchPublicConfig = async () => {
  const response = await fetch(`${API_BASE}/config/public`);
  const data = await response.json();
  if (data.success) {
    return data.config;
  }
  return null;
};

/** Fetch a single skill by ID */
export async function fetchSkill(id: string): Promise<Skill | null> {
  const res = await fetch(`${API_BASE}/skills/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.skill || null;
}

export interface Transaction {
  skillId: string;
  skillName: string;
  category: string;
  amount: string;
  currency: string;
  assetId: number;
  txId: string;
  status: string;
  network: string;
  timestamp: string;
  from: string;
  to: string;
}

/** Fetch transaction history for a wallet */
export async function fetchTransactions(walletAddress: string): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions?wallet=${walletAddress}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.transactions || [];
}

/** Execute a skill via the payment proxy */
export async function executeSkill(
  skillId: string,
  input: string,
  fileData?: string
): Promise<SkillExecutionResponse | ErrorResponse> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skillId, input, fileData }),
  });
  return res.json();
}

/** Execute a skill with a user-verified payment */
export async function executeSkillWithPayment(
  skillId: string,
  input: string,
  transactionId: string,
  fileData?: string
): Promise<SkillExecutionResponse | ErrorResponse> {
  const res = await fetch(`${API_BASE}/execute-with-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skillId, input, transactionId, fileData }),
  });
  return res.json();
}
