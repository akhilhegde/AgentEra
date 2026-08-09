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

// POST /api/skills/logo-design
skillRoutes.post("/logo-design", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("logo-design", body.input || "");
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

// POST /api/skills/ppt-generator
skillRoutes.post("/ppt-generator", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("ppt-generator", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

// POST /api/skills/research
skillRoutes.post("/research", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("research", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

// POST /api/skills/interview-prep
skillRoutes.post("/interview-prep", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = await handleSkillExecution("interview-prep", body.input || "");
  if ("error" in result) {
    return c.json({ success: false, error: result.error }, result.status as any);
  }
  return c.json(result);
});

export { skillRoutes };
