import { Session } from '../types';

export type ViewMode = 'weekly' | 'monthly';

export interface ChartBar {
  label: string;
  value: number;
  fullDate?: string;
  isFuture?: boolean;
}

export const calculateChartData = (
  sessions: Session[],
  viewMode: ViewMode,
  currentDate: Date,
  excludeWeekends: boolean = false
): { chartData: ChartBar[]; totalPeriodHours: number; maxVal: number } => {
  const data: ChartBar[] = [];
  let total = 0;
  const now = new Date();
  const selectedDate = new Date(currentDate);

  // Helper to add hours to a specific date string in the data array
  const addToData = (dateStr: string, hours: number) => {
    const entry = data.find((d) => d.fullDate === dateStr);
    if (entry) {
      entry.value += hours;
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };


  if (viewMode === 'monthly') {
    // MONTHLY VIEW
    const cur = new Date(selectedDate);
    const year = cur.getFullYear();
    const month = cur.getMonth();
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Initialize days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        if (excludeWeekends && isWeekend(d)) continue;
        
        data.push({
            label: `${i}`,
            value: 0,
            fullDate: d.toDateString(),
            isFuture: d > now,
        });
    }

    sessions.forEach((session) => {
        let sTime = new Date(session.startTime);
        
        // Skip sessions that don't overlap with the selected month
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        
        const sessionEnd = new Date(sTime.getTime() + session.durationSeconds * 1000);
        
        if (sessionEnd < monthStart || sTime > monthEnd) {
             return;
        }

        let remainingDurationSeconds = session.durationSeconds;
        
        // If session started before the month, fast forward to month start
        if (sTime < monthStart) {
            const diffSeconds = (monthStart.getTime() - sTime.getTime()) / 1000;
            remainingDurationSeconds -= diffSeconds;
            sTime = new Date(monthStart);
        }

        while (remainingDurationSeconds > 0) {
            const sDateStr = sTime.toDateString();
             // If we've gone past the month, stop
             if (sTime > monthEnd) break;

            const endOfDay = new Date(sTime);
            endOfDay.setHours(23, 59, 59, 999);
            
            const nextMidnight = new Date(sTime);
            nextMidnight.setDate(nextMidnight.getDate() + 1);
            nextMidnight.setHours(0,0,0,0);
            
            const secondsToNextDay = (nextMidnight.getTime() - sTime.getTime()) / 1000;
            const durationForThisDay = Math.min(remainingDurationSeconds, secondsToNextDay);
            
             addToData(sDateStr, durationForThisDay / 3600);
             if (data.some(d => d.fullDate === sDateStr)) {
                // Only add to total if it's visible (not excluded)
                total += durationForThisDay / 3600;
            }
            
            remainingDurationSeconds -= durationForThisDay;
            sTime = new Date(nextMidnight);
        }
    });

  } else {
    // WEEKLY VIEW
    const cur = new Date(selectedDate);
    const day = cur.getDay();
    const diff = cur.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(cur);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    // Initialize 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      if (excludeWeekends && isWeekend(d)) continue;

      data.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: 0,
        fullDate: d.toDateString(),
        isFuture: d > now,
      });
    }

    sessions.forEach((session) => {
      let sTime = new Date(session.startTime);
      let remainingDurationSeconds = session.durationSeconds;
      
      // Process the session day by day until duration is exhausted
      while (remainingDurationSeconds > 0) {
        const sDateStr = sTime.toDateString();
        
        // Find how much of this session falls on this specific day (sTime)
        // Values: sTime ... end of day
        const endOfDay = new Date(sTime);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Calculate seconds until midnight
        // Next midnight
        const nextMidnight = new Date(sTime);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0,0,0,0);
        
        const secondsToNextDay = (nextMidnight.getTime() - sTime.getTime()) / 1000;
        
        const durationForThisDay = Math.min(remainingDurationSeconds, secondsToNextDay);
        
        // Add to data if this day is in our view
        addToData(sDateStr, durationForThisDay / 3600);
        
        if (data.some(d => d.fullDate === sDateStr)) {
            // Only add to total if it's visible in the current week view? 
            // The original logic calculated total for the visible period.
            // If excluded, data.some will be false, so it won't be added to total. Correct.
            total += durationForThisDay / 3600;
        }

        // Advance
        remainingDurationSeconds -= durationForThisDay;
        sTime = new Date(nextMidnight); // Start of next day
      }
    });
  }

  const max = Math.max(...data.map((d) => d.value), 0);
  const displayMax = Math.max(Math.ceil(max), 4);

  return { chartData: data, totalPeriodHours: total, maxVal: displayMax };
};
