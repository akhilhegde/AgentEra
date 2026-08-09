// ===========================================
// AI Service — Provider Abstraction Layer
// ===========================================
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { aiConfig } from "../config/ai.config.js";

/** Generic AI completion interface */
interface AICompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

interface AICompletionResult {
  content: string;
  provider: string;
}

const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-2.0-flash"];

/** Gemini provider with retry & model fallback */
async function completeWithGemini(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const genai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await genai.models.generateContent({
          model,
          contents: `${options.systemPrompt}\n\n${options.userPrompt}`,
          config: {
            maxOutputTokens: options.maxTokens || 2048,
          },
        });
        return {
          content: response.text || "No response generated.",
          provider: `gemini (${model})`,
        };
      } catch (error: any) {
        lastError = error;
        const status = error.status || error.code;
        console.warn(
          `⚠️ Gemini (${model}) attempt ${attempt} failed with status ${status}: ${error.message}`
        );

        // If high demand (503) or rate limit (429), wait and retry
        if (attempt < 3 && (status === 503 || status === 429 || error.message?.includes("demand"))) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        // Break out of retries for this model if non-retriable error
        break;
      }
    }
  }

  throw lastError || new Error("Gemini API generation failed after retries.");
}

/** OpenAI-compatible provider */
async function completeWithOpenAI(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const openai = new OpenAI({ apiKey: aiConfig.apiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
    max_tokens: options.maxTokens || 2048,
  });
  return {
    content: response.choices[0]?.message?.content || "No response generated.",
    provider: "openai",
  };
}

/** Main AI completion function — routes to configured provider */
export async function aiComplete(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  switch (aiConfig.provider) {
    case "gemini":
      return completeWithGemini(options);
    case "openai":
      return completeWithOpenAI(options);
    default:
      throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
  }
}
