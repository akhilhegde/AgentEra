// ===========================================
// x402 Payment Client — Server-Side Proxy
// ===========================================
// This module creates a payment-aware fetch client that runs
// on the SERVER to protect the payer's private key.
// The frontend calls our proxy endpoint, and WE handle the
// 402 → sign → retry flow internally.
// ===========================================
import algosdk from "algosdk";
import {
  wrapFetchWithPayment,
  x402Client,
  decodePaymentResponseHeader,
} from "@x402/fetch";
import { toClientAvmSigner } from "@x402/avm";
import { ExactAvmScheme, ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
import { x402Config, validateX402Config } from "../config/x402.config.js";

let paymentFetch: typeof fetch | null = null;

/** Initialize the x402 payment client with the payer's signer */
export function initPaymentClient(): boolean {
  const validation = validateX402Config();
  if (!validation.valid) {
    console.warn(
      `⚠️  x402 payment client not initialized. Missing: ${validation.missing.join(", ")}`
    );
    return false;
  }

  try {
    // Create signer from mnemonic
    const account = algosdk.mnemonicToSecretKey(x402Config.payerMnemonic);
    const signer = toClientAvmSigner(Buffer.from(account.sk).toString("base64"));

    // Create x402 client and register AVM scheme
    const client = new x402Client();
    client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(signer as any));

    // Wrap native fetch with payment handling
    paymentFetch = wrapFetchWithPayment(fetch, client);

    console.log("✅ x402 payment client initialized");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize x402 payment client:", error);
    return false;
  }
}

/** Execute a paid request to an x402-protected endpoint */
export async function executePaidRequest(
  url: string,
  body: Record<string, unknown>
): Promise<{
  success: boolean;
  data?: any;
  transactionId?: string;
  network?: string;
  error?: string;
}> {
  if (!paymentFetch) {
    return {
      success: false,
      error:
        "Payment client not initialized. Configure PAYER_MNEMONIC and RECEIVER_ADDRESS in .env",
    };
  }

  try {
    const response = await paymentFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Request failed with status ${response.status}: ${errorText}`,
      };
    }

    // Extract transaction ID from PAYMENT-RESPONSE header
    const paymentResponseHeader = response.headers.get("PAYMENT-RESPONSE");
    let transactionId = "";
    let network = "algorand-testnet";

    if (paymentResponseHeader) {
      try {
        const settlement = decodePaymentResponseHeader(paymentResponseHeader);
        transactionId = settlement.transaction || "";
        network = settlement.network || "algorand-testnet";
      } catch {
        // Try manual base64 decode as fallback
        try {
          const decoded = JSON.parse(atob(paymentResponseHeader));
          transactionId = decoded.transaction || decoded.txHash || "";
          network = decoded.network || "algorand-testnet";
        } catch {
          console.warn("Could not decode PAYMENT-RESPONSE header");
        }
      }
    }

    const data = await response.json();

    return {
      success: true,
      data,
      transactionId,
      network,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Payment execution failed",
    };
  }
}
