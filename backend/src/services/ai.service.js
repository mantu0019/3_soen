  

import { GoogleGenerativeAI } from "@google/generative-ai";
import envConfig from "../config/env.js";

const genAI = new GoogleGenerativeAI(envConfig.GOOGLE_API_KEY);

const SYSTEM_INSTRUCTION = `
You are an experienced MERN stack developer.

Your job is to generate code based strictly on the user's request.

RULES:
1. Create only the files required by the user's request.
2. Do not generate unnecessary files, features, middleware, or configurations.
3. Do not add authentication, rate limiting, or error handling unless requested or necessary for the requested functionality.
4. Keep code modular when multiple files are needed.
5. Preserve existing functionality when modifying existing code.
6. Use valid, executable code.
7. Do not include Markdown fences around JSON.
8. Always return valid JSON matching the specified structure.
9. If the user asks a normal question instead of requesting code,
   return an appropriate text response and an empty files object.
10. File contents must be complete strings, not summaries.

RESPONSE FORMAT:

{
  "text": "Brief explanation of the result",
  "files": {
    "app.js": {
      "contents": "Complete source code here"
    },
    "package.json": {
      "contents": "Complete JSON string here"
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}

IMPORTANT:
- The "files" object must contain flat file names as keys (example: "app.js", "package.json").
- Every file must have a "contents" property containing its complete content as a string.
- Do not invent extra requirements.
- If no files are needed, return "files": {}.
- Return JSON only.
- Never use file name like routes/index.js.
`;

const MODEL_NAMES = [
  envConfig.GEMINI_MODEL,
  envConfig.GEMINI_FALLBACK_MODEL,
].filter(Boolean);

const getModel = (name) =>
  genAI.getGenerativeModel({
    model: name,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) =>
  err?.status === 503 || err?.status === 429 || err?.retryable === true;

// Remove ```json fences if the model adds them anyway
const stripFences = (text) =>
  String(text)
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

const parseAIResponse = (rawText) => {
  let parsed;

  try {
    parsed = JSON.parse(stripFences(rawText));
  } catch {
    const error = new Error("AI returned an invalid JSON response.");
    error.retryable = true; // try again, model may fix it
    throw error;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    const error = new Error("AI returned an invalid response structure.");
    error.retryable = true;
    throw error;
  }

  // Lenient: missing fields get safe defaults instead of throwing,
  // otherwise the user gets NO response at all.
  return {
    text: typeof parsed.text === "string" ? parsed.text : "",
    files:
      parsed.files &&
      typeof parsed.files === "object" &&
      !Array.isArray(parsed.files)
        ? parsed.files
        : {},
    buildCommand: parsed.buildCommand ?? null,
    startCommand: parsed.startCommand ?? null,
  };
};

export const generateResult = async (prompt) => {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("A valid prompt is required.");
  }

  if (MODEL_NAMES.length === 0) {
    throw new Error("No Gemini model is configured.");
  }

  let lastError;

  for (const name of MODEL_NAMES) {
    const model = getModel(name);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return parseAIResponse(responseText);
      } catch (err) {
        lastError = err;

        console.error(`[Gemini] ${name}, attempt ${attempt + 1}:`, err.message);

        if (!isRetryable(err)) break;

        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt);
        }
      }
    }
  }

  throw lastError ?? new Error("AI generation failed.");
};