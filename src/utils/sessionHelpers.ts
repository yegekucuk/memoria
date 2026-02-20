import { Session } from '@/types';

/**
 * Validates that a session form has at least one tag and non-empty notes.
 * Returns an error message string, or null if valid.
 */
export const validateSessionForm = (
  tags: string[],
  notes: string,
): string | null => {
  if (tags.length === 0) {
    return 'Please add at least one tag.';
  }
  if (!notes.trim()) {
    return 'Please add some notes.';
  }
  return null;
};

/**
 * Builds a CSV string from sessions and triggers a file download.
 */
export const exportSessionsCSV = (sessions: Session[]): void => {
  const headers = ['Date', 'Start Time', 'End Time', 'Duration (seconds)', 'Tags', 'Notes'];

  const rows = sessions.map(session => {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : null;

    const escapedNotes = session.notes
      ? `"${session.notes.replace(/"/g, '""')}"`
      : '';
    const escapedTags = session.tags.length > 0
      ? `"${session.tags.join(', ')}"`
      : '';

    return [
      start.toLocaleDateString(),
      start.toLocaleTimeString(),
      end ? end.toLocaleTimeString() : '',
      session.durationSeconds,
      escapedTags,
      escapedNotes,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sessions_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
