# Research Agent Library

This directory contains the TypeScript implementation of the research agent, migrated from the Python backend.

## Structure

```
lib/research/
├── agents/
│   ├── orchestrator.ts      # Main orchestrator that coordinates research
│   ├── person-agent.ts       # Person research agent
│   ├── company-agent.ts      # Company research agent
│   └── prompts/
│       ├── person.ts         # Person research prompts
│       └── company.ts        # Company research prompts
├── types.ts                  # Zod schemas and TypeScript types
├── token-tracker.ts          # Token usage tracking
├── utils.ts                  # Shared utilities
├── index.ts                  # Main exports
└── README.md                 # This file
```

## Usage

```typescript
import { ResearchOrchestrator } from '@/lib/research';

const orchestrator = new ResearchOrchestrator();
const prepNote = await orchestrator.researchMeeting(meetingId);
```

## Environment Variables

Required environment variables:

- `GOOGLE_GEMINI_API_KEY` - Google AI Studio API key for Gemini
- `GEMINI_MODEL` - Gemini model name (default: gemini-2.0-flash-exp)

## Migration Notes

Migrated from `backend/src/research_agent/` to unify the codebase in TypeScript.

Key changes:
- Pydantic models → Zod schemas
- Python Gemini SDK → `@google/generative-ai`
- Direct Supabase access via service client
- Token tracking via RPC functions
