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
          current_role: null,
          company: null,
          tenure: null,
          background: `Research failed: ${error instanceof Error ? error.message : String(error)}`,
          recent_activity: null,
          linkedin_url: null,
          talking_points: [],
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
          overview: `Research failed: ${error instanceof Error ? error.message : String(error)}`,
          size: null,
          industry: null,
          recent_news: [],
          funding: null,
          products: [],
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

    // From people
    for (const person of people) {
      points.push(...person.talking_points);
    }

    // From companies
    for (const company of companies) {
      if (company.recent_news && company.recent_news.length > 0) {
        points.push(`Ask about: ${company.recent_news[0].substring(0, 100)}`);
      }
    }

    return points.slice(0, 5); // Top 5
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
