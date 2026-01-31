/**
 * Main research orchestrator that coordinates sub-agents
 * Ported from backend/src/research_agent/agent.py
 */

import { PersonResearchAgent } from './person-agent';
import { CompanyResearchAgent } from './company-agent';
import {
  PrepNote,
  PersonResearch,
  CompanyResearch,
  MeetingRecord,
  AttendeeRecord,
} from '../types';
import { createServiceClient } from '@/lib/supabase/server';

export class ResearchOrchestrator {
  private personAgent: PersonResearchAgent;
  private companyAgent: CompanyResearchAgent;

  constructor() {
    this.personAgent = new PersonResearchAgent();
    this.companyAgent = new CompanyResearchAgent();
  }

  /**
   * Research a meeting by ID
   */
  async researchMeeting(meetingId: string): Promise<PrepNote> {
    console.log(`[Orchestrator] Starting research for meeting ${meetingId}`);

    // Step 1: Fetch meeting from database
    const { meeting, attendees } = await this.fetchMeeting(meetingId);
    const userId = meeting.user_id;

    // Step 2: Research people in parallel
    const personResults = await this.researchPeople(attendees, userId, meetingId);

    // Step 3: Research companies in parallel
    const companyResults = await this.researchCompanies(attendees, userId, meetingId);

    // Step 4: Synthesize prep note
    const prepNote = this.synthesizePrepNote(
      meetingId,
      meeting.title,
      meeting.start_time,
      personResults,
      companyResults
    );

    // Step 5: Save to database
    await this.savePrepNote(prepNote);

    console.log(`[Orchestrator] Research complete for meeting ${meetingId}`);
    return prepNote;
  }

  // ==========================================================================
  // Private helper methods
  // ==========================================================================

  /**
   * Fetch meeting and attendees from database
   */
  private async fetchMeeting(
    meetingId: string
  ): Promise<{ meeting: MeetingRecord; attendees: AttendeeRecord[] }> {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('meetings')
      .select('*, attendees(*)')
      .eq('id', meetingId)
      .single();

    if (error || !data) {
      throw new Error(`Meeting ${meetingId} not found`);
    }

    const meeting = data as MeetingRecord;
    const attendees = (meeting.attendees || []) as AttendeeRecord[];

    console.log(
      `[Orchestrator] Meeting: ${meeting.title} with ${attendees.length} attendees`
    );

    return { meeting, attendees };
  }

  /**
   * Research all external attendees
   */
  private async researchPeople(
    attendees: AttendeeRecord[],
    userId: string,
    meetingId: string
  ): Promise<PersonResearch[]> {
    const externalAttendees = attendees.filter(att => !att.is_internal);

    console.log(
      `[Orchestrator] Researching ${externalAttendees.length} external attendees`
    );

    const results: PersonResearch[] = [];

    for (const attendee of externalAttendees) {
      const email = attendee.email;
      const name = attendee.name || email.split('@')[0];

      console.log(`[Orchestrator] Researching person: ${name} (${email})`);

      try {
        const result = await this.personAgent.researchPerson({
          name,
          email,
          company: undefined, // Inferred from research
          userId,
          meetingId,
        });
        results.push(result);
      } catch (error) {
        console.error(`[Orchestrator] Error researching ${name}:`, error);
        results.push({
          name,
          email,
          markdown_content: `# ${name}\n\n**Error:** Research failed - ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }

  /**
   * Research unique companies from attendee domains
   */
  private async researchCompanies(
    attendees: AttendeeRecord[],
    userId: string,
    meetingId: string
  ): Promise<CompanyResearch[]> {
    const uniqueDomains = Array.from(
      new Set(
        attendees
          .filter(att => att.domain && !att.is_internal)
          .map(att => att.domain)
      )
    );

    console.log(
      `[Orchestrator] Researching ${uniqueDomains.length} unique companies`
    );

    const results: CompanyResearch[] = [];

    for (const domain of uniqueDomains) {
      console.log(`[Orchestrator] Researching company: ${domain}`);

      try {
        const result = await this.companyAgent.researchCompany({
          domain,
          companyName: undefined, // Inferred from research
          userId,
          meetingId,
        });
        results.push(result);
      } catch (error) {
        console.error(`[Orchestrator] Error researching ${domain}:`, error);
        results.push({
          name: domain,
          domain,
          markdown_content: `# ${domain}\n\n**Error:** Research failed - ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }

  /**
   * Synthesize research into a PrepNote
   */
  private synthesizePrepNote(
    meetingId: string,
    meetingTitle: string,
    meetingTime: string,
    people: PersonResearch[],
    companies: CompanyResearch[]
  ): PrepNote {
    const summary = this.generateSummary(people, companies);
    const talkingPoints = this.aggregateTalkingPoints(people, companies);

    return {
      meeting_id: meetingId,
      meeting_title: meetingTitle,
      meeting_time: meetingTime,
      summary,
      attendees: people,
      companies,
      suggested_talking_points: talkingPoints,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Generate meeting summary
   */
  private generateSummary(
    people: PersonResearch[],
    companies: CompanyResearch[]
  ): string {
    const attendeeNames = people.map(p => p.name).join(', ');
    const companyNames = companies.map(c => c.name).join(', ');

    let summary = `Meeting with ${attendeeNames}`;
    if (companyNames) {
      summary += ` from ${companyNames}`;
    }
    summary += `. ${people.length} external attendee(s) from ${companies.length} company(ies).`;

    return summary;
  }

  /**
   * Aggregate talking points from all research
   */
  private aggregateTalkingPoints(
    people: PersonResearch[],
    companies: CompanyResearch[]
  ): string[] {
    const points: string[] = [];

    // Extract talking points from markdown content
    for (const person of people) {
      const talkingPointsMatch = person.markdown_content.match(/(?:5\.|talking points)[:\s]*\n([\s\S]*?)(?:\n\n|$)/i);
      if (talkingPointsMatch) {
        const matches = talkingPointsMatch[1].match(/[-*]\s*([^\n]+)/g);
        if (matches) {
          points.push(...matches.map(p => p.replace(/^[-*]\s*/, '').trim()));
        }
      }
    }

    // Extract insights from company markdown
    for (const company of companies) {
      const insightsMatch = company.markdown_content.match(/(?:5\.|business insights|conversation opportunities)[:\s]*\n([\s\S]*?)(?:\n\n|$)/i);
      if (insightsMatch) {
        const matches = insightsMatch[1].match(/[-*]\s*([^\n]+)/g);
        if (matches) {
          points.push(...matches.map(p => p.replace(/^[-*]\s*/, '').trim()));
        }
      }
    }

    return points.slice(0, 10); // Top 10
  }

  /**
   * Save prep note to database and update meeting status
   */
  private async savePrepNote(prepNote: PrepNote): Promise<void> {
    const supabase = await createServiceClient();

    // Save prep note
    const { error: upsertError } = await supabase.from('prep_notes').upsert({
      meeting_id: prepNote.meeting_id,
      content: prepNote,
      created_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error('[Orchestrator] Error saving prep note:', upsertError);
      throw upsertError;
    }

    // Update meeting status
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ status: 'ready' })
      .eq('id', prepNote.meeting_id);

    if (updateError) {
      console.error('[Orchestrator] Error updating meeting status:', updateError);
      throw updateError;
    }

    console.log(`[Orchestrator] Saved prep note to database`);
  }
}
