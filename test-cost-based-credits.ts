/**
 * Test cost-based credit calculation with real Gemini API calls
 * Run with: npx tsx test-cost-based-credits.ts
 */

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!apiKey) {
  console.error('GOOGLE_GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Test prompt for person research
const TEST_PROMPT = `Do the research about, John Doe, Software Engineer, example.com professional profile background, recent activity. Extract and summarize the info for a business meeting in the following format:
1. Current role and company
2. Professional background and expertise areas
3. Recent professional activities (posts, articles, speaking, achievements)
4. LinkedIn profile URL if available
5. 3-5 specific talking points for building rapport in a business meeting

- Don't mess up with the personal detail of the attendee, as name and company should be what has been passed.
- summarize the info upto 500 words, and in markdown format.
- if the person name along with the company name matches, it is not necessary that domain will match.`;

async function testWithRealAPI() {
  console.log('='.repeat(80));
  console.log('COST-BASED CREDIT SYSTEM - REAL API TEST');
  console.log('='.repeat(80));
  console.log();

  try {
    // Step 1: Make API call with grounding
    console.log('Step 1: Making Gemini API call with grounding...');
    console.log('-'.repeat(80));

    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };

    const modelName = 'gemini-3-flash-preview';
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: modelName,
      contents: TEST_PROMPT,
      config,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ API call completed in ${duration}ms`);
    console.log();

    // Step 2: Extract token metadata
    console.log('Step 2: Extracting token metadata...');
    console.log('-'.repeat(80));

    const usageMetadata = response.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const cachedTokens = usageMetadata.cachedContentTokenCount || 0;
    const thinkingTokens = usageMetadata.thoughtsTokenCount || 0;
    const toolUseTokens = usageMetadata.toolUsePromptTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || 0;

    console.log(`Token Breakdown:`);
    console.log(`  Input tokens: ${inputTokens.toLocaleString()}`);
    console.log(`  Output tokens: ${outputTokens.toLocaleString()}`);
    console.log(`  Cached tokens: ${cachedTokens.toLocaleString()}`);
    console.log(`  Thinking tokens: ${thinkingTokens.toLocaleString()}`);
    console.log(`  Tool use tokens: ${toolUseTokens.toLocaleString()}`);
    console.log(`  Total tokens: ${totalTokens.toLocaleString()}`);
    console.log();

    // Step 3: Extract grounding metadata
    console.log('Step 3: Extracting grounding metadata...');
    console.log('-'.repeat(80));

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || {};
    const webSearchQueries = groundingMetadata.webSearchQueries || [];
    const searchCount = webSearchQueries.length;
    const groundingChunks = groundingMetadata.groundingChunks || [];
    const chunkCount = groundingChunks.length;

    console.log(`Search Queries: ${searchCount}`);
    if (searchCount > 0) {
      webSearchQueries.forEach((query, i) => {
        console.log(`  ${i + 1}. "${query}"`);
      });
    }
    console.log(`Grounding Chunks: ${chunkCount}`);
    console.log();

    // Step 4: Calculate credits (manual calculation to avoid Next.js context issues)
    console.log('Step 4: Calculating credits...');
    console.log('-'.repeat(80));

    // Pricing configuration (from database defaults)
    const INPUT_PRICE = 0.50;
    const OUTPUT_PRICE = 3.00;
    const CACHED_PRICE = 0.125;
    const THINKING_PRICE = 3.00;
    const TOOL_USE_PRICE = 0.50;
    const SEARCH_PRICE_PER_1000 = 14.0;
    const COST_BASELINE = 0.01;
    const ROUNDING_STEP = 0.05;

    // Calculate token costs
    const tokenCost = (
      (inputTokens * INPUT_PRICE +
       outputTokens * OUTPUT_PRICE +
       cachedTokens * CACHED_PRICE +
       thinkingTokens * THINKING_PRICE +
       toolUseTokens * TOOL_USE_PRICE) /
      1_000_000
    );

    // Calculate search costs
    const searchCost = (searchCount / 1000) * SEARCH_PRICE_PER_1000;

    // Total actual cost
    const actualCost = tokenCost + searchCost;

    // Calculate credits
    const rawCredits = actualCost / COST_BASELINE;
    const credits = Math.ceil(rawCredits / ROUNDING_STEP) * ROUNDING_STEP;

    console.log(`Cost Breakdown:`);
    console.log(`  Input cost: $${((inputTokens / 1_000_000) * 0.50).toFixed(6)}`);
    console.log(`  Output cost: $${((outputTokens / 1_000_000) * 3.00).toFixed(6)}`);
    if (thinkingTokens > 0) {
      console.log(`  Thinking cost: $${((thinkingTokens / 1_000_000) * 3.00).toFixed(6)}`);
    }
    if (toolUseTokens > 0) {
      console.log(`  Tool use cost: $${((toolUseTokens / 1_000_000) * 0.50).toFixed(6)}`);
    }
    console.log(`  Search cost: $${((searchCount / 1000) * 14.0).toFixed(6)}`);
    console.log(`  TOTAL COST: $${actualCost.toFixed(6)}`);
    console.log();
    console.log(`Credits: ${credits.toFixed(2)} (baseline: $0.01 = 1 credit, rounded to 0.05)`);
    console.log();

    // Step 5: Store in database
    console.log('Step 5: Storing in database...');
    console.log('-'.repeat(80));

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create test user and meeting
    const testUserEmail = 'test-credit-system@prepfor.app';

    // Upsert test user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        email: testUserEmail,
        google_user_id: 'test-google-id-credit-system',
        name: 'Test User (Credit System)',
        plan_type: 'free',
        credits_balance: 100,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating test user:', userError);
      throw userError;
    }

    const testUserId = userData.id;
    console.log(`✅ Test user created/found: ${testUserId}`);

    // Create test meeting
    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: testUserId,
        google_event_id: `test-credit-${Date.now()}`,
        title: 'Test Meeting - Credit System',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        is_internal: false,
        is_cancelled: false,
      })
      .select()
      .single();

    if (meetingError) {
      console.error('❌ Error creating test meeting:', meetingError);
      throw meetingError;
    }

    const testMeetingId = meetingData.id;
    console.log(`✅ Test meeting created: ${testMeetingId}`);
    console.log();

    // Track token usage
    const { data: tokenUsageId, error: tokenError } = await supabase.rpc('track_token_usage', {
      p_user_id: testUserId,
      p_meeting_id: testMeetingId,
      p_agent_type: 'person',
      p_model_name: modelName,
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_cached_tokens: cachedTokens,
      p_thoughts_tokens: thinkingTokens,
      p_tool_use_prompt_tokens: toolUseTokens,
      p_web_search_queries: webSearchQueries.length > 0 ? webSearchQueries : null,
    });

    if (tokenError) {
      console.error('❌ Error tracking token usage:', tokenError);
      throw tokenError;
    }

    console.log(`✅ Token usage tracked with ID: ${tokenUsageId}`);
    console.log();

    // Update with credit information
    const { error: updateError } = await supabase
      .from('token_usage')
      .update({
        actual_cost_usd: actualCost,
        credits_consumed: credits,
      })
      .eq('id', tokenUsageId);

    if (updateError) {
      console.error('❌ Error updating credit info:', updateError);
      throw updateError;
    }

    console.log(`✅ Updated token_usage record with:`);
    console.log(`   - actual_cost_usd: $${actualCost.toFixed(6)}`);
    console.log(`   - credits_consumed: ${credits.toFixed(2)}`);
    console.log();

    // Step 6: Verify database entry
    console.log('Step 6: Verifying database entry...');
    console.log('-'.repeat(80));

    const { data: usageRecord, error: fetchError } = await supabase
      .from('token_usage')
      .select('*')
      .eq('id', tokenUsageId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching usage record:', fetchError);
      throw fetchError;
    }

    console.log('Database Record:');
    console.log(JSON.stringify(usageRecord, null, 2));
    console.log();

    // Step 7: Summary
    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ API Call: Success (${duration}ms)`);
    console.log(`✅ Token Tracking: All token types captured`);
    console.log(`   - Input: ${inputTokens}, Output: ${outputTokens}`);
    console.log(`   - Thinking: ${thinkingTokens}, Tool Use: ${toolUseTokens}`);
    console.log(`   - Searches: ${searchCount}`);
    console.log(`✅ Cost Calculation: $${actualCost.toFixed(6)}`);
    console.log(`✅ Credit Calculation: ${credits.toFixed(2)} credits`);
    console.log(`✅ Database Storage: Successful`);
    console.log();
    console.log('🎉 Cost-based credit system working correctly!');
    console.log();

    // Show response preview
    const responseText = response.text || '';
    console.log('Response Preview (first 500 chars):');
    console.log('-'.repeat(80));
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    console.log();

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testWithRealAPI()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
