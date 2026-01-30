import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  tools: [
    {
      googleSearch: {},
    },
  ],
});

try {
  console.log("Testing Gemini with Google Search grounding...\n");

  const result = await model.generateContent("Naman Kumar Sahu Icecreamlabs getmodo.in professional profile background recent activity");
  const response = result.response;

  console.log("Response:");
  console.log(response.text());

  // Check for grounding metadata
  if (response.groundingMetadata) {
    console.log("\nGrounding Metadata:");
    console.log(JSON.stringify(response.groundingMetadata, null, 2));
  }
} catch (error) {
  console.error("Error:", error.message);
  if (error.response) {
    console.error("Response data:", error.response);
  }
}
