
import { calculatePieChartData } from '../../utils/analyticsHelpers';
import { Session } from '../../types';

describe('calculatePieChartData - Weekend Exclusion Bug', () => {
    const weekendSession: Session = {
        id: '1',
        startTime: '2023-10-07T10:00:00.000Z', // Saturday, Oct 7, 2023
        endTime: '2023-10-07T12:00:00.000Z',
        durationSeconds: 7200, // 2 hours
        tags: ['weekend-tag'],
        notes: 'weekend work',
    };

    const weekdaySession: Session = {
        id: '2',
        startTime: '2023-10-06T10:00:00.000Z', // Friday, Oct 6, 2023
        endTime: '2023-10-06T12:00:00.000Z',
        durationSeconds: 7200, // 2 hours
        tags: ['weekday-tag'],
        notes: 'weekday work',
    };

    const sessions = [weekendSession, weekdaySession];
    const currentDate = new Date('2023-10-01T00:00:00.000Z'); // October 2023

    it('successfully excludes weekends when the parameter is passed', () => {
        const result = calculatePieChartData(sessions, 'monthly', currentDate, true);
        
        // "weekend-tag" should NOT be present.
        expect(result.find(d => d.name === 'weekend-tag')).toBeUndefined();
        // "weekday-tag" should still be present.
        expect(result.find(d => d.name === 'weekday-tag')).toBeDefined();
    });
});
