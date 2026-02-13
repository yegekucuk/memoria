import React from "react";
import { formatDuration } from "../../utils/format";
import { ChartBar, ViewMode } from "../../hooks/useAnalyticsData";

interface ActivityChartProps {
  chartData: ChartBar[];
  maxVal: number;
  viewMode: ViewMode;
  totalPeriodHours: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  chartData,
  maxVal,
  viewMode,
  totalPeriodHours,
}) => {
  return (
    <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-6 lg:p-8 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white capitalize">
            {viewMode} Activity
          </h3>
          <div className="flex flex-col sm:flex-row items-baseline gap-2 text-slate-900 dark:text-white">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              {formatDuration(
                viewMode === "weekly"
                  ? totalPeriodHours /
                      (chartData.filter((d) => !d.isFuture).length || 1)
                  : totalPeriodHours,
              )}
            </span>
            <span className="text-sm font-medium text-slate-500 flex items-center">
              {viewMode === "weekly" ? "Average" : "Total for selected period"}
            </span>
          </div>
        </div>
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
          <div key={i} className="group relative flex-1 h-full flex items-end">
            <div
              className={`size-full rounded-t-sm transition-all duration-300 ${
                bar.isFuture
                  ? "bg-slate-100 dark:bg-white/5"
                  : "bg-primary hover:bg-primary/90"
              }`}
              style={{ height: `${(bar.value / maxVal) * 100}%` }}
            ></div>

            {/* Tooltip */}
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none transition-opacity">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
                {formatDuration(bar.value)}
              </div>
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900 dark:border-t-white"></div>
            </div>
          </div>
        ))}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between px-2 pt-2 text-[#9dabb9] text-xs font-medium pl-10">
        {viewMode === "weekly" &&
          chartData.map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d.label}
            </span>
          ))}
        {viewMode === "monthly" &&
          chartData.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px]">
              {d.label}
            </span>
          ))}
      </div>
    </div>
  );
};
