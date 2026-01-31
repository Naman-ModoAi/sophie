import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_GEMINI_API_KEY not found");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const groundingTool = {
  googleSearch: {},
};

const config = {
  tools: [groundingTool],
};

try {
  console.log("Testing grounding metadata structure...\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Who is the CEO of Anthropic?",
    config,
  });

  console.log("Full Response Object:");
  console.log(JSON.stringify(response, null, 2));

  console.log("\n\nUsage Metadata:");
  console.log(JSON.stringify(response.usageMetadata, null, 2));

  console.log("\n\nGrounding Metadata:");
  console.log(JSON.stringify(response.groundingMetadata, null, 2));
} catch (error) {
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
}
