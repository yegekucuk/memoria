import React, { useState, useMemo, useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { DateRangeControls } from "./DateRangeControls";
import { Session, Tag } from "../../types";
import { ViewMode, calculatePieChartData, navigateDate, getDateLabel, isNextPeriodDisabled } from "../../utils/analyticsHelpers";
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
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const contentId = useId();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsDesktopViewport(event.matches);
    };

    updateViewport(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  const handlePrev = () => setCurrentDate(navigateDate(viewMode, currentDate, 'prev'));
  const handleNext = () => setCurrentDate(navigateDate(viewMode, currentDate, 'next'));

  const dateLabel = useMemo(() => getDateLabel(viewMode, currentDate), [currentDate, viewMode]);

  const data = useMemo(() => {
    return calculatePieChartData(sessions, viewMode, currentDate).map(item => {
        const tag = allTags.find(t => t.name === item.name);
        return {
            ...item,
            color: tag?.color || COLORS[Math.floor(Math.random() * COLORS.length)]
        };
    });
  }, [sessions, viewMode, currentDate, allTags]);

  const isNextDisabled = useMemo(
    () => isNextPeriodDisabled(viewMode, currentDate),
    [viewMode, currentDate]
  );

  const totalDuration = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  const isAccordionOpen = !isDesktopViewport || isDesktopOpen;

  return (
    <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-6 lg:p-8 shadow-sm flex flex-col">
      <button
        onClick={() => {
          if (isDesktopViewport) {
            setIsDesktopOpen(prev => !prev);
          }
        }}
        className="w-full flex items-center justify-between text-left group cursor-default lg:cursor-pointer"
        aria-expanded={isDesktopViewport ? isDesktopOpen : true}
        aria-controls={contentId}
        aria-label={isDesktopViewport ? (isDesktopOpen ? "Hide activity distribution" : "Show activity distribution") : "Activity distribution section"}
      >
        <div className="mb-2">
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white lg:group-hover:text-primary transition-colors">Activity Distribution</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400"> Breakdown by tag </p>
        </div>
        <div className="hidden lg:block mt-1 p-1 rounded-md transition-colors group-hover:bg-slate-100 dark:group-hover:bg-white/5">
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDesktopOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isAccordionOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-label="Activity Distribution content"
            initial={isDesktopViewport ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={isDesktopViewport ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <div className="flex justify-end mb-6">
                <DateRangeControls
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  dateLabel={dateLabel}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isNextDisabled={isNextDisabled}
                />
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
            </motion.div>
          )}
          </AnimatePresence>
    </div>
  );
};
