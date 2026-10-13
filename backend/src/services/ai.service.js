import { GoogleGenAI } from "@google/genai";
import envConfig from "../config/env.js";

const ai = new GoogleGenAI({
    apiKey: envConfig.GOOGLE_API_KEY,
});
 
 
 
export const interaction = async (prompt) => {
  const response = await ai.interactions.create({
    model: "gemini-3.5-flash", // agar ye bhi 404 de to "gemini-3.6-flash" ya "gemini-3.5-flash"
    input: prompt,
  });

  return response.output_text;
};