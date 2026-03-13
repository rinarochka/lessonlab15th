import api from "../api";
import { buildPrompt as buildPromptTemplate } from "../lib/prompt";

function extractJson(text) {
  if (!text || typeof text !== "string") return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || start > end) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    try {
      // Fallback: try to fix common mistakes (single quotes / missing quotes)
      const fixed = candidate
        .replace(/\n/g, " ")
        .replace(/([\w\s]+):/g, '"$1":')
        .replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

export async function generateAI(type, vars, opts = {}) {
  const prompt = buildPromptTemplate(type, vars, opts.promptConfig);
  let output = "";

  for await (const chunk of api.generateStream({ prompt, model: opts.model, temperature: opts.temperature })) {
    output += chunk;
  }

  const json = extractJson(output);
  return { raw: output, json };
}

export function extractJsonFromText(text) {
  return extractJson(text);
}

export async function generateAIPrompt(prompt, opts = {}) {
  let output = "";
  for await (const chunk of api.generateStream({ prompt, model: opts.model, temperature: opts.temperature })) {
    output += chunk;
  }
  const json = extractJson(output);
  return { raw: output, json };
}
