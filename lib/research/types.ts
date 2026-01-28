/**
 * Type definitions and Zod schemas for research agent
 * Ported from backend/src/research_agent/models.py
 */

import { z } from 'zod';

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
  current_role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  tenure: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  recent_activity: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  talking_points: z.array(z.string()).default([]),
});

export const CompanyResearchSchema = z.object({
  name: z.string(),
  domain: z.string(),
  overview: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  recent_news: z.array(z.string()).default([]),
  funding: z.string().nullable().optional(),
  products: z.array(z.string()).default([]),
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
}
