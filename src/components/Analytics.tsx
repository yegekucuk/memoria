import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { ChevronLeft, ChevronRight, Download, Clock, Tag, Sigma, TrendingUp } from 'lucide-react';
import { formatDuration } from '../utils/format';

interface AnalyticsProps {
  sessions: Session[];
}

type ViewMode = 'daily' | 'weekly';

export const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation Handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const dateLabel = useMemo(() => {
    if (viewMode === 'daily') return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (viewMode === 'weekly') {
        const curr = new Date(currentDate);
        const day = curr.getDay();
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(curr);
        start.setDate(diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode]);

  // Chart Data Calculation
  const { chartData, totalPeriodHours, maxVal } = useMemo(() => {
    const data: { label: string; value: number; fullDate?: string; isFuture?: boolean }[] = [];
    let total = 0;
    const now = new Date();
    
    // Normalize currentDate to remove time component for safe comparison if needed
    const selectedDate = new Date(currentDate);

    if (viewMode === 'daily') { // viewMode is narrowed to 'daily' | 'weekly'
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      for (let i = 0; i < 24; i++) {
        data.push({ label: `${i}`, value: 0 });
      }

      sessions.forEach(session => {
        const sTime = new Date(session.startTime);
        if (sTime >= startOfDay && sTime <= endOfDay) {
          const hour = sTime.getHours();
          const duration = session.durationSeconds / 3600;
          if (data[hour]) {
             data[hour].value += duration;
             total += duration;
          }
        }
      });
    } else {
      // viewMode is 'weekly'
      const cur = new Date(selectedDate);
      const day = cur.getDay();
      const diff = cur.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const monday = new Date(cur);
      monday.setDate(diff);
      monday.setHours(0,0,0,0);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        data.push({ 
            label: d.toLocaleDateString('en-US', { weekday: 'short' }), 
            value: 0, 
            fullDate: d.toDateString(),
            isFuture: d > now
        });
      }

      sessions.forEach(session => {
        const sTime = new Date(session.startTime);
        const sDateStr = sTime.toDateString();
        const entry = data.find(d => d.fullDate === sDateStr);
        if (entry) {
          const duration = session.durationSeconds / 3600;
          entry.value += duration;
          total += duration;
        }
      });
    }

    const max = Math.max(...data.map(d => d.value), 0);
    // Dynamic scaling: min maxVal is 4h, otherwise max + buffer
    const displayMax = Math.max(Math.ceil(max), 4); 

    return { chartData: data, totalPeriodHours: total, maxVal: displayMax };
  }, [viewMode, currentDate, sessions]);

  // Overall Stats
  const totalHoursAllTime = sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600;
  
  const tagCounts: Record<string, number> = {};
  sessions.forEach(s => s.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + s.durationSeconds));
  const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
  const topTagName = topTagEntry ? topTagEntry[0] : 'None';
  const topTagPct = topTagEntry ? Math.round((topTagEntry[1] / 3600 / (totalHoursAllTime || 1)) * 100) : 0;
  
  // Calculate average daily hours based on distinct days worked
  const distinctDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;
  const avgDailyHours = distinctDays > 0 ? totalHoursAllTime / distinctDays : 0;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Analytics</h1>
                <p className="text-[#6b7280] dark:text-[#9dabb9] text-base font-normal">Detailed productivity reports and trends</p>
            </div>
            <div className="flex flex-col gap-3 items-start md:items-end">
                <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white select-none">
                    <button onClick={handlePrev} className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold min-w-[160px] text-center">{dateLabel}</span>
                    <button onClick={handleNext} className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="bg-[#e5e7eb] dark:bg-[#283039] p-1 rounded-lg inline-flex">
                    {/* <button 
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-[#111418] text-[#111418] dark:text-white shadow-sm' : 'text-[#6b7280] dark:text-[#9dabb9]'}`}
                    >
                        Daily
                    </button> */}
                    <button 
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'weekly' ? 'bg-white dark:bg-[#111418] text-[#111418] dark:text-white shadow-sm' : 'text-[#6b7280] dark:text-[#9dabb9]'}`}
                    >
                        Weekly
                    </button>
                    {/* Monthly view removed */}
                </div>
            </div>
        </div>
        
        {/* Main Chart Card */}
        <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-6 lg:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white capitalize">{viewMode} Activity</h3>
                    <div className="flex items-baseline gap-2 text-slate-900 dark:text-white">
                        <span className="text-3xl font-bold tracking-tight">{formatDuration(totalPeriodHours)}</span>
                        <span className="text-sm font-medium text-slate-500 flex items-center">
                            Total for selected period
                        </span>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                    <Download size={20} />
                    Export Report
                </button>
            </div>
            
            {/* Custom Visual Bar Chart */}
            <div className="relative h-[300px] w-full flex items-end gap-1 sm:gap-2 md:gap-3 justify-between px-2 pb-6 border-b border-[#e5e7eb] dark:border-[#283039] pl-10">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-[#9dabb9] font-medium text-right pr-2 h-full w-10">
                    <span>{maxVal}h</span>
                    <span>{(maxVal * 0.75).toFixed(1)}h</span>
                    <span>{(maxVal * 0.5).toFixed(1)}h</span>
                    <span>{(maxVal * 0.25).toFixed(1)}h</span>
                    <span>0h</span>
                </div>
                
                {/* Generated Bars */}
                {chartData.map((bar, i) => (
                   <div 
                     key={i} 
                     className="group relative flex-1 h-full flex items-end"
                   >
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                                bar.isFuture 
                                    ? 'bg-slate-100 dark:bg-white/5' 
                                    : 'bg-primary hover:bg-primary/90'
                            }`}
                            style={{ height: `${(bar.value / maxVal) * 100}%` }}
                        ></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none transition-opacity">
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
                                {formatDuration(bar.value)}
                            </div>
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900 dark:border-t-white"></div>
                        </div>
                   </div>
                ))}
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between px-2 pt-2 text-[#9dabb9] text-xs font-medium pl-10">
                {viewMode === 'weekly' && chartData.map((d, i) => <span key={i} className="flex-1 text-center">{d.label}</span>)}
                {viewMode === 'daily' && [0, 4, 8, 12, 16, 20, 24].map((h) => <span key={h}>{h}:00</span>)}
            </div>
        </div>

        {/* Insights Grid */}
        <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-2 text-slate-900 dark:text-white">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1c232d] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#283039] shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Clock size={24} />
                        </div>
                        <p className="text-[#6b7280] dark:text-[#9dabb9] text-sm font-medium">Avg. Daily Hours</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(avgDailyHours)}</p>
                        <p className="text-xs text-[#6b7280] dark:text-[#9dabb9] mt-1">Based on active days</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1c232d] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#283039] shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Tag size={24} />
                        </div>
                        <p className="text-[#6b7280] dark:text-[#9dabb9] text-sm font-medium">Most Productive Tag</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white truncate">{topTagName}</p>
                        <p className="text-xs text-[#6b7280] dark:text-[#9dabb9] mt-1">{topTagPct}% of total time</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1c232d] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#283039] shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Sigma size={24} />
                        </div>
                        <p className="text-[#6b7280] dark:text-[#9dabb9] text-sm font-medium">Total Hours</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(totalHoursAllTime)}</p>
                        <p className="text-xs text-[#6b7280] dark:text-[#9dabb9] mt-1">All time</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="pt-4 pb-12">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
                <button className="text-sm font-medium text-primary hover:text-primary/80">View all</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] dark:border-[#283039]">
                <table className="w-full text-left text-sm text-[#6b7280] dark:text-[#9dabb9]">
                    <thead className="bg-[#f9fafb] dark:bg-[#1c232d] text-xs uppercase font-semibold text-[#111418] dark:text-white">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Notes</th>
                            <th className="px-6 py-4">Tag</th>
                            <th className="px-6 py-4 text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#283039] bg-white dark:bg-[#111418]">
                        {sessions.slice().reverse().map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-[#1c232d]/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[#111418] dark:text-white">
                                  {new Date(session.startTime).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 truncate max-w-[200px]">{session.notes || '-'}</td>
                                <td className="px-6 py-4">
                                  {session.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mr-1">
                                      {tag}
                                    </span>
                                  ))}
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                  {Math.floor(session.durationSeconds / 3600)}h {Math.floor((session.durationSeconds % 3600) / 60)}m
                                </td>
                            </tr>
                        ))}
                         {sessions.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">No recent activity</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};