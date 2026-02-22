import React from 'react';
import { Tag as TagType } from '@/types';
import { Calendar, Search, X, Filter, ChevronDown, Download } from 'lucide-react';

interface SessionFiltersProps {
  startDate: string;
  endDate: string;
  searchNotes: string;
  selectedFilterTags: string[];
  itemsPerPage: number;
  allTags: TagType[];
  hasActiveFilters: boolean;
  today: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onSearchNotesChange: (val: string) => void;
  onToggleFilterTag: (tagName: string) => void;
  onItemsPerPageChange: (val: number) => void;
  onClearAll: () => void;
  onExportCSV: () => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
  startDate,
  endDate,
  searchNotes,
  selectedFilterTags,
  itemsPerPage,
  allTags,
  hasActiveFilters,
  today,
  onStartDateChange,
  onEndDateChange,
  onSearchNotesChange,
  onToggleFilterTag,
  onItemsPerPageChange,
  onClearAll,
  onExportCSV,
}) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold mb-2">
        <Filter size={20} className="text-primary" />
        <h2>Filter Sessions</h2>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Show</span>
            <div className="relative group">
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md py-1 pl-2 pr-6 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
            <span>per page</span>
          </div>

          <button
            onClick={onExportCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-slate-200 dark:border-white/5 cursor-pointer"
            title="Export filtered sessions as CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto flex items-center gap-1 cursor-pointer"
            >
              <X size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="startDate" className="text-xs font-medium text-slate-500 dark:text-slate-400">Start Date</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="startDate"
              type="date"
              max={today}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none max-w-full min-w-0"
            />
            {startDate && (
              <button
                onClick={() => onStartDateChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="endDate" className="text-xs font-medium text-slate-500 dark:text-slate-400">End Date</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="endDate"
              type="date"
              max={today}
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none max-w-full min-w-0"
            />
            {endDate && (
              <button
                onClick={() => onEndDateChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search Notes */}
        <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-2">
          <label htmlFor="searchNotes" className="text-xs font-medium text-slate-500 dark:text-slate-400">Search Notes</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="searchNotes"
              type="text"
              placeholder="Type to search..."
              value={searchNotes}
              onChange={(e) => onSearchNotesChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
            {searchNotes && (
              <button
                onClick={() => onSearchNotesChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-col gap-1.5 pt-2">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter by Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => {
            const isSelected = selectedFilterTags.includes(tag.name);
            const color = tag.color;
            return (
              <button
                key={tag.id}
                onClick={() => onToggleFilterTag(tag.name)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isSelected ? color : (color ? `${color}1A` : '#f8fafc'),
                  borderColor: isSelected ? color : (color ? `${color}33` : '#e2e8f0'),
                  color: isSelected ? '#ffffff' : (color || '#64748b'),
                  boxShadow: isSelected ? `0 1px 2px 0 ${color}66` : 'none',
                }}
              >
                {tag.name}
              </button>
            );
          })}
          {allTags.length === 0 && (
            <span className="text-sm text-slate-400 italic">No tags available.</span>
          )}
        </div>
      </div>
    </div>
  );
};
