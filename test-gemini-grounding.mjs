import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { writeFileSync } from "fs";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Model pricing configuration (per 1M tokens)
const MODEL_PRICING = {
  "gemini-3-pro-preview": {
    inputPrice: 2.0,
    outputPrice: 12.0,
    searchCostPer1000: 14.0,
    searchBillingModel: "per-query",
  },
  "gemini-3-flash-preview": {
    inputPrice: 0.5,
    outputPrice: 3.0,
    searchCostPer1000: 14.0,
    searchBillingModel: "per-query",
  },
  "gemini-2.5-pro": {
    inputPrice: 1.25,
    outputPrice: 10.0,
    searchCostPer1000: 35.0,
    searchBillingModel: "per-prompt",
  },
  "gemini-2.5-flash": {
    inputPrice: 0.3,
    outputPrice: 2.5,
    searchCostPer1000: 35.0,
    searchBillingModel: "per-prompt",
  },
  "gemini-2.5-flash-lite": {
    inputPrice: 0.1,
    outputPrice: 0.4,
    searchCostPer1000: 35.0,
    searchBillingModel: "per-prompt",
  },
  "gemini-1.5-flash": {
    inputPrice: 0.075,
    outputPrice: 0.3,
    searchCostPer1000: 35.0,
    searchBillingModel: "per-prompt",
  },
};

// Test prompts - 5 different person/company research scenarios
const TEST_PROMPTS = [
  {
    id: 1,
    name: "Person 1: Naman Kumar Sahu (Icecreamlabs)",
    content: `Do the research about, Naman Kumar Sahu Icecreamlabs getmodo.in professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format.
- if the person name along with the company name matches, it is not necessary that domain will match. `,
  },
  {
    id: 2,
    name: "Person 2: Ravikesh Kumar (Icecreamlabs)",
    content: `Do the research about, Ravikesh Kumar, Icecreamlabs, nuworks.co professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format.
- if the person name along with the company name matches, it is not necessary that domain will match. `,

  },
  {
    id: 3,
    name: "Person 3: Adithya Bapu (Icecreamlabs)",
    content: `Do the research about, Adithya Bapu, Icecreamlabs, icecreamlabs.com professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format.
- if the person name along with the company name matches, it is not necessary that domain will match. `,

  },
  {
    id: 4,
    name: "Person 4: Ravindra (icecreamlabs)",
    content: `Do the research about, Ravindra, icecreamlabs, caravindra.in professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format. 
- if the person name along with the company name matches, it is not necessary that domain will match. `,
  },
  {
    id: 5,
    name: "Person 5: Madhu Konety (Icecreamlabs)",
    content: `Do the research about, Madhu Konety, Icecreamlabs, icecreamlabs.com professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format.
- if the person name along with the company name matches, it is not necessary that domain will match. `,
  },
];

// Models to test (grounding-enabled only: Gemini 3.x and 2.5.x)
const modelsToTest = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

// Grounding configuration
const groundingTool = {
  googleSearch: {},
};

const config = {
  tools: [groundingTool],
};

/**
 * Calculate costs for a model response with detailed token breakdown
 */
function calculateCosts(modelName, inputTokens, outputTokens, thinkingTokens, toolUseTokens, searchCount) {
  const pricing = MODEL_PRICING[modelName];
  if (!pricing) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  // Token costs (per 1M tokens)
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;
  // Thinking tokens are billed at output rate
  const thinkingCost = (thinkingTokens / 1_000_000) * pricing.outputPrice;
  // Tool use prompt tokens are billed at input rate
  const toolUseCost = (toolUseTokens / 1_000_000) * pricing.inputPrice;
  const tokenCost = inputCost + outputCost + thinkingCost + toolUseCost;

  // Search costs
  let searchCost = 0;
  if (pricing.searchBillingModel === "per-query") {
    // Per-query billing (Gemini 3 models)
    searchCost = (searchCount / 1000) * pricing.searchCostPer1000;
  } else {
    // Per-prompt billing (Gemini 2.5 and older)
    searchCost = (1 / 1000) * pricing.searchCostPer1000;
  }

  const totalCost = tokenCost + searchCost;

  return {
    inputCost,
    outputCost,
    thinkingCost,
    toolUseCost,
    tokenCost,
    searchCost,
    totalCost,
  };
}

/**
 * Evaluate completeness - checks if response addresses all 5 required sections
 */
function evaluateCompleteness(responseText) {
  const requiredSections = [
    { keyword: ["current role", "company", "position"], weight: 20 },
    { keyword: ["professional background", "expertise", "experience"], weight: 20 },
    { keyword: ["recent", "activities", "posts", "articles"], weight: 20 },
    { keyword: ["linkedin", "profile"], weight: 20 },
    { keyword: ["talking points", "rapport", "meeting"], weight: 20 },
  ];

  const lowerText = responseText.toLowerCase();
  let score = 0;

  requiredSections.forEach((section) => {
    const found = section.keyword.some((kw) => lowerText.includes(kw));
    if (found) score += section.weight;
  });

  return Math.min(100, score);
}

/**
 * Evaluate grounding quality based on searches and sources used
 */
function evaluateGroundingQuality(searchCount, chunkCount) {
  // More searches and sources = better grounding
  const searchScore = Math.min(50, searchCount * 5);
  const sourceScore = Math.min(50, chunkCount * 5);
  return Math.min(100, searchScore + sourceScore);
}

/**
 * Evaluate response length score (optimal 300-600 words)
 */
function evaluateLengthScore(wordCount) {
  if (wordCount >= 300 && wordCount <= 600) {
    return 100;
  } else if (wordCount >= 200 && wordCount < 300) {
    // Slightly too short
    return 70 + ((wordCount - 200) / 100) * 30;
  } else if (wordCount > 600 && wordCount <= 800) {
    // Slightly too long
    return 70 + ((800 - wordCount) / 200) * 30;
  } else if (wordCount < 200) {
    // Too short
    return Math.max(0, (wordCount / 200) * 70);
  } else {
    // Too long
    return Math.max(0, 70 - ((wordCount - 800) / 400) * 70);
  }
}

/**
 * Evaluate structure score based on markdown formatting
 */
function evaluateStructureScore(responseText) {
  let score = 0;

  // Check for headers (# or ##)
  const hasHeaders = /^#{1,3}\s+/m.test(responseText);
  if (hasHeaders) score += 25;

  // Check for bullet points or numbered lists
  const hasLists = /^[\-\*\+]\s+/m.test(responseText) || /^\d+\.\s+/m.test(responseText);
  if (hasLists) score += 25;

  // Check for bold text
  const hasBold = /\*\*[^*]+\*\*/.test(responseText);
  if (hasBold) score += 25;

  // Check for proper paragraphs (multiple line breaks)
  const paragraphCount = responseText.split(/\n\n+/).length;
  if (paragraphCount >= 3) score += 25;

  return Math.min(100, score);
}

/**
 * Evaluate search efficiency (quality searches per token spent)
 */
function evaluateSearchEfficiency(searchCount, totalTokens) {
  if (totalTokens === 0) return 0;
  const efficiency = (searchCount / (totalTokens / 1000)) * 10;
  return Math.min(100, efficiency * 10);
}

/**
 * Calculate overall quality score with weighted metrics
 */
function evaluateResponseQuality(result) {
  if (!result.success) {
    return {
      completeness: 0,
      groundingQuality: 0,
      lengthScore: 0,
      structureScore: 0,
      searchEfficiency: 0,
      overall: 0,
    };
  }

  const completeness = evaluateCompleteness(result.responseText);
  const groundingQuality = evaluateGroundingQuality(result.searchCount, result.chunkCount);
  const lengthScore = evaluateLengthScore(result.wordCount);
  const structureScore = evaluateStructureScore(result.responseText);
  const searchEfficiency = evaluateSearchEfficiency(result.searchCount, result.totalTokens);

  // Weighted average
  const overall =
    completeness * 0.3 +
    groundingQuality * 0.25 +
    structureScore * 0.2 +
    lengthScore * 0.15 +
    searchEfficiency * 0.1;

  return {
    completeness: Math.round(completeness),
    groundingQuality: Math.round(groundingQuality),
    lengthScore: Math.round(lengthScore),
    structureScore: Math.round(structureScore),
    searchEfficiency: Math.round(searchEfficiency),
    overall: Math.round(overall),
  };
}

/**
 * Test a single model with a specific prompt
 */
async function testModel(modelName, prompt) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${modelName}`);
  console.log(`Prompt: ${prompt.name}`);
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt.content,
      config,
    });

    const duration = Date.now() - startTime;

    // Extract usage metadata with detailed token breakdown
    const usageMetadata = response.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const thinkingTokens = usageMetadata.thoughtsTokenCount || 0; // Extended thinking tokens
    const cachedTokens = usageMetadata.cachedContentTokenCount || 0; // Cached tokens
    const toolUseTokens = usageMetadata.toolUsePromptTokenCount || 0; // Tool use prompt tokens
    const totalTokens = usageMetadata.totalTokenCount || 0;

    // Extract grounding metadata from the correct location
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || {};

    // Extract search queries from webSearchQueries array
    const webSearchQueries = groundingMetadata.webSearchQueries || [];
    const searchCount = webSearchQueries.length;

    // Extract grounding supports (sources)
    const groundingSupports = groundingMetadata.groundingSupports || [];
    const sourceCount = groundingSupports.length;

    // Extract grounding chunks (actual sources used)
    const groundingChunks = groundingMetadata.groundingChunks || [];
    const chunkCount = groundingChunks.length;

    // Calculate costs with detailed token breakdown
    const costs = calculateCosts(modelName, inputTokens, outputTokens, thinkingTokens, toolUseTokens, searchCount);

    // Response analysis
    const responseText = response.text || "";
    const wordCount = responseText.split(/\s+/).filter((w) => w.length > 0).length;

    console.log(`✓ Success (${duration}ms)`);

    // Display detailed token breakdown
    console.log(`\nTokens Breakdown:`);
    console.log(`  Prompt: ${inputTokens.toLocaleString()} tokens`);
    console.log(`  Response: ${outputTokens.toLocaleString()} tokens`);
    if (thinkingTokens > 0) {
      console.log(`  Thinking: ${thinkingTokens.toLocaleString()} tokens ⚠️ (extended thinking)`);
    }
    if (toolUseTokens > 0) {
      console.log(`  Tool Use: ${toolUseTokens.toLocaleString()} tokens 🔧 (grounding tool prompt)`);
    }
    if (cachedTokens > 0) {
      console.log(`  Cached: ${cachedTokens.toLocaleString()} tokens 💾 (from cache)`);
    }
    console.log(`  TOTAL: ${totalTokens.toLocaleString()} tokens`);

    // Verify token sum
    const tokenSum = inputTokens + outputTokens + thinkingTokens + toolUseTokens;
    const sumDiff = totalTokens - tokenSum;
    if (Math.abs(sumDiff) > 1) {
      console.log(`  ⚠️ Note: Sum difference of ${sumDiff} tokens (likely cached deduction)`);
    }

    console.log(`\nCost Breakdown:`);
    console.log(`  Input cost: $${costs.inputCost.toFixed(6)} (${inputTokens.toLocaleString()} tokens)`);
    console.log(`  Output cost: $${costs.outputCost.toFixed(6)} (${outputTokens.toLocaleString()} tokens)`);
    if (thinkingTokens > 0) {
      console.log(`  Thinking cost: $${costs.thinkingCost.toFixed(6)} (${thinkingTokens.toLocaleString()} tokens)`);
    }
    if (toolUseTokens > 0) {
      console.log(`  Tool Use cost: $${costs.toolUseCost.toFixed(6)} (${toolUseTokens.toLocaleString()} tokens)`);
    }
    console.log(`  Search cost: $${costs.searchCost.toFixed(6)} (${searchCount} queries)`);
    console.log(`  TOTAL: $${costs.totalCost.toFixed(6)}`);

    console.log(`\nSearch: ${searchCount} queries, ${chunkCount} chunks, ${sourceCount} supports`);
    console.log(`Response: ${wordCount} words`);

    // Display search queries if any
    if (searchCount > 0) {
      console.log(`\n🔍 Search Queries (${searchCount}):`);
      webSearchQueries.forEach((query, i) => {
        console.log(`  ${i + 1}. "${query}"`);
      });
    }

    // Display grounding sources if any
    if (chunkCount > 0) {
      console.log(`\n📚 Grounding Sources (${chunkCount}):`);
      groundingChunks.slice(0, 5).forEach((chunk, i) => {
        const uri = chunk.web?.uri || "N/A";
        const title = chunk.web?.title || "Unknown";
        console.log(`  ${i + 1}. ${title} - ${uri.substring(0, 80)}...`);
      });
      if (chunkCount > 5) {
        console.log(`  ... and ${chunkCount - 5} more sources`);
      }
    }

    // Display response text (first 500 chars only)
    console.log(`\n--- Response Preview (first 500 chars) ---`);
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
    console.log(`--- End Preview ---\n`);

    return {
      modelName,
      promptId: prompt.id,
      promptName: prompt.name,
      success: true,
      duration,
      tokens: {
        prompt: inputTokens,
        response: outputTokens,
        thinking: thinkingTokens,
        toolUse: toolUseTokens,
        cached: cachedTokens,
        total: totalTokens,
      },
      searchCount,
      searchQueries: webSearchQueries,
      chunkCount,
      sourceCount,
      costs,
      wordCount,
      responseText,
      groundingMetadata,
      usageMetadata,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`✗ Failed (${duration}ms)`);
    console.log(`Error: ${error.message}`);

    return {
      modelName,
      promptId: prompt.id,
      promptName: prompt.name,
      success: false,
      duration,
      error: error.message,
      tokens: {
        prompt: 0,
        response: 0,
        thinking: 0,
        toolUse: 0,
        cached: 0,
        total: 0,
      },
      searchCount: 0,
      searchQueries: [],
      chunkCount: 0,
      sourceCount: 0,
      costs: {
        inputCost: 0,
        outputCost: 0,
        thinkingCost: 0,
        toolUseCost: 0,
        tokenCost: 0,
        searchCost: 0,
        totalCost: 0,
      },
      wordCount: 0,
      responseText: "",
    };
  }
}

/**
 * Generate comparison report
 */
function generateComparisonReport(results) {
  console.log("\n" + "=".repeat(80));
  console.log("COMPARISON REPORT");
  console.log("=".repeat(80));

  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    console.log("\nNo successful tests to compare.");
    return;
  }

  // Performance summary table
  console.log("\n📊 Performance Summary");
  console.log("-".repeat(80));
  console.log(
    "Model".padEnd(25) +
      "Prompt".padEnd(12) +
      "Duration".padEnd(12) +
      "Tokens".padEnd(12) +
      "Quality".padEnd(10) +
      "Cost"
  );
  console.log("-".repeat(80));

  successfulResults.forEach((r) => {
    const promptLabel = `P${r.promptId}`;
    console.log(
      r.modelName.padEnd(25) +
        promptLabel.padEnd(12) +
        `${r.duration}ms`.padEnd(12) +
        `${r.tokens.total}`.padEnd(12) +
        `${r.quality?.overall || 0}`.padEnd(10) +
        `$${r.costs.totalCost.toFixed(6)}`
    );
  });

  // Group by prompt to find best model per prompt
  const promptGroups = {};
  successfulResults.forEach((r) => {
    if (!promptGroups[r.promptId]) {
      promptGroups[r.promptId] = [];
    }
    promptGroups[r.promptId].push(r);
  });

  // Best model per prompt
  console.log("\n🏆 Best Model Per Prompt (by Quality Score)");
  console.log("-".repeat(80));
  Object.keys(promptGroups)
    .sort()
    .forEach((promptId) => {
      const promptResults = promptGroups[promptId];
      const best = promptResults.reduce((a, b) =>
        (a.quality?.overall || 0) > (b.quality?.overall || 0) ? a : b
      );
      console.log(
        `Prompt ${promptId}: ${best.modelName.padEnd(25)} ` +
          `(quality: ${best.quality?.overall || 0}, cost: $${best.costs.totalCost.toFixed(6)})`
      );
    });

  // Overall quality ranking
  console.log("\n⭐ Overall Quality Ranking (Highest to Lowest)");
  console.log("-".repeat(80));
  const sortedByQuality = [...successfulResults].sort(
    (a, b) => (b.quality?.overall || 0) - (a.quality?.overall || 0)
  );
  sortedByQuality.slice(0, 10).forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.modelName.padEnd(25)} P${r.promptId}  Quality: ${r.quality?.overall || 0}  Cost: $${r.costs.totalCost.toFixed(6)}`
    );
  });

  // Cost ranking
  console.log("\n💰 Cost Ranking (Cheapest to Most Expensive)");
  console.log("-".repeat(80));
  const sortedByCost = [...successfulResults].sort(
    (a, b) => a.costs.totalCost - b.costs.totalCost
  );
  sortedByCost.slice(0, 10).forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.modelName.padEnd(25)} P${r.promptId}  $${r.costs.totalCost.toFixed(6)} ` +
        `(tokens: $${r.costs.tokenCost.toFixed(6)}, search: $${r.costs.searchCost.toFixed(6)})`
    );
  });

  // Speed ranking
  console.log("\n⚡ Speed Ranking (Fastest to Slowest)");
  console.log("-".repeat(80));
  const sortedBySpeed = [...successfulResults].sort((a, b) => a.duration - b.duration);
  sortedBySpeed.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.modelName.padEnd(25)} P${r.promptId}  ${r.duration}ms`);
  });

  // Quality-cost efficiency (quality per dollar)
  console.log("\n💎 Quality-Cost Efficiency (Quality per Dollar Spent)");
  console.log("-".repeat(80));
  const sortedByEfficiency = [...successfulResults]
    .map((r) => ({
      ...r,
      efficiency: (r.quality?.overall || 0) / Math.max(r.costs.totalCost, 0.000001),
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  sortedByEfficiency.slice(0, 10).forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.modelName.padEnd(25)} P${r.promptId}  ${r.efficiency.toFixed(0)} quality/$`
    );
  });
}

/**
 * Generate quality analysis report
 */
function generateQualityAnalysisReport(results) {
  console.log("\n" + "=".repeat(80));
  console.log("QUALITY ANALYSIS REPORT");
  console.log("=".repeat(80));

  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    console.log("\nNo successful tests to analyze.");
    return;
  }

  // Quality metrics breakdown
  console.log("\n📈 Quality Metrics Breakdown");
  console.log("-".repeat(80));
  console.log(
    "Model".padEnd(25) +
      "P".padEnd(4) +
      "Complete".padEnd(10) +
      "Grounding".padEnd(12) +
      "Structure".padEnd(11) +
      "Length".padEnd(9) +
      "Efficiency".padEnd(11) +
      "Overall"
  );
  console.log("-".repeat(80));

  successfulResults.forEach((r) => {
    const q = r.quality || {};
    console.log(
      r.modelName.padEnd(25) +
        `${r.promptId}`.padEnd(4) +
        `${q.completeness || 0}`.padEnd(10) +
        `${q.groundingQuality || 0}`.padEnd(12) +
        `${q.structureScore || 0}`.padEnd(11) +
        `${q.lengthScore || 0}`.padEnd(9) +
        `${q.searchEfficiency || 0}`.padEnd(11) +
        `${q.overall || 0}`
    );
  });

  // Calculate average quality by model
  const modelAverages = {};
  successfulResults.forEach((r) => {
    if (!modelAverages[r.modelName]) {
      modelAverages[r.modelName] = {
        quality: [],
        cost: [],
        thinking: [],
      };
    }
    modelAverages[r.modelName].quality.push(r.quality?.overall || 0);
    modelAverages[r.modelName].cost.push(r.costs.totalCost);
    modelAverages[r.modelName].thinking.push(r.tokens.thinking || 0);
  });

  console.log("\n🎯 Model Average Performance");
  console.log("-".repeat(80));
  console.log(
    "Model".padEnd(25) +
      "Avg Quality".padEnd(13) +
      "Avg Cost".padEnd(13) +
      "Avg Thinking Tokens"
  );
  console.log("-".repeat(80));

  Object.keys(modelAverages)
    .sort()
    .forEach((modelName) => {
      const stats = modelAverages[modelName];
      const avgQuality = stats.quality.reduce((a, b) => a + b, 0) / stats.quality.length;
      const avgCost = stats.cost.reduce((a, b) => a + b, 0) / stats.cost.length;
      const avgThinking = stats.thinking.reduce((a, b) => a + b, 0) / stats.thinking.length;

      console.log(
        modelName.padEnd(25) +
          `${avgQuality.toFixed(1)}`.padEnd(13) +
          `$${avgCost.toFixed(6)}`.padEnd(13) +
          `${avgThinking.toLocaleString()}`
      );
    });

  // Recommendations
  console.log("\n💡 Recommendations");
  console.log("-".repeat(80));

  const bestQuality = successfulResults.reduce((a, b) =>
    (a.quality?.overall || 0) > (b.quality?.overall || 0) ? a : b
  );
  console.log(
    `Best for quality: ${bestQuality.modelName} (score: ${bestQuality.quality?.overall || 0})`
  );

  const bestCost = successfulResults.reduce((a, b) =>
    a.costs.totalCost < b.costs.totalCost ? a : b
  );
  console.log(`Best for cost: ${bestCost.modelName} (cost: $${bestCost.costs.totalCost.toFixed(6)})`);

  const bestEfficiency = successfulResults
    .map((r) => ({
      ...r,
      efficiency: (r.quality?.overall || 0) / Math.max(r.costs.totalCost, 0.000001),
    }))
    .reduce((a, b) => (a.efficiency > b.efficiency ? a : b));
  console.log(
    `Best balance (quality/cost): ${bestEfficiency.modelName} (${bestEfficiency.efficiency.toFixed(0)} quality/$)`
  );

  // Token consumption analysis
  console.log("\n🔍 Token Consumption Analysis");
  console.log("-".repeat(80));

  const highThinking = successfulResults.filter((r) => r.tokens.thinking > 0);
  if (highThinking.length > 0) {
    console.log(
      `⚠️  ${highThinking.length} result(s) used extended thinking tokens (Gemini 3.x feature):`
    );
    highThinking.forEach((r) => {
      const thinkingPercent = (r.tokens.thinking / r.tokens.total) * 100;
      console.log(
        `  - ${r.modelName} P${r.promptId}: ${r.tokens.thinking.toLocaleString()} thinking tokens ` +
          `(${thinkingPercent.toFixed(1)}% of total, cost: $${r.costs.thinkingCost.toFixed(6)})`
      );
    });
    console.log(
      "\nNote: Thinking tokens significantly increase cost but may improve response quality."
    );
  }

  const highToolUse = successfulResults.filter((r) => r.tokens.toolUse > 0);
  if (highToolUse.length > 0) {
    console.log(
      `\n🔧 ${highToolUse.length} result(s) used tool use prompt tokens (grounding overhead):`
    );
    highToolUse.forEach((r) => {
      const toolUsePercent = (r.tokens.toolUse / r.tokens.total) * 100;
      console.log(
        `  - ${r.modelName} P${r.promptId}: ${r.tokens.toolUse.toLocaleString()} tool use tokens ` +
          `(${toolUsePercent.toFixed(1)}% of total, cost: $${r.costs.toolUseCost.toFixed(6)})`
      );
    });
    console.log(
      "\nNote: Tool use tokens are the internal prompt for grounding - charged at input rate."
    );
  }

  // Show average tool use overhead by model
  const modelToolUse = {};
  successfulResults.forEach((r) => {
    if (!modelToolUse[r.modelName]) {
      modelToolUse[r.modelName] = [];
    }
    modelToolUse[r.modelName].push(r.tokens.toolUse || 0);
  });

  console.log("\n📊 Average Tool Use Overhead by Model:");
  Object.keys(modelToolUse).sort().forEach((modelName) => {
    const avg = modelToolUse[modelName].reduce((a, b) => a + b, 0) / modelToolUse[modelName].length;
    if (avg > 0) {
      console.log(`  ${modelName.padEnd(25)} ${avg.toFixed(0)} tokens/request`);
    }
  });
}

/**
 * Save results to CSV with detailed token breakdown and quality metrics
 */
function saveToCsv(results, filename) {
  const headers = [
    "Model",
    "PromptId",
    "PromptName",
    "Success",
    "Duration(ms)",
    "PromptTokens",
    "ResponseTokens",
    "ThinkingTokens",
    "ToolUseTokens",
    "CachedTokens",
    "TotalTokens",
    "InputCost($)",
    "OutputCost($)",
    "ThinkingCost($)",
    "ToolUseCost($)",
    "SearchCost($)",
    "TotalCost($)",
    "SearchCount",
    "ChunkCount",
    "SourceCount",
    "WordCount",
    "QualityScore",
    "Completeness",
    "GroundingQuality",
    "StructureScore",
    "LengthScore",
    "SearchEfficiency",
  ];

  const rows = results.map((r) => [
    r.modelName,
    r.promptId,
    `"${r.promptName}"`, // Quote to handle commas in name
    r.success,
    r.duration,
    r.tokens?.prompt || 0,
    r.tokens?.response || 0,
    r.tokens?.thinking || 0,
    r.tokens?.toolUse || 0,
    r.tokens?.cached || 0,
    r.tokens?.total || 0,
    r.costs.inputCost.toFixed(6),
    r.costs.outputCost.toFixed(6),
    r.costs.thinkingCost?.toFixed(6) || "0.000000",
    r.costs.toolUseCost?.toFixed(6) || "0.000000",
    r.costs.searchCost.toFixed(6),
    r.costs.totalCost.toFixed(6),
    r.searchCount,
    r.chunkCount || 0,
    r.sourceCount,
    r.wordCount,
    r.quality?.overall || 0,
    r.quality?.completeness || 0,
    r.quality?.groundingQuality || 0,
    r.quality?.structureScore || 0,
    r.quality?.lengthScore || 0,
    r.quality?.searchEfficiency || 0,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  writeFileSync(filename, csv);
  console.log(`\n✓ CSV saved to: ${filename}`);
}

/**
 * Save results to JSON with full details
 */
function saveToJson(results, filename) {
  const jsonData = {
    timestamp: new Date().toISOString(),
    testPrompts: TEST_PROMPTS,
    results: results.map((r) => ({
      modelName: r.modelName,
      promptId: r.promptId,
      promptName: r.promptName,
      success: r.success,
      duration: r.duration,
      tokens: r.tokens || {
        prompt: 0,
        response: 0,
        thinking: 0,
        toolUse: 0,
        cached: 0,
        total: 0,
      },
      costs: r.costs,
      grounding: {
        searchCount: r.searchCount,
        searchQueries: r.searchQueries || [],
        chunkCount: r.chunkCount || 0,
        sourceCount: r.sourceCount,
        metadata: r.groundingMetadata,
      },
      response: {
        text: r.responseText,
        wordCount: r.wordCount,
      },
      quality: r.quality || {
        completeness: 0,
        groundingQuality: 0,
        structureScore: 0,
        lengthScore: 0,
        searchEfficiency: 0,
        overall: 0,
      },
      // Include token sum verification
      tokenSumVerification: {
        calculatedSum: (r.tokens?.prompt || 0) + (r.tokens?.response || 0) + (r.tokens?.thinking || 0) + (r.tokens?.toolUse || 0),
        reportedTotal: r.tokens?.total || 0,
        difference: (r.tokens?.total || 0) - ((r.tokens?.prompt || 0) + (r.tokens?.response || 0) + (r.tokens?.thinking || 0) + (r.tokens?.toolUse || 0)),
        cachedTokens: r.tokens?.cached || 0,
      },
      usageMetadata: r.usageMetadata,
      error: r.error,
    })),
  };

  writeFileSync(filename, JSON.stringify(jsonData, null, 2));
  console.log(`✓ JSON saved to: ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(80));
  console.log("GEMINI GROUNDING TEST - MULTI-PROMPT MODEL COMPARISON");
  console.log("=".repeat(80));
  console.log(`\nTesting ${modelsToTest.length} models across ${TEST_PROMPTS.length} prompts`);
  console.log(`Models: ${modelsToTest.join(", ")}`);
  console.log(`Total tests to run: ${modelsToTest.length * TEST_PROMPTS.length}\n`);

  const allResults = [];

  // Test each prompt
  for (const prompt of TEST_PROMPTS) {
    console.log(`\n\n${"=".repeat(80)}`);
    console.log(`TESTING PROMPT ${prompt.id}: ${prompt.name}`);
    console.log("=".repeat(80));
    console.log(`Prompt length: ${prompt.content.length} characters\n`);

    // Test each model on this prompt
    for (const modelName of modelsToTest) {
      const result = await testModel(modelName, prompt);

      // Evaluate quality
      const qualityScores = evaluateResponseQuality(result);
      result.quality = qualityScores;

      // Display quality scores
      if (result.success) {
        console.log(`Quality Scores:`);
        console.log(`  Overall: ${qualityScores.overall}/100`);
        console.log(`  Completeness: ${qualityScores.completeness}/100`);
        console.log(`  Grounding Quality: ${qualityScores.groundingQuality}/100`);
        console.log(`  Structure: ${qualityScores.structureScore}/100`);
        console.log(`  Length: ${qualityScores.lengthScore}/100`);
        console.log(`  Search Efficiency: ${qualityScores.searchEfficiency}/100`);
      }

      allResults.push(result);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Generate comprehensive reports
  generateComparisonReport(allResults);
  generateQualityAnalysisReport(allResults);

  // Save results
  const timestamp = new Date().toISOString().split("T")[0];
  const csvFilename = `gemini-multi-prompt-comparison-${timestamp}.csv`;
  const jsonFilename = `gemini-multi-prompt-comparison-${timestamp}.json`;

  saveToCsv(allResults, csvFilename);
  saveToJson(allResults, jsonFilename);

  console.log("\n" + "=".repeat(80));
  console.log("Test completed successfully!");
  console.log("=".repeat(80));
  console.log(
    `\nTotal tests run: ${allResults.length} (${allResults.filter((r) => r.success).length} successful)`
  );
  console.log(`Results exported to:`);
  console.log(`  - ${csvFilename}`);
  console.log(`  - ${jsonFilename}`);
}

// Run the test
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
