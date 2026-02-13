
import { calculateChartData } from '../../utils/analyticsHelpers';
import { Session } from '../../types';

describe('analyticsHelpers - Logic Issue #3', () => {
  // Mock Data
  const weekendSession: Session = {
    id: '1',
    startTime: '2023-10-07T10:00:00.000Z', // Saturday, Oct 7, 2023
    endTime: '2023-10-07T12:00:00.000Z',
    durationSeconds: 7200, // 2 hours
    tags: ['work'],
    notes: 'weekend work',
  };

  const weekdaySession: Session = {
    id: '2',
    startTime: '2023-10-06T10:00:00.000Z', // Friday, Oct 6, 2023
    endTime: '2023-10-06T12:00:00.000Z',
    durationSeconds: 7200, // 2 hours
    tags: ['work'],
    notes: 'weekday work',
  };

  const sessions = [weekendSession, weekdaySession];
  const currentDate = new Date('2023-10-01T00:00:00.000Z'); // October 2023

  it('calculates total hours correctly when weekends included', () => {
    const result = calculateChartData(sessions, 'monthly', currentDate, false);
    
    // Both sessions should be counted -> 4 hours
    expect(result.totalPeriodHours).toBeCloseTo(4, 1);
    
    // Find Friday and Saturday data points
    const friday = result.chartData.find(d => new Date(d.fullDate!).getDay() === 5 && new Date(d.fullDate!).getDate() === 6);
    const saturday = result.chartData.find(d => new Date(d.fullDate!).getDay() === 6 && new Date(d.fullDate!).getDate() === 7);
    
    expect(friday?.value).toBeCloseTo(2, 1);
    expect(saturday?.value).toBeCloseTo(2, 1);
  });

  it('calculates total hours correctly when weekends excluded', () => {
    const result = calculateChartData(sessions, 'monthly', currentDate, true);
    
    // Only weekday session should be counted -> 2 hours
    expect(result.totalPeriodHours).toBeCloseTo(2, 1);
    
    // Weekday (Friday) should be present and valid
    const friday = result.chartData.find(d => new Date(d.fullDate!).getDay() === 5 && new Date(d.fullDate!).getDate() === 6);
    expect(friday?.value).toBeCloseTo(2, 1);

    // Weekend (Saturday) should NOT be in the chart data at all
    // (Based on logic: if (excludeWeekends && isWeekend(d)) continue;)
    const saturday = result.chartData.find(d => new Date(d.fullDate!).toDateString() === new Date(weekendSession.startTime).toDateString());
    expect(saturday).toBeUndefined();
  });

  it('correctly identifies today in chart data', () => {
    const today = new Date();
    const result = calculateChartData([], 'weekly', today, false);
    
    const todayEntry = result.chartData.find(d => d.isToday === true);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.fullDate).toBe(today.toDateString());
  });
});
