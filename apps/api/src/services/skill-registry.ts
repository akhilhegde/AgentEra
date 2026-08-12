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
    id: "ppt-content-generator",
    name: "PPT Content Generation",
    slug: "ppt-content-generation",
    description: "Generate presentation slides content structured into titles and bullet points.",
    category: "Productivity",
    price: "0.01",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/ppt-content-generation",
    inputSchema: {
      type: "multi-input",
      label: "Presentation Details",
      placeholder: "",
      fields: [
        { id: "topic", label: "Topic Name", placeholder: "e.g., The Future of AI Agents", type: "text" },
        { id: "slides", label: "Number of Slides", placeholder: "e.g., 5", type: "number" }
      ]
    },
    outputSchema: { type: "json" },
    rating: 4.8,
    usageCount: 150,
    status: "active",
    icon: "📊",
  },
  {
    id: "code-converter",
    name: "Code Converter",
    slug: "code-converter",
    description: "Convert your code from one programming language to another with high accuracy and idiomatic patterns.",
    category: "Coding",
    price: "0.02",
    currency: "USDC",
    provider: "AgentEra Labs",
    endpoint: "/api/skills/code-converter",
    inputSchema: {
      type: "multi-input",
      label: "Conversion Details",
      placeholder: "",
      fields: [
        { 
          id: "sourceLanguage", 
          label: "Source Language", 
          placeholder: "Select source language...", 
          type: "select",
          options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Other"]
        },
        { 
          id: "targetLanguage", 
          label: "Target Language", 
          placeholder: "Select target language...", 
          type: "select",
          options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Other"]
        },
        {
          id: "code",
          label: "Your Code",
          placeholder: "Paste the code you want to convert here...",
          type: "textarea"
        }
      ]
    },
    outputSchema: { type: "markdown" },
    rating: 4.8,
    usageCount: 420,
    status: "active",
    icon: "🔄",
  }
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
