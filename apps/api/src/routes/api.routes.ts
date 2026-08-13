// ===========================================
// Registry & Proxy Routes (NOT x402-protected)
// ===========================================
import { Hono } from "hono";
import {
  getAllSkills,
  getSkillById,
  getSkillBySlug,
  getSkillsByCategory,
} from "../services/skill-registry.js";
import { executePaidRequest } from "../services/payment-client.js";
import { getExplorerUrl } from "@agenthub/shared";
import type { SkillExecutionResponse, ErrorResponse } from "@agenthub/shared";
import { executeSkill } from "../services/skill-executor.js";
import { x402Config } from "../config/x402.config.js";
import algosdk from "algosdk";

const apiRoutes = new Hono();

// ============================
// Skill Registry Endpoints
// ============================

/** GET /api/skills — List all skills */
apiRoutes.get("/skills", (c) => {
  return c.json({ success: true, skills: getAllSkills() });
});

/** GET /api/skills/:id — Get single skill */
apiRoutes.get("/skills/:id", (c) => {
  const skill = getSkillById(c.req.param("id")) || getSkillBySlug(c.req.param("id"));
  if (!skill) {
    return c.json({ success: false, error: "Skill not found" } as ErrorResponse, 404);
  }
  return c.json({ success: true, skill });
});

/** GET /api/categories — List categories */
apiRoutes.get("/categories", (c) => {
  const skills = getAllSkills();
  const categories = [...new Set(skills.map((s) => s.category))];
  return c.json({ success: true, categories });
});

/** GET /api/skills/category/:category — Skills by category */
apiRoutes.get("/skills/category/:category", (c) => {
  const skills = getSkillsByCategory(c.req.param("category"));
  return c.json({ success: true, skills });
});

// ============================
// Payment Proxy — Frontend calls this
// ============================

/** POST /api/execute — Execute a paid skill via server-side x402 proxy */
apiRoutes.post("/execute", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { skillId, input, fileData } = body;

  if (!skillId || !input) {
    return c.json(
      { success: false, error: "skillId and input are required", code: "MISSING_INPUT" } as ErrorResponse,
      400
    );
  }

  const skill = getSkillById(skillId) || getSkillBySlug(skillId);
  if (!skill) {
    return c.json(
      { success: false, error: "Skill not found", code: "SKILL_NOT_FOUND" } as ErrorResponse,
      404
    );
  }

  // Build the internal URL for the x402-protected endpoint
  const port = process.env.API_PORT || "3001";
  const internalUrl = `http://localhost:${port}${skill.endpoint}`;

  console.log(`🎯 Executing skill: ${skill.name} via x402 proxy → ${internalUrl}`);

  // Execute via payment client (handles 402 → sign → retry)
  const result = await executePaidRequest(internalUrl, { input, fileData });

  if (!result.success) {
    return c.json(
      {
        success: false,
        error: result.error || "Payment or execution failed",
        code: "EXECUTION_FAILED",
      } as ErrorResponse,
      402
    );
  }

  // Build the full response with transaction proof
  const response: SkillExecutionResponse = {
    success: true,
    skill: skill.id,
    result: {
      content: result.data?.result?.content || result.data?.content || JSON.stringify(result.data),
      format: skill.outputSchema.type,
    },
    payment: {
      status: result.transactionId ? "settled" : "pending",
      network: result.network || "algorand-testnet",
      amount: skill.price,
      currency: skill.currency,
    },
    transactionId: result.transactionId || "",
    explorerUrl: result.transactionId ? getExplorerUrl(result.transactionId) : "",
  };

  return c.json(response);
});

// ============================
// Payment Verification (User Wallet flow)
// ============================

/** POST /api/execute-with-payment — Execute a skill after verifying an existing user transaction */
apiRoutes.post("/execute-with-payment", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { skillId, input, transactionId, fileData } = body;

  if (!skillId || !input || !transactionId) {
    return c.json(
      { success: false, error: "skillId, input, and transactionId are required", code: "MISSING_INPUT" } as ErrorResponse,
      400
    );
  }

  const skill = getSkillById(skillId) || getSkillBySlug(skillId);
  if (!skill) {
    return c.json(
      { success: false, error: "Skill not found", code: "SKILL_NOT_FOUND" } as ErrorResponse,
      404
    );
  }

  try {
    // 1. Verify transaction on Algorand TestNet
    const algodToken = "";
    // Using a public node for verification, preferably the same one the frontend uses
    const algodServer = "https://testnet-api.4160.nodely.dev";
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    
    // Wait for the transaction to be confirmed (if not already) or just fetch it
    let txInfo;
    try {
       // Wait for up to 4 rounds for the transaction to be confirmed on this node.
       txInfo = await algosdk.waitForConfirmation(algodClient, transactionId, 4);
    } catch (e) {
       throw new Error("Transaction not found or not yet confirmed. Please wait a few seconds and try again.");
    }
    
    // Check if confirmed
    if (txInfo.confirmedRound && txInfo.confirmedRound > 0n) {
      const tx = txInfo.txn.txn;
      
      // Verify receiver (must be x402Config.receiverAddress)
      const receiverAddr = tx.assetTransfer?.receiver?.toString(); // Asset receiver
      if (receiverAddr !== x402Config.receiverAddress) {
         return c.json({ success: false, error: "Invalid receiver address in transaction" } as ErrorResponse, 400);
      }
      
      // Verify ASA ID
      if (Number(tx.assetTransfer?.assetIndex) !== x402Config.usdcAsaId) {
         return c.json({ success: false, error: "Invalid asset ID. Must be USDC." } as ErrorResponse, 400);
      }

      // Verify Amount
      // USDC has 6 decimals, so price * 1,000,000
      const expectedAmount = Math.floor(parseFloat(skill.price) * 1000000);
      if (Number(tx.assetTransfer?.amount) < expectedAmount) {
         return c.json({ success: false, error: "Insufficient payment amount in transaction." } as ErrorResponse, 400);
      }
      
    } else {
      return c.json({ success: false, error: "Transaction is not yet confirmed." } as ErrorResponse, 400);
    }

  } catch (error: any) {
    console.error("Payment verification failed:", error);
    return c.json(
      { success: false, error: error.message || "Failed to verify transaction.", code: "PAYMENT_UNVERIFIED" } as ErrorResponse,
      400
    );
  }

  // 2. Execute skill directly since payment is verified
  console.log(`🎯 Executing skill (user paid): ${skill.name} via tx ${transactionId}`);
  let resultContent = "";
  try {
     resultContent = await executeSkill(skill.slug, input, fileData);
  } catch (err: any) {
     return c.json(
      { success: false, error: err.message || "Skill execution failed", code: "EXECUTION_FAILED" } as ErrorResponse,
      500
    );
  }

  const response: SkillExecutionResponse = {
    success: true,
    skill: skill.id,
    result: {
      content: resultContent,
      format: skill.outputSchema.type,
    },
    payment: {
      status: "settled",
      network: "algorand-testnet",
      amount: skill.price,
      currency: skill.currency,
    },
    transactionId: transactionId,
    explorerUrl: getExplorerUrl(transactionId),
  };

  return c.json(response);
});

// ============================
// Public Config
// ============================

/** GET /api/transactions — Fetch AgentHub transactions for a wallet */
apiRoutes.get("/transactions", async (c) => {
  const walletAddress = c.req.query("wallet");
  if (!walletAddress) {
    return c.json({ success: false, error: "wallet parameter is required" } as ErrorResponse, 400);
  }

  try {
    const url = `https://testnet-idx.4160.nodely.dev/v2/accounts/${walletAddress}/transactions?asset-id=${x402Config.usdcAsaId}&tx-type=axfer`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.transactions) {
      return c.json({ success: true, transactions: [] });
    }

    const txs = data.transactions
      .filter((tx: any) => {
        // Must be a transfer to our receiver address
        const receiver = tx["asset-transfer-transaction"]?.receiver;
        return receiver === x402Config.receiverAddress;
      })
      .map((tx: any) => {
        const amountMicro = tx["asset-transfer-transaction"]?.amount || 0;
        const amount = (Number(amountMicro) / 1000000).toFixed(2);
        
        let skillId = "unknown";
        let skillName = "Unknown Skill";
        let category = "Unknown";
        
        // Parse the note field if it exists
        if (tx.note) {
          try {
            // Note is base64 encoded by the indexer
            const noteText = Buffer.from(tx.note, "base64").toString("utf-8");
            if (noteText.startsWith("agenthub:")) {
              skillId = noteText.replace("agenthub:", "").trim();
              const skill = getSkillById(skillId) || getSkillBySlug(skillId);
              if (skill) {
                skillName = skill.name;
                category = skill.category;
              }
            }
          } catch (e) {
             console.error("Error parsing tx note:", e);
          }
        }
        
        // Fallback guess by price if still unknown
        if (skillId === "unknown") {
            const skills = getAllSkills();
            const matchedSkill = skills.find(s => Number(s.price).toFixed(2) === amount);
            if (matchedSkill) {
               skillId = matchedSkill.id;
               skillName = matchedSkill.name;
               category = matchedSkill.category;
            }
        }

        return {
          skillId,
          skillName,
          category,
          amount,
          currency: "USDC",
          assetId: x402Config.usdcAsaId,
          txId: tx.id,
          status: "confirmed",
          network: "algorand-testnet",
          timestamp: new Date(tx["round-time"] * 1000).toISOString(),
          from: tx.sender,
          to: tx["asset-transfer-transaction"]?.receiver,
        };
      });

    return c.json({ success: true, transactions: txs });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return c.json(
      { success: false, error: error.message || "Failed to fetch transactions" } as ErrorResponse,
      500
    );
  }
});

// ============================
// Public Config
// ============================

/** GET /api/config/public — Expose non-secret config */
apiRoutes.get("/config/public", (c) => {
  return c.json({
    success: true,
    config: {
      receiverAddress: x402Config.receiverAddress,
      usdcAsaId: x402Config.usdcAsaId,
      network: "algorand-testnet"
    }
  });
});

// ============================
// Health & Status
// ============================

apiRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export { apiRoutes };
