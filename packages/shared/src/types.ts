// ===========================================
// AgentHub Shared Types
// ===========================================

/** Skill category taxonomy */
export type SkillCategory =
  | "Career"
  | "Design"
  | "Development"
  | "Productivity"

  | "Coding"
  | "Writing"
  | "Business"
  | "Education";

/** Skill status */
export type SkillStatus = "active" | "inactive" | "beta";

/** Skill definition in the registry */
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  price: string; // e.g. "0.01"
  currency: string; // e.g. "USDC"
  provider: string;
  endpoint: string;
  inputSchema: SkillInputSchema;
  outputSchema: SkillOutputSchema;
  rating: number;
  usageCount: number;
  status: SkillStatus;
  icon: string; // emoji or icon name
}

/** Input schema for a skill */
export interface SkillInputSchema {
  type: "text" | "file" | "text-area" | "multi-input";
  label: string;
  placeholder: string;
  maxLength?: number;
  fields?: { 
    id: string; 
    label: string; 
    placeholder: string; 
    type: "text" | "number" | "select" | "textarea";
    options?: string[];
  }[];
}

/** Output schema for a skill */
export interface SkillOutputSchema {
  type: "markdown" | "json" | "text";
}

/** Skill execution request from frontend */
export interface SkillExecutionRequest {
  skillId: string;
  input: string;
}

/** Settlement details from x402 PAYMENT-RESPONSE header */
export interface PaymentSettlement {
  success: boolean;
  transaction: string; // Algorand TX ID
  network: string;
  payer?: string;
  errorReason?: string | null;
}

/** Skill execution response to frontend */
export interface SkillExecutionResponse {
  success: boolean;
  skill: string;
  result: {
    content: string;
    format: "markdown" | "json" | "text";
  };
  payment: {
    status: "settled" | "failed" | "pending";
    network: string;
    amount: string;
    currency: string;
  };
  transactionId: string;
  explorerUrl: string;
}

/** Error response */
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

/** Agent mode plan */
export interface AgentPlan {
  query: string;
  steps: AgentPlanStep[];
  totalCost: string;
  currency: string;
}

export interface AgentPlanStep {
  skillId: string;
  skillName: string;
  description: string;
  price: string;
  order: number;
}

/** Agent mode execution result */
export interface AgentExecutionResult {
  plan: AgentPlan;
  results: SkillExecutionResponse[];
  totalPaid: string;
  currency: string;
}

/** Payment history record */
export interface PaymentRecord {
  id: string;
  skillId: string;
  skillName: string;
  amount: string;
  currency: string;
  status: "settled" | "failed";
  transactionId: string;
  network: string;
  timestamp: string;
}

/** Developer skill registration request */
export interface SkillRegistrationRequest {
  name: string;
  description: string;
  category: SkillCategory;
  price: string;
  endpoint: string;
  providerWallet: string;
  providerName: string;
}
