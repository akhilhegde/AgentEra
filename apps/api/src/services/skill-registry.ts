// ===========================================
// Skill Registry — In-Memory Implementation
// ===========================================
import type { Skill } from "@agenthub/shared";

/** All registered skills */
const skills: Skill[] = [
  {
    id: "resume-reviewer",
    name: "Resume Review",
    slug: "resume-review",
    description:
      "AI analyzes your resume for formatting, content impact, ATS compatibility, missing keywords, and provides actionable section improvements.",
    category: "Career",
    price: "0.01",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/resume-review",
    inputSchema: {
      type: "text-area",
      label: "Resume text & target role",
      placeholder: "Paste your resume content and optional target job/role...",
      maxLength: 12000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.9,
    usageCount: 1842,
    status: "active",
    icon: "📄",
  },
  {
    id: "logo-designer",
    name: "Logo Design",
    slug: "logo-design",
    description:
      "AI generates comprehensive brand identity concepts, visual logo directions, curated color palettes, typography, and image-generation prompts.",
    category: "Design",
    price: "0.02",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/logo-design",
    inputSchema: {
      type: "text-area",
      label: "Brand name & design preferences",
      placeholder: "Enter brand name, industry, style, colors, and description...",
      maxLength: 5000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.8,
    usageCount: 1420,
    status: "active",
    icon: "🎨",
  },
  {
    id: "code-reviewer",
    name: "Code Review",
    slug: "code-review",
    description:
      "AI inspects source code for bugs, security vulnerabilities, performance bottlenecks, readability, and modern best-practice refactorings.",
    category: "Development",
    price: "0.01",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/code-review",
    inputSchema: {
      type: "text-area",
      label: "Source code & expected behavior",
      placeholder: "Paste your code snippet and language/expected behavior...",
      maxLength: 15000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.9,
    usageCount: 2310,
    status: "active",
    icon: "🔍",
  },
  {
    id: "ppt-generator",
    name: "PPT Generator",
    slug: "ppt-generator",
    description:
      "AI structures complete presentation slide decks slide-by-slide with titles, bullet points, speaker notes, and suggested visuals.",
    category: "Productivity",
    price: "0.03",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/ppt-generator",
    inputSchema: {
      type: "text-area",
      label: "Presentation topic & details",
      placeholder: "Enter topic, slide count, target audience, and purpose...",
      maxLength: 5000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.7,
    usageCount: 940,
    status: "active",
    icon: "📊",
  },
  {
    id: "research-assistant",
    name: "Research Skill",
    slug: "research",
    description:
      "AI synthesizes deep topic inquiries into structured research reports with executive summaries, key findings, analysis, and trade-off evaluations.",
    category: "Research",
    price: "0.02",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/research",
    inputSchema: {
      type: "text-area",
      label: "Research topic & core questions",
      placeholder: "Enter research topic, target questions, and audience...",
      maxLength: 8000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.8,
    usageCount: 1650,
    status: "active",
    icon: "🧠",
  },
  {
    id: "interview-prep",
    name: "Interview Skill",
    slug: "interview-prep",
    description:
      "AI creates personalized interview preparation strategies with tailored technical, behavioral, and HR questions with STAR-format answers.",
    category: "Career",
    price: "0.01",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/interview-prep",
    inputSchema: {
      type: "text-area",
      label: "Job role & experience level",
      placeholder: "Enter target job role, company/industry, experience, and key skills...",
      maxLength: 8000,
    },
    outputSchema: { type: "markdown" },
    rating: 4.9,
    usageCount: 2100,
    status: "active",
    icon: "🎯",
  },
];

/** Custom skills added by developers */
const customSkills: Skill[] = [];

export function getAllSkills(): Skill[] {
  return [...skills, ...customSkills.filter((s) => s.status === "active")];
}

export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find((s) => s.id === id);
}

export function getSkillBySlug(slug: string): Skill | undefined {
  return getAllSkills().find((s) => s.slug === slug);
}

export function getSkillsByCategory(category: string): Skill[] {
  return getAllSkills().filter((s) => s.category === category);
}

export function registerSkill(skill: Skill): void {
  customSkills.push(skill);
}

export function getSkillPrice(slug: string): string | undefined {
  return getSkillBySlug(slug)?.price;
}
