// ===========================================
// Agent Routes — Multi-Skill Orchestration
// ===========================================
import { Hono } from "hono";
import { createAgentPlan } from "../services/agent-orchestrator.js";
import { executePaidRequest } from "../services/payment-client.js";
import { getSkillById } from "../services/skill-registry.js";
import { getExplorerUrl } from "@agenthub/shared";

const agentRoutes = new Hono();

/** POST /api/agent/plan — Create an execution plan */
agentRoutes.post("/plan", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { query } = body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return c.json({ success: false, error: "Query is required" }, 400);
  }

  const plan = await createAgentPlan(query);
  return c.json({ success: true, plan });
});

/** POST /api/agent/execute — Execute all skills in a plan */
agentRoutes.post("/execute", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { query, context } = body;

  if (!query) {
    return c.json({ success: false, error: "Query is required" }, 400);
  }

  const plan = await createAgentPlan(query);
  const results: any[] = [];
  let totalPaid = 0;

  for (const step of plan.steps) {
    const skill = getSkillById(step.skillId);
    if (!skill) continue;

    const reqOrigin = new URL(c.req.url).origin;
    const baseUrl = process.env.API_URL || reqOrigin;
    const url = `${baseUrl}${skill.endpoint}`;

    // Build context-aware input
    const input = `${query}\n\nContext: This is step ${step.order} of a multi-skill agent plan. The user's original request: "${query}"${context ? `\nAdditional context: ${context}` : ""}`;

    const result = await executePaidRequest(url, { input });

    if (result.success) {
      totalPaid += parseFloat(skill.price);
      results.push({
        skill: skill.id,
        skillName: skill.name,
        success: true,
        result: {
          content: result.data?.result?.content || result.data?.content || "",
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
      });
    } else {
      results.push({
        skill: skill.id,
        skillName: skill.name,
        success: false,
        error: result.error,
      });
    }
  }

  return c.json({
    success: true,
    plan,
    results,
    totalPaid: totalPaid.toFixed(2),
    currency: "USDC",
  });
});

export { agentRoutes };
