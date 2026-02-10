import { Session } from '../types';

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export interface ChartBar {
  label: string;
  value: number;
  fullDate?: string;
  isFuture?: boolean;
}

export const calculateChartData = (
  sessions: Session[],
  viewMode: ViewMode,
  currentDate: Date
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

  // Helper to add hours to a specific hour index (0-23) for daily view
  const addToHourlyData = (hour: number, hours: number) => {
    if (data[hour]) {
      data[hour].value += hours;
    }
  };

  if (viewMode === 'daily') {
    // DAILY VIEW
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
        data.push({ label: `${i}`, value: 0 });
    }

    sessions.forEach((session) => {
      const sTime = new Date(session.startTime);
      const eTime = new Date(sTime.getTime() + session.durationSeconds * 1000);

      // We only care about the overlap of [sTime, eTime] with [startOfDay, endOfDay]
      const overlapStart = sTime < startOfDay ? startOfDay : sTime;
      const overlapEnd = eTime > endOfDay ? endOfDay : eTime;

      if (overlapStart < overlapEnd) {
        // There is an overlap with this day
        // For the hourly chart, we want to distribute this overlap duration into hours
        // This is a bit more granular. If a session spans 13:50 to 15:10
        // 13:50-14:00 -> 10 mins in hour 13
        // 14:00-15:00 -> 60 mins in hour 14
        // 15:00-15:10 -> 10 mins in hour 15
        
        let currentPointer = new Date(overlapStart);
        while (currentPointer < overlapEnd) {
            const currentHour = currentPointer.getHours();
            
            // The end of this hour slot
            const endOfHour = new Date(currentPointer);
            endOfHour.setHours(currentHour + 1, 0, 0, 0);
            
            // The effective end time for this segment is either the session end or the hour end
            const segmentEnd = overlapEnd < endOfHour ? overlapEnd : endOfHour;
            
            const durationMs = segmentEnd.getTime() - currentPointer.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            
            addToHourlyData(currentHour, durationHours);
            total += durationHours;

            // Move pointer
            currentPointer = segmentEnd;
        }
      }
    });

  } else if (viewMode === 'monthly') {
    // MONTHLY VIEW
    const cur = new Date(selectedDate);
    const year = cur.getFullYear();
    const month = cur.getMonth();
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Initialize days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
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
