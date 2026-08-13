// ===========================================
// AgentHub API — Main Server Entry Point
// ===========================================
// IMPORTANT: env.ts MUST be the first import to load .env before any config modules
import "./env.js";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createPaymentMiddleware } from "./middleware/payment.middleware.js";
import { skillRoutes } from "./routes/skills.routes.js";
import { apiRoutes } from "./routes/api.routes.js";
import { agentRoutes } from "./routes/agent.routes.js";
import { initPaymentClient } from "./services/payment-client.js";
import { validateX402Config } from "./config/x402.config.js";
import { validateAIConfig } from "./config/ai.config.js";

const app = new Hono();

// ============================
// Global Middleware
// ============================
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin || origin.includes("localhost") || origin === process.env.FRONTEND_URL) return origin || "";
      if (origin.endsWith('.vercel.app')) return origin;
      return process.env.FRONTEND_URL || "http://localhost:5173";
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["PAYMENT-RESPONSE", "PAYMENT-REQUIRED"],
  })
);

// ============================
// Public Routes (no payment required)
// ============================
app.route("/api", apiRoutes);
app.route("/api/agent", agentRoutes);

// ============================
// x402 Payment-Protected Routes
// ============================
const x402Validation = validateX402Config();
if (x402Validation.valid) {
  try {
    const paymentMiddleware = createPaymentMiddleware();
    app.use("/api/skills/*", paymentMiddleware);
    console.log("🔒 x402 payment middleware active");
  } catch (error) {
    console.error("❌ Failed to initialize x402 middleware:", error);
    console.log("⚠️  Skills will be available WITHOUT payment protection");
  }
} else {
  console.warn(
    `⚠️  x402 payment middleware NOT active. Missing env vars: ${x402Validation.missing.join(", ")}`
  );
  console.log("   Skills will be available WITHOUT payment protection");
}

// Mount skill routes (after payment middleware)
app.route("/api/skills", skillRoutes);

// ============================
// Root
// ============================
app.get("/", (c) => {
  return c.json({
    name: "AgentHub API",
    tagline: "Don't pay for an AI. Pay only for the skill you use.",
    version: "1.0.0",
    docs: "/api/health",
    skills: "/api/skills",
  });
});

// ============================
// Start Server
// ============================
const port = parseInt(process.env.API_PORT || "3001");

// Initialize payment client
const aiValidation = validateAIConfig();
if (!aiValidation.valid) {
  console.warn(`⚠️  AI service not configured. Missing: ${aiValidation.missing.join(", ")}`);
}

initPaymentClient();

console.log(`
╔══════════════════════════════════════════════╗
║           🤖 AgentHub API Server             ║
║     "Pay only for the skill you use"         ║
╠══════════════════════════════════════════════╣
║  Port:        ${String(port).padEnd(30)}║
║  x402:        ${(x402Validation.valid ? "✅ Active" : "⚠️  Not configured").padEnd(30)}║
║  AI:          ${(aiValidation.valid ? "✅ Configured" : "⚠️  Not configured").padEnd(30)}║
║  Facilitator: ${(process.env.FACILITATOR_URL || "default").padEnd(30)}║
╚══════════════════════════════════════════════╝
`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 Server running at http://localhost:${info.port}`);
});

export default app;
