import { Session } from '@/types';
import {
  buildJournalEntries,
  formatJournalDateLabel,
  getSessionsForDay,
  getJournalPageMeta,
  isNextJournalDateDisabled,
  shiftJournalDate,
} from '@/utils/journalHelpers';

describe('journalHelpers', () => {
  const sampleSessions: Session[] = [
    {
      id: 's1',
      startTime: '2026-03-24T08:15:00.000Z',
      endTime: '2026-03-24T09:00:00.000Z',
      durationSeconds: 2700,
      tags: ['Deep Work', 'API'],
      notes: 'Implemented JWT refresh flow',
    },
    {
      id: 's2',
      startTime: '2026-03-24T11:30:00.000Z',
      endTime: '2026-03-24T12:00:00.000Z',
      durationSeconds: 1800,
      tags: ['Review'],
      notes: 'Reviewed PR #42',
    },
    {
      id: 's3',
      startTime: '2026-03-23T16:00:00.000Z',
      endTime: '2026-03-23T17:00:00.000Z',
      durationSeconds: 3600,
      tags: ['Planning'],
      notes: 'Sprint planning',
    },
  ];

  it('filters sessions by selected day and sorts by start time', () => {
    const day = new Date('2026-03-24T00:00:00.000Z');
    const sessions = getSessionsForDay(sampleSessions, day);

    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe('s1');
    expect(sessions[1].id).toBe('s2');
  });

  it('builds journal entry format with 24-hour time', () => {
    const entries = buildJournalEntries([sampleSessions[0]]);

    expect(entries).toHaveLength(1);
    expect(entries[0].time).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
    expect(entries[0].duration).toBe('0 hours 45 minutes');
    expect(entries[0].text).toMatch(/^- \d{2}:\d{2} - \d{2}:\d{2}, \[Deep Work, API\], Implemented JWT refresh flow \| 0 hours 45 minutes$/);
  });

  it('returns "Today" when date is current day', () => {
    expect(formatJournalDateLabel(new Date())).toBe('Today');
  });

  it('disables forward navigation when selected day is today', () => {
    const today = new Date();
    expect(isNextJournalDateDisabled(today)).toBe(true);
  });

  it('allows forward navigation when selected day is in the past', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isNextJournalDateDisabled(yesterday)).toBe(false);
  });

  it('does not navigate beyond today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shifted = shiftJournalDate(today, 'next');
    expect(shifted.getTime()).toBe(today.getTime());
  });

  it('computes page metadata count and total hours', () => {
    const sessions = [sampleSessions[0], sampleSessions[1]];
    const meta = getJournalPageMeta(sessions);

    expect(meta.count).toBe(2);
    expect(meta.totalHours).toBeCloseTo(1.25, 2);
  });

  it('renders empty tags as "No Tags" in journal text', () => {
    const entry = buildJournalEntries([
      {
        id: 's4',
        startTime: '2026-03-24T13:00:00.000Z',
        endTime: '2026-03-24T13:30:00.000Z',
        durationSeconds: 1800,
        tags: [],
        notes: 'Standalone note',
      },
    ])[0];

    expect(entry.text).toContain('[No Tags]');
    expect(entry.text).toContain('Standalone note');
  });
});
