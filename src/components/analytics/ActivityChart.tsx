import React from "react";
import { formatDuration } from "../../utils/format";
import { ChartBar, ViewMode } from "@/types";
import { X } from "lucide-react";
import { DateRangeControls } from "./DateRangeControls";
import { Tag } from "../../types";

interface ActivityChartProps {
  chartData: ChartBar[];
  maxVal: number;
  viewMode: ViewMode;
  totalPeriodHours: number;
  allTags: Tag[];
  selectedFilterTags: string[];
  onToggleFilterTag: (tagName: string) => void;
  onClearFilters: () => void;
  onPrev: () => void;
  onNext: () => void;
  dateLabel: string;
  setViewMode: (mode: ViewMode) => void;
  isNextDisabled?: boolean;
  children?: React.ReactNode;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  chartData,
  maxVal,
  viewMode,
  totalPeriodHours,
  allTags = [],
  selectedFilterTags = [],
  onToggleFilterTag = () => {},
  onClearFilters = () => {},
  onPrev,
  onNext,
  dateLabel,
  setViewMode,
  isNextDisabled = false,
  children,
}) => {
  const [isTotal, setIsTotal] = React.useState(false);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white capitalize">
            {viewMode} Activity
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-baseline gap-2 text-slate-900 dark:text-white">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {formatDuration(
                  isTotal
                    ? totalPeriodHours
                    : totalPeriodHours /
                      (chartData.filter((d) => !d.isFuture).length || 1)
                )}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 flex items-center">
                  {isTotal ? "Total" : "Average"}
                </span>
                <button
                  onClick={() => setIsTotal(!isTotal)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    isTotal ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`${
                      isTotal ? "translate-x-5" : "translate-x-1"
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Controls */}
        <DateRangeControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          dateLabel={dateLabel}
          onPrev={onPrev}
          onNext={onNext}
          isNextDisabled={isNextDisabled}
        />
      </div>

      {/* Tag Filter - Full Width */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Filter by Tags
          </label>
          {selectedFilterTags.length > 0 && (
            <button
              onClick={onClearFilters}
              className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isSelected = selectedFilterTags.includes(tag.name);
            const color = tag.color;
            return (
              <button
                key={tag.id}
                onClick={() => onToggleFilterTag(tag.name)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isSelected
                    ? color
                    : color
                    ? `${color}1A`
                    : "#f8fafc",
                  borderColor: isSelected
                    ? color
                    : color
                    ? `${color}33`
                    : "#e2e8f0",
                  color: isSelected ? "#ffffff" : color || "#64748b",
                  boxShadow: isSelected ? `0 2px 4px 0 ${color}40` : "none",
                }}
              >
                {tag.name}
              </button>
            );
          })}
          {allTags.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              No tags available.
            </span>
          )}
        </div>
      </div>

      {/* Custom Visual Bar Chart */}
      <div className="relative h-75 w-full flex items-end gap-1 sm:gap-2 md:gap-3 justify-between px-2 pb-6 border-b border-slate-200 dark:border-white/10 pl-10">
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
            <span key={i} className={`flex-1 text-center ${d.isToday ? "text-primary font-bold" : ""}`}>
              {d.label}
            </span>
          ))}
        {viewMode === "monthly" &&
          chartData.map((d, i) => (
            <span key={i} className={`flex-1 text-center text-[10px] ${d.isToday ? "text-primary font-bold" : ""}`}>
              {d.label}
            </span>
          ))}
      </div>

      {/* Children Container (Calendar) */}
      {children && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            {children}
        </div>
      )}
    </div>
  );
};
