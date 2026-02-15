import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Session, Tag } from "../../types";
import { ViewMode, calculatePieChartData } from "../../utils/analyticsHelpers";
import { formatDuration } from "../../utils/format";

interface PieChartCardProps {
  sessions: Session[];
  allTags: Tag[];
}

const COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", 
  "#6366f1", "#14b8a6", "#f97316", "#ef4444", "#84cc16"
];

export const PieChartCard: React.FC<PieChartCardProps> = ({ sessions, allTags }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const dateLabel = useMemo(() => {
    if (viewMode === "weekly") {
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(currentDate);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${startStr} - ${endStr}`;
    } else {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }, [currentDate, viewMode]);

  const data = useMemo(() => {
    return calculatePieChartData(sessions, viewMode, currentDate).map(item => {
        const tag = allTags.find(t => t.name === item.name);
        return {
            ...item,
            color: tag?.color || COLORS[Math.floor(Math.random() * COLORS.length)]
        };
    });
  }, [sessions, viewMode, currentDate, allTags]);

  const isNextDisabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'weekly') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Calculate the start of the next week period
      const day = nextWeek.getDay();
      const diff = nextWeek.getDate() - day + (day === 0 ? -6 : 1);
      const nextWeekStart = new Date(nextWeek);
      nextWeekStart.setDate(diff);
      nextWeekStart.setHours(0, 0, 0, 0);

      return nextWeekStart > today;
    }

    if (viewMode === 'monthly') {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      // Start of next month
      const nextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
      return nextMonthStart > today;
    }

    return false;
  }, [viewMode, currentDate]);

  const totalDuration = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  return (
    <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-6 lg:p-8 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Activity Distribution</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400"> Breakdown by tag </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 items-end">
          <div className="flex items-center gap-1 mb-1 text-slate-900 dark:text-white select-none">
            <button
              onClick={handlePrev}
              className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous period"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-center px-1 min-w-[120px]">
              {dateLabel}
            </span>
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`size-8 flex items-center justify-center rounded-full transition-colors ${
                isNextDisabled 
                  ? "opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600" 
                  : "hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              }`}
              aria-label="Next period"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="bg-[#f1f5f9] dark:bg-[#111418] p-1 rounded-lg inline-flex border border-transparent dark:border-[#283039]">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-white dark:bg-[#283039] text-[#0f172a] dark:text-white shadow-sm"
                  : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-white dark:bg-[#283039] text-[#0f172a] dark:text-white shadow-sm"
                  : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 h-[300px] relative">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={110}
                        outerRadius={150}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number | string | Array<number | string> | undefined) => {
                          if (value === undefined) return ['0h', 'Duration'];
                          const val = Number(Array.isArray(value) ? value[0] : value);
                          return [`${val.toFixed(1)}h`, 'Duration'];
                        }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                    No data for this period
                </div>
            )}
             {/* Center Text */}
             {data.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatDuration(totalDuration).split(' ')[0]}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hours</p>
                </div>
             )}
        </div>

        {/* Custom Legend */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value.toFixed(1)}h</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {totalDuration > 0 ? Math.round((item.value / totalDuration) * 100) : 0}%
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
