// ===========================================
// Skill Executor — Runs AI skills with prompts
// ===========================================
import { aiComplete } from "./ai.service.js";

/** Skill-specific prompt templates */
const SKILL_PROMPTS: Record<string, { system: string; userPrefix: string }> = {
  "resume-review": {
    system: `You are an elite executive career strategist, ATS optimization specialist, and technical recruiter. Perform an exhaustively detailed resume analysis. You MUST respond with ONLY valid JSON — no markdown, no extra text, no code fences. The JSON must conform exactly to this structure:

{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "ats": <number 0-100>,
    "content": <number 0-100>,
    "structure": <number 0-100>,
    "keywords": <number 0-100>,
    "recruiterAppeal": <number 0-100>
  },
  "atsAnalysis": {
    "score": <number 0-100>,
    "compatibilityRating": "<string: Excellent|Good|Fair|Poor>",
    "parsingIssues": ["<string>", ...],
    "missingSections": ["<string>", ...],
    "keywordOptimization": "<string paragraph>"
  },
  "sectionAnalysis": [
    {
      "name": "<section name e.g. Contact Information, Summary, Education, Skills, Projects, Experience, Certifications>",
      "grade": "<A+|A|B+|B|C+|C|D|F>",
      "present": <boolean>,
      "strengths": ["<string>", ...],
      "weaknesses": ["<string>", ...],
      "recommendations": ["<string>", ...]
    }
  ],
  "keywordOptimization": {
    "matchScore": <number 0-100>,
    "currentKeywords": ["<string>", ...],
    "missingKeywords": ["<string>", ...],
    "suggestedKeywords": ["<string>", ...]
  },
  "recruiterPerspective": {
    "firstImpression": "<string paragraph — what a recruiter thinks in the first 10 seconds>",
    "redFlags": ["<string>", ...],
    "strongPoints": ["<string>", ...],
    "hiringConfidenceScore": <number 0-100>
  },
  "technicalReview": {
    "techStackRelevance": "<string assessment>",
    "projectQuality": "<string assessment>",
    "projectImpact": "<string assessment>",
    "githubMention": <boolean>,
    "internshipReadiness": "<string assessment>",
    "placementReadiness": "<string assessment>"
  },
  "contentQuality": {
    "score": <number 0-100>,
    "actionVerbs": "<string assessment>",
    "quantifiableImpact": "<string assessment>",
    "achievementStatements": "<string assessment>",
    "grammarQuality": "<string assessment>",
    "clarity": "<string assessment>",
    "readability": "<string assessment>"
  },
  "improvementRoadmap": {
    "critical": [
      { "problem": "<string>", "why": "<string>", "fix": "<string>" }
    ],
    "recommended": [
      { "problem": "<string>", "why": "<string>", "fix": "<string>" }
    ],
    "niceToHave": [
      { "problem": "<string>", "why": "<string>", "fix": "<string>" }
    ]
  },
  "rewriteSuggestions": {
    "betterSummary": "<string — rewritten professional summary>",
    "betterProjectBullets": ["<string>", ...],
    "betterExperienceBullets": ["<string>", ...]
  },
  "careerInsights": {
    "bestMatchingRoles": [
      { "role": "<string>", "matchPercent": <number 0-100> }
    ],
    "skillsGap": {
      "currentSkills": ["<string>", ...],
      "missingSkills": ["<string>", ...],
      "recommendedSkills": ["<string>", ...]
    },
    "learningRoadmap": {
      "thirtyDays": ["<string action item>", ...],
      "sixtyDays": ["<string action item>", ...],
      "ninetyDays": ["<string action item>", ...]
    }
  },
  "finalRecommendation": "<string — one paragraph recruiter-style verdict>"
}

Be thorough. Every array should have at least 2-3 items. Every score should be realistic and justified. Do NOT return anything outside the JSON object.`,
    userPrefix: "Analyze the following resume and target role. Return ONLY valid JSON:\n\n",
  },
  "code-review": {
    system: `You are a Principal Software Architect at a FAANG company performing a ruthless, comprehensive code review. Inspect the code for architecture flaws, security vulnerabilities, O(N) performance bottlenecks, and modern standard adherence. You must be highly elaborative and provide deep technical explanations. Format your response strictly in markdown:

## 📈 Code Quality & Maintainability Score: X/100
Provide a strict score and a deep paragraph evaluating the overall architecture and logic.

## 🏗️ Architecture & Logic Breakdown
Provide a high-level, detailed overview of what the code accomplishes, its structural design patterns, and potential scaling limits.

## 🚨 Detailed Issues Log
### 🔴 Critical Security Vulnerabilities & Bugs
Explain the exact exploit path or bug trigger, and why it is dangerous.
### 🟡 Performance & Time Complexity Warnings
Provide Big-O notation analysis and explain memory leaks or bottlenecks.
### 🔵 Readability, Typing & Clean Code Suggestions
Provide specific suggestions on variable naming, DRY principles, and type safety.

## 🛠️ Production-Ready Refactored Code
Provide a complete, perfectly formatted refactored version of the code that implements ALL recommendations. The code must be robust, documented, and edge-case handled.

## 🧠 Explanation of Key Refactors
Summarize step-by-step why the changes vastly improve performance, maintainability, and safety compared to the original snippet.`,
    userPrefix: "Please perform a deep architectural code review on the following code and any attached code files:\n\n```\n",
  },
  "ppt-content-generation": {
    system: `You are an expert presentation designer. Create slide content for the requested topic and number of slides. 
Return ONLY valid JSON in this exact structure:
{
  "slides": [
    {
      "title": "<string>",
      "content": ["<string>", "<string>"]
    }
  ]
}
Ensure there is NO markdown, NO code fences, ONLY raw valid JSON.`,
    userPrefix: "Please create slide content based on these parameters:\n\n",
  },
  "code-converter": {
    system: `You are an expert programmer polyglot. You convert code from one programming language to another with extreme accuracy, idiomatic patterns, and optimal performance.
Preserve the exact logic, comments, and structure of the original code, but adapt the syntax, standard library calls, and idioms to fit the target language perfectly.
Format your output using markdown code blocks with the target language specified.
Include a brief explanation of any major idiomatic changes you made below the code block.`,
    userPrefix: "Please convert the following code based on the provided details:\n\n",
  }
};

/** Execute a skill with user input */
export async function executeSkill(
  slug: string,
  input: string,
  fileData?: string
): Promise<string> {
  const prompts = SKILL_PROMPTS[slug];
  if (!prompts) {
    throw new Error(`No prompt template found for skill: ${slug}`);
  }

  const suffix = slug === "code-review" ? "\n```" : "";
  const tokenLimit = slug === "resume-review" ? 8192 : 2048;

  const result = await aiComplete({
    systemPrompt: prompts.system,
    userPrompt: prompts.userPrefix + input + suffix,
    fileData,
    maxTokens: tokenLimit,
  });

  return result.content;
}

