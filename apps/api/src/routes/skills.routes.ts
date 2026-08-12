// ===========================================
// Skill Routes — x402-Protected Skill Endpoints
// ===========================================
import { Hono } from "hono";
import { executeSkill } from "../services/skill-executor.js";
import { getSkillBySlug } from "../services/skill-registry.js";

const skillRoutes = new Hono();

/** Generic skill handler — called AFTER x402 payment middleware verifies payment */
async function handleSkillExecution(slug: string, input: string) {
  const skill = getSkillBySlug(slug);
  if (!skill) {
    return { error: "Skill not found", status: 404 };
  }

  if (!input || input.trim().length === 0) {
    return { error: "Input is required", status: 400 };
  }

  if (skill.inputSchema.maxLength && input.length > skill.inputSchema.maxLength) {
    return {
      error: `Input exceeds maximum length of ${skill.inputSchema.maxLength} characters`,
      status: 400,
    };
  }

  const result = await executeSkill(slug, input);

  return {
    skill: skill.id,
    skillName: skill.name,
    result: {
      content: result,
      format: skill.outputSchema.type,
    },
    price: skill.price,
    currency: skill.currency,
  };
}

// POST /api/skills/resume-review
skillRoutes.post("/resume-review", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("resume-review", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

// POST /api/skills/code-review
skillRoutes.post("/code-review", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("code-review", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

// POST /api/skills/ppt-content-generation
skillRoutes.post("/ppt-content-generation", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("ppt-content-generation", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

// POST /api/skills/code-converter
skillRoutes.post("/code-converter", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("code-converter", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

export { skillRoutes };
