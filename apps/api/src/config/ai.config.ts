// ===========================================
// AI Provider Configuration\n// ===========================================

export type AIProvider = "gemini" | "openai";

export const aiConfig = {
  provider: (process.env.AI_PROVIDER || "gemini") as AIProvider,
  apiKey: process.env.AI_API_KEY || "",
};

export function validateAIConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!aiConfig.apiKey) missing.push("AI_API_KEY");
  return { valid: missing.length === 0, missing };
}
