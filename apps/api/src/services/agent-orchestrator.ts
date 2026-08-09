// ===========================================
// Agent Orchestrator — Multi-Skill Planner
// ===========================================
import { getAllSkills } from "./skill-registry.js";
import { aiComplete } from "./ai.service.js";
import type { AgentPlan, AgentPlanStep } from "@agenthub/shared";

/** Map of keywords to skill IDs for deterministic planning */
const SKILL_KEYWORD_MAP: Record<string, string[]> = {
  "resume-reviewer": ["resume", "cv", "career", "job", "hire", "interview prep"],
  "code-reviewer": ["code", "programming", "debug", "review code", "software", "dsa", "algorithm", "leetcode"],
  "text-summarizer": ["summarize", "summary", "condense", "tldr", "article", "research", "notes", "study"],
  "startup-analyzer": ["startup", "business", "idea", "company", "market", "venture", "entrepreneur", "product"],
};

/** Simple deterministic planner that matches query to skills */
function matchSkills(query: string): string[] {
  const lower = query.toLowerCase();
  const matched = new Set<string>();

  for (const [skillId, keywords] of Object.entries(SKILL_KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        matched.add(skillId);
        break;
      }
    }
  }

  return Array.from(matched);
}

/** Create an agent plan from a user query */
export async function createAgentPlan(query: string): Promise<AgentPlan> {
  // First try deterministic matching
  let matchedIds = matchSkills(query);

  // If no matches, use AI to suggest skills
  if (matchedIds.length === 0) {
    try {
      const skills = getAllSkills();
      const skillList = skills.map((s) => `${s.id}: ${s.name} - ${s.description}`).join("\n");

      const result = await aiComplete({
        systemPrompt: `You are a task planner. Given a user request, select which AI skills from the list below would be most helpful. Return ONLY a JSON array of skill IDs, nothing else. Example: ["resume-reviewer", "code-reviewer"]\n\nAvailable skills:\n${skillList}`,
        userPrompt: query,
        maxTokens: 200,
      });

      const parsed = JSON.parse(result.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      if (Array.isArray(parsed)) {
        matchedIds = parsed.filter((id: string) => skills.some((s) => s.id === id));
      }
    } catch {
      // Fallback: use all skills
      matchedIds = getAllSkills().map((s) => s.id);
    }
  }

  // Build the plan
  const skills = getAllSkills();
  const steps: AgentPlanStep[] = matchedIds.map((id, i) => {
    const skill = skills.find((s) => s.id === id)!;
    return {
      skillId: skill.id,
      skillName: skill.name,
      description: skill.description,
      price: skill.price,
      order: i + 1,
    };
  });

  const totalCost = steps.reduce((sum, s) => sum + parseFloat(s.price), 0).toFixed(2);

  return {
    query,
    steps,
    totalCost,
    currency: "USDC",
  };
}
