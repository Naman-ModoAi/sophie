import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
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
  console.log("Testing Gemini with Google Search grounding...\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Do the research about, Naman Kumar Sahu Icecreamlabs getmodo.in professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
    1. Current role and company
    2. Professional background and expertise areas
    3. Recent professional activities (posts, articles, speaking, achievements)
    4. LinkedIn profile URL if available
    5. 3-5 specific talking points for building rapport in a business meeting
    
    - Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
    - summarize the info upto 500 words, and in markdown format.`,
    config,
  });

  console.log("Response:");
  console.log(response.text);

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
