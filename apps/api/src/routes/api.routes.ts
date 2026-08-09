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
  const { skillId, input } = body;

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
  const result = await executePaidRequest(internalUrl, { input });

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
