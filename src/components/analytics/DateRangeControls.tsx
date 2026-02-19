import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ViewMode } from "../../utils/analyticsHelpers";

interface DateRangeControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}

export const DateRangeControls: React.FC<DateRangeControlsProps> = ({
  viewMode,
  setViewMode,
  dateLabel,
  onPrev,
  onNext,
  isNextDisabled = false,
}) => {
  return (
    <div className="flex flex-col gap-3 items-end">
      <div className="flex items-center gap-1 mb-1 text-slate-900 dark:text-white select-none">
        <button
          onClick={onPrev}
          className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Previous period"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-bold text-center px-1 min-w-[120px]">
          {dateLabel}
        </span>
        <button
          onClick={onNext}
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
  );
};
