# Research Agent Test CLI

Interactive command-line interface for testing frontend research agents independently, matching the functionality of the backend's `cli_research_agent.py`.

## Overview

This CLI allows developers to test `PersonResearchAgent` and `CompanyResearchAgent` without needing the full Next.js app or database integration.

## Features

- **Demo Data Testing**: Pre-configured people and companies matching backend test data
- **Individual Agent Testing**: Test PersonResearchAgent and CompanyResearchAgent independently
- **Interactive Menus**: Easy-to-use menu system with formatted output
- **Custom Input Mode**: Test with your own data
- **Colored Output**: Clear, readable results using chalk

## Demo Data

### Demo People
1. Satya Nadella (Microsoft)
2. Sundar Pichai (Google)
3. Dario Amodei (Anthropic)
4. Ravikesh Kumar (IcecreamLabs)
5. Naman (Icecreamlabs)
6. Madhu (IcecreamLabs)

### Demo Companies
1. Microsoft
2. Google
3. Anthropic
4. OpenAI
5. NVIDIA
6. IcecreamLabs
7. Modo

## Setup

### 1. Install Dependencies

Dependencies are already included in `package.json`:
- `tsx`: TypeScript execution without compilation
- `chalk@4.1.2`: Color terminal output

If needed, run:
```bash
npm install
```

### 2. Environment Variables

Ensure the following variables are set in `.env.local`:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
SERPER_API_KEY=your_serper_api_key
GEMINI_MODEL=gemini-2.0-flash-exp  # Optional, defaults to this
```

## Usage

### Run the CLI

```bash
npm run test:research
```

### Main Menu Options

```
========================================
  Research Agent Interactive CLI
========================================
  [1] Test Person Research
  [2] Test Company Research
  [3] Custom Research (manual input)
  [q] Quit
========================================
```

### Testing Person Research

1. Select option `[1]` from the main menu
2. Choose a demo person from the numbered list (1-6)
3. Wait for research to complete
4. View formatted results including:
   - Name, role, company, tenure
   - Background summary
   - Recent activity
   - LinkedIn URL
   - Talking points
5. Press Enter to return to the main menu

### Testing Company Research

1. Select option `[2]` from the main menu
2. Choose a demo company from the numbered list (1-7)
3. Wait for research to complete
4. View formatted results including:
   - Name, domain, overview
   - Size, industry, funding
   - Recent news items
   - Products list
5. Press Enter to return to the main menu

### Custom Research

1. Select option `[3]` from the main menu
2. Choose to research a person or company
3. Enter the required information:
   - **Person**: Name, email, company (optional)
   - **Company**: Domain, company name (optional)
4. View results
5. Press Enter to return

### Exiting

- Press `q` and Enter to quit
- Press `Ctrl+C` for immediate exit

## Example Output

```
================================================================================
  Person Research: Satya Nadella
================================================================================
Role: CEO and Chairman
Company: Microsoft
Tenure: Since 2014

Background:
Satya Nadella is the CEO and Chairman of Microsoft, leading the company's
transformation into a cloud-first, AI-powered organization...

Recent Activity:
Recently announced new AI initiatives and partnerships, focusing on integrating
AI capabilities across Microsoft's product portfolio...

LinkedIn: https://www.linkedin.com/in/satyanadella/

Talking Points:
  1. Ask about Microsoft's cloud transformation strategy
  2. Discuss AI integration in enterprise products
  3. Inquire about sustainability initiatives
```

## Key Differences from Backend CLI

This frontend CLI is intentionally simpler than the backend version:

- ❌ **No database operations**: Skips Supabase queries and meeting creation
- ❌ **No orchestrator testing**: Focuses on individual agents only
- ❌ **No token tracking**: Omits userId/meetingId parameters
- ❌ **No database stats**: No display of meeting/user counts
- ✅ **Individual agent testing**: Quick testing of PersonResearchAgent and CompanyResearchAgent
- ✅ **Demo data consistency**: Uses same demo data as backend for result comparison

## Focus Areas

The CLI is optimized for:

1. **Quick agent testing**: Test agents in isolation without Next.js overhead
2. **Debugging prompts**: See raw research output for prompt refinement
3. **API validation**: Verify Gemini and Serper API integration
4. **Consistency checks**: Compare results with backend using same demo data
5. **Development workflow**: Fast iteration on agent improvements

## Troubleshooting

### Error: GOOGLE_GEMINI_API_KEY not found

**Solution**: Ensure `.env.local` exists and contains the API key:
```bash
echo "GOOGLE_GEMINI_API_KEY=your_key_here" >> .env.local
```

### Error: SERPER_API_KEY not found

**Solution**: Add the Serper API key to `.env.local`:
```bash
echo "SERPER_API_KEY=your_key_here" >> .env.local
```

### Research fails with API errors

**Solutions**:
- Verify API keys are valid and have sufficient quota
- Check network connectivity
- Review error messages for specific API issues

### Module not found errors

**Solution**: Reinstall dependencies:
```bash
npm install
```

## Files

### New Files
- `scripts/test-research-cli.ts`: Main CLI script (~450 lines)
- `scripts/verify-credit-system.sql`: Credit system verification script
- `scripts/README.md`: This documentation

### Modified Files
- `package.json`: Added `test:research` script and dependencies

### Referenced Files (No Changes)
- `lib/research/agents/person-agent.ts`: PersonResearchAgent implementation
- `lib/research/agents/company-agent.ts`: CompanyResearchAgent implementation
- `lib/research/types.ts`: Type definitions and Zod schemas

---

# Database Verification Script

## Overview

The `verify-credit-system.sql` script provides comprehensive verification of the token-based credit system implementation. Run this script after executing the database migrations to ensure everything is configured correctly.

## Usage

### Using Supabase CLI

```bash
supabase db execute --file scripts/verify-credit-system.sql
```

### Using psql

```bash
psql -d your_database_url -f scripts/verify-credit-system.sql
```

### Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `scripts/verify-credit-system.sql`
3. Click Run

## What It Verifies

### Section 1: Schema Changes
- ✓ Old token columns removed from users table
- ✓ total_tokens column removed from token_usage table
- ✓ New columns (effective_tokens, actual_cost_usd) added to token_usage

### Section 2: New Tables
- ✓ credit_baseline table exists with correct structure
- ✓ Initial baseline data (5000 effective tokens) is present

### Section 3: Database Functions
- ✓ get_credit_baseline() returns correct value
- ✓ calculate_actual_cost() produces accurate cost calculations
- ✓ update_credit_baseline() function exists

### Section 4: Indexes
- ✓ Index on actual_cost_usd exists for performance

### Section 5: Credit Calculations
Tests the complete credit formula with multiple scenarios:
- **Typical attendee**: 2000 input + 500 output → 1.0 credits
- **Complex research**: 3500 input + 1200 output → 2.25 credits
- **With caching**: 1500 input + 400 output + 1000 cached → 1.0 credits
- **Minimal usage**: 400 input + 100 output → 0.25 credits (minimum)

### Section 6: Recent Usage
- Shows recent token_usage records with new columns populated

## Expected Output

The script uses `\echo` commands to provide clear section headers and explanations. Each test includes expected results in comments.

Example output:
```
=== SECTION 1: VERIFY SCHEMA CHANGES ===

1.1: Checking users table (should NOT have old token columns)...
(0 rows)  ✓ Old columns removed

1.2: Checking token_usage for removed total_tokens column...
(0 rows)  ✓ Column removed

1.3: Checking token_usage for NEW columns...
 column_name     | data_type | is_nullable
-----------------+-----------+-------------
 actual_cost_usd | numeric   | YES
 effective_tokens| numeric   | YES
(2 rows)  ✓ New columns added

...
```

## Troubleshooting

If any section fails, refer to:
- `lib/migrations/README.md` for migration instructions
- `NEXT_STEPS.md` for deployment steps
- `IMPLEMENTATION_SUMMARY.md` for technical details

## Future Enhancements

Optional features that could be added:

- Save results to JSON file (`--save` flag)
- Benchmark mode (measure latency, token usage)
- Batch testing (research all demo people/companies at once)
- Side-by-side comparison with backend results
- Integration with actual Supabase for full E2E testing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the agent implementation files in `lib/research/agents/`
3. Compare with backend implementation in `../backend/cli_research_agent.py`
