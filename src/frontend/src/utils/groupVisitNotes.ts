/**
 * Parses combined notes string to extract structured fields.
 * Handles the format created by RecordGroupVisitModal.
 */
export interface ParsedGroupVisitNotes {
  discussionTopics: string;
  overseerNotes: string | null;
  assistantNotes: string | null;
  nextPlannedVisitDate: string | null;
}

export function parseGroupVisitNotes(combinedNotes: string): ParsedGroupVisitNotes {
  const result: ParsedGroupVisitNotes = {
    discussionTopics: '',
    overseerNotes: null,
    assistantNotes: null,
    nextPlannedVisitDate: null,
  };

  // Split by section headers
  const discussionMatch = combinedNotes.match(/Discussion Topics:\s*\n([\s\S]*?)(?=\n\nNotes for Overseer:|\n\nNotes for Assistant:|\n\nNext Planned Visit:|$)/);
  const overseerMatch = combinedNotes.match(/Notes for Overseer:\s*\n([\s\S]*?)(?=\n\nNotes for Assistant:|\n\nNext Planned Visit:|$)/);
  const assistantMatch = combinedNotes.match(/Notes for Assistant:\s*\n([\s\S]*?)(?=\n\nNext Planned Visit:|$)/);
  const nextVisitMatch = combinedNotes.match(/Next Planned Visit:\s*\n([\s\S]*?)$/);

  if (discussionMatch) {
    result.discussionTopics = discussionMatch[1].trim();
  }
  if (overseerMatch) {
    const content = overseerMatch[1].trim();
    result.overseerNotes = content || null;
  }
  if (assistantMatch) {
    const content = assistantMatch[1].trim();
    result.assistantNotes = content || null;
  }
  if (nextVisitMatch) {
    const content = nextVisitMatch[1].trim();
    result.nextPlannedVisitDate = content || null;
  }

  return result;
}
