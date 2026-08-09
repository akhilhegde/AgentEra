// ===========================================
// x402 Payment Configuration
// ===========================================

export const x402Config = {
  facilitatorUrl: process.env.FACILITATOR_URL || "https://facilitator.goplausible.xyz",
  receiverAddress: process.env.RECEIVER_ADDRESS || "",
  payerMnemonic: process.env.PAYER_MNEMONIC || "",
  usdcAsaId: parseInt(process.env.USDC_ASA_ID || "10458941"),
};

/** Validate that required x402 config is present */
export function validateX402Config(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!x402Config.receiverAddress) missing.push("RECEIVER_ADDRESS");
  if (!x402Config.payerMnemonic) missing.push("PAYER_MNEMONIC");
  return { valid: missing.length === 0, missing };
}
