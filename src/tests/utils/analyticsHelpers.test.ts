import { calculateChartData, ChartBar } from '@/utils/analyticsHelpers';
import { Session } from '@/types';

describe('analyticsHelpers', () => {
  // We'll fix the "current time" to a specific date for consistent testing
  // Let's say "now" is Wednesday, Jan 15, 2025 at 12:00 PM
  const MOCK_NOW = new Date('2025-01-15T12:00:00.000Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('calculateChartData', () => {
    

    describe('Weekly View', () => {
      it('should initialize empty chart with 7 days', () => {
        const result = calculateChartData([], 'weekly', MOCK_NOW);
        expect(result.chartData).toHaveLength(7);
        // Jan 15 2025 is Wednesday. Monday is Jan 13.
        expect(result.chartData[0].label).toBe('Mon');
        expect(result.chartData[1].label).toBe('Tue');
        // ...
        expect(result.chartData[6].label).toBe('Sun');
      });

      it('should correctly mark future days', () => {
        // MOCK_NOW is Wed Jan 15. 
        // Mon(13), Tue(14), Wed(15) are NOT future.
        // Thu(16)... should be isFuture=true
        
        const result = calculateChartData([], 'weekly', MOCK_NOW);
        
        // Mon Jan 13
        expect(result.chartData[0].isFuture).toBe(false);
        // Thu Jan 16 > Wed Jan 15 (now)
        expect(result.chartData[3].isFuture).toBe(true);
      });

      it('should attribute session duration to correct day', () => {
        const monDate = new Date('2025-01-13T10:00:00.000Z'); // Monday
        const sessions: Session[] = [
          {
            id: '1',
            startTime: monDate.toISOString(),
            endTime: new Date(monDate.getTime() + 2 * 3600 * 1000).toISOString(),
            durationSeconds: 2 * 3600, // 2 hours
            tags: [],
            notes: '',
          }
        ];

        const result = calculateChartData(sessions, 'weekly', MOCK_NOW);
        // Index 0 is Monday
        expect(result.chartData[0].value).toBeCloseTo(2, 5);
        expect(result.totalPeriodHours).toBeCloseTo(2, 5);
      });

      it('should handle sessions spanning multiple days', () => {
        // Start Monday 23:00 Local Time, duration 3 hours (ends Tuesday 02:00)
        // Mon: 1 hour, Tue: 2 hours
        const monDate = new Date(2025, 0, 13, 23, 0, 0); // Jan 13, 23:00 Local
        const sessions: Session[] = [
          {
            id: '1',
            startTime: monDate.toISOString(),
            endTime: new Date(monDate.getTime() + 3 * 3600 * 1000).toISOString(),
            durationSeconds: 3 * 3600,
            tags: [],
            notes: '',
          }
        ];

        const result = calculateChartData(sessions, 'weekly', MOCK_NOW);
        
        expect(result.chartData[0].value).toBeCloseTo(1, 5); // Monday
        expect(result.chartData[1].value).toBeCloseTo(2, 5); // Tuesday
        expect(result.totalPeriodHours).toBeCloseTo(3, 5);
      });

       it('should handle disjoint sessions correctly', () => {
        const monDate = new Date(2025, 0, 13, 10, 0, 0);
        const wedDate = new Date(2025, 0, 15, 10, 0, 0);

        const sessions: Session[] = [
          {
            id: '1',
            startTime: monDate.toISOString(),
            endTime: new Date(monDate.getTime() + 1 * 3600 * 1000).toISOString(),
            durationSeconds: 1 * 3600,
            tags: [],
            notes: '',
          },
          {
            id: '2',
            startTime: wedDate.toISOString(),
            endTime: new Date(wedDate.getTime() + 2 * 3600 * 1000).toISOString(),
            durationSeconds: 2 * 3600,
            tags: [],
            notes: '',
          }
        ];

        const result = calculateChartData(sessions, 'weekly', MOCK_NOW);
        expect(result.chartData[0].value).toBeCloseTo(1, 5); // Mon
        expect(result.chartData[2].value).toBeCloseTo(2, 5); // Wed
        expect(result.totalPeriodHours).toBeCloseTo(3, 5);
      });
    });
  });
});
