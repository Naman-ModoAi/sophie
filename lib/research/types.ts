/**
 * Type definitions and Zod schemas for research agent
 * Ported from backend/src/research_agent/models.py
 */

import { z } from 'zod';

// ============================================================================
// Web Search Types
// ============================================================================

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const AttendeeInfoSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable().optional(),
  domain: z.string(),
  is_internal: z.boolean(),
});

export const MeetingInfoSchema = z.object({
  meeting_id: z.string().uuid(),
  title: z.string(),
  start_time: z.string().datetime(),
  attendees: z.array(AttendeeInfoSchema),
  description: z.string().nullable().optional(),
});

export const PersonResearchSchema = z.object({
  name: z.string(),
  email: z.string(),
  markdown_content: z.string(), // Full markdown research document
});

export const CompanyResearchSchema = z.object({
  name: z.string(),
  domain: z.string(),
  markdown_content: z.string(), // Full markdown research document
});

export const PrepNoteSchema = z.object({
  meeting_id: z.string().uuid(),
  meeting_title: z.string(),
  meeting_time: z.string().datetime(),
  summary: z.string(),
  attendees: z.array(PersonResearchSchema),
  companies: z.array(CompanyResearchSchema),
  suggested_talking_points: z.array(z.string()).default([]),
  generated_at: z.string().datetime(),
});

export const ResearchRequestSchema = z.object({
  meeting_id: z.string().uuid(),
});

// ============================================================================
// TypeScript Types (inferred from schemas)
// ============================================================================

export type AttendeeInfo = z.infer<typeof AttendeeInfoSchema>;
export type MeetingInfo = z.infer<typeof MeetingInfoSchema>;
export type PersonResearch = z.infer<typeof PersonResearchSchema>;
export type CompanyResearch = z.infer<typeof CompanyResearchSchema>;
export type PrepNote = z.infer<typeof PrepNoteSchema>;
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

// ============================================================================
// Database Types (for Supabase responses)
// ============================================================================

export interface MeetingRecord {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  description?: string;
  status: string;
  attendees?: AttendeeRecord[];
}

export interface AttendeeRecord {
  id?: string;
  meeting_id?: string;
  email: string;
  name?: string;
  domain: string;
  is_internal: boolean;
  company_id?: string;
  name_manually_edited?: boolean;
  company_manually_edited?: boolean;
  companies?: { name: string; domain: string } | null;
}
