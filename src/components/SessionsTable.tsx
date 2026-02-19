import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@/types';
import { Pencil, Trash2, Tag, Calendar, Clock, Timer, Search, X, Filter, ChevronLeft, ChevronRight, ChevronDown, Download } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { EditSessionModal } from './EditSessionModal';
import { useTags } from '@/hooks/useTags';
import { toast } from 'react-hot-toast';
import { formatDurationShort } from '@/utils/format';

interface SessionsTableProps {
  sessions: Session[];
  onUpdate: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, onUpdate }) => {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { tags: allTags } = useTags();

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchNotes, setSearchNotes] = useState('');
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  
  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const today = new Date().toISOString().split('T')[0];

  const handleDateChange = (setter: (val: string) => void, val: string, label: string) => {
      if (val && val > today) {
          toast.error(`${label} cannot be in the future`);
          return;
      }
      setter(val);
  };



  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchNotes, selectedFilterTags]);

  const handleSaveEdit = async (id: string, updates: Pick<Session, 'tags' | 'notes'>) => {
    try {
        const res = await fetch(`/api/sessions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (res.ok) {
            onUpdate();
        } else {
            console.error("Failed to update session");
            throw new Error("Failed to update");
        }
    } catch (e) {
        throw e;
    }
  };

  const handleDelete = async () => {
    if (!deletingSessionId) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`/api/sessions/${deletingSessionId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            onUpdate();
            setDeletingSessionId(null);
        }
    } catch (e) {
        console.error("Failed to delete session", e);
    } finally {
        setIsDeleting(false);
    }
  };

  const toggleFilterTag = (tagName: string) => {
      setSelectedFilterTags(prev => 
          prev.includes(tagName) 
              ? prev.filter(t => t !== tagName)
              : [...prev, tagName]
      );
  };

  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
        toast.error("No sessions to export");
        return;
    }

    // CSV Headers
    const headers = ['Date', 'Start Time', 'End Time', 'Duration (seconds)', 'Tags', 'Notes'];

    // CSV Rows
    const rows = filteredSessions.map(session => {
        const startDate = new Date(session.startTime);
        const endDate = session.endTime ? new Date(session.endTime) : null;
        
        // Escape quotes in notes and tags to prevent CSV breakages
        const escapedNotes = session.notes ? `"${session.notes.replace(/"/g, '""')}"` : '';
        const escapedTags = session.tags.length > 0 ? `"${session.tags.join(', ')}"` : '';

        return [
            startDate.toLocaleDateString(),
            startDate.toLocaleTimeString(),
            endDate ? endDate.toLocaleTimeString() : '',
            session.durationSeconds,
            escapedTags,
            escapedNotes
        ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sessions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        
        // Date Logic
        if (startDate) {
            const start = new Date(startDate);
            if (sessionDate < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            // Set end date specifically to end of day to include sessions on that day
            end.setHours(23, 59, 59, 999);
            if (sessionDate > end) return false;
        }

        // Notes Logic
        if (searchNotes) {
            const notes = session.notes || '';
            if (!notes.toLowerCase().includes(searchNotes.toLowerCase())) return false;
        }

        // Tags Logic
        if (selectedFilterTags.length > 0) {
            // Intersection: Session must have ALL selected tags
            const hasAllTags = selectedFilterTags.every(tag => session.tags.includes(tag));
            if (!hasAllTags) return false;
        }

        // Hide running sessions (no endTime) if they have no tags and no notes
        if (!session.endTime && (!session.tags || session.tags.length === 0) && (!session.notes || session.notes.trim() === '')) {
            return false;
        }

        return true;
    });
  }, [sessions, startDate, endDate, searchNotes, selectedFilterTags]);

  if (sessions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/10">
              <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full mb-4">
                  <Timer size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No sessions yet</h3>
              <p className="text-slate-500 dark:text-slate-400">Start a focus session to see your history here.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Filters Section */}
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
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
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
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-slate-200 dark:border-white/5 cursor-pointer"
                        title="Export filtered sessions as CSV"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                 {(startDate || endDate || searchNotes || selectedFilterTags.length > 0) && (
                     <button 
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setSearchNotes('');
                            setSelectedFilterTags([]);
                        }}
                        className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto flex items-center gap-1 cursor-pointer"
                     >
                         <X size={14} /> Clear All
                     </button>
                )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Inputs */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="startDate" className="text-xs font-medium text-slate-500 dark:text-slate-400">Start Date</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                            id="startDate"
                            type="date" 
                            max={today}
                            value={startDate}
                            onChange={(e) => handleDateChange(setStartDate, e.target.value, 'Start Date')}
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none max-w-full min-w-0"
                        />
                        {startDate && (
                            <button 
                                onClick={() => setStartDate('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="endDate" className="text-xs font-medium text-slate-500 dark:text-slate-400">End Date</label>
                    <div className="relative">
                         <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                            id="endDate" 
                            type="date" 
                            max={today}
                            value={endDate}
                            onChange={(e) => handleDateChange(setEndDate, e.target.value, 'End Date')}
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none max-w-full min-w-0"
                        />
                        {endDate && (
                            <button 
                                onClick={() => setEndDate('')}
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
                            onChange={(e) => setSearchNotes(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        {searchNotes && (
                            <button 
                                onClick={() => setSearchNotes('')}
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
                                onClick={() => toggleFilterTag(tag.name)}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer`}
                                style={{ 
                                    backgroundColor: isSelected ? color : (color ? `${color}1A` : '#f8fafc'),
                                    borderColor: isSelected ? color : (color ? `${color}33` : '#e2e8f0'),
                                    color: isSelected ? '#ffffff' : (color || '#64748b'),
                                    boxShadow: isSelected ? `0 1px 2px 0 ${color}66` : 'none'
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

        {/* Pagination Header */}
        {filteredSessions.length > 0 && (
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-medium text-slate-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredSessions.length)}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredSessions.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredSessions.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous Page"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Page {currentPage} of {Math.ceil(filteredSessions.length / itemsPerPage)}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSessions.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredSessions.length / itemsPerPage)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next Page"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Table Section */}
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/10">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Date</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>Time</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Timer size={16} />
                                    <span>Duration</span>
                                </div>
                            </th>
                             <th className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Tag size={16} />
                                    <span>Tags</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 w-full">Notes</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {filteredSessions.length > 0 ? (
                            filteredSessions
                                .slice()
                                .reverse()
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((session) => {
                                const startDate = new Date(session.startTime);
                                const endDate = session.endTime ? new Date(session.endTime) : null;
                                
                                return (
                                    <tr key={session.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                                            {startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {endDate && ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                                            {formatDurationShort(session.durationSeconds)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {session.tags.map(tag => {
                                                    const tagInfo = allTags.find(t => t.name === tag);
                                                    const color = tagInfo?.color;
                                                    return (
                                                        <span 
                                                            key={tag} 
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                                                            style={{ 
                                                                backgroundColor: color ? `${color}1A` : 'rgba(var(--primary), 0.1)', 
                                                                color: color || 'var(--primary)',
                                                                borderColor: color ? `${color}33` : 'rgba(var(--primary), 0.2)'
                                                            }}
                                                        >
                                                            {tag}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[300px] truncate" title={session.notes || ''}>
                                            {session.notes || <span className="text-slate-400 italic">No notes</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setEditingSession(session)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit Session"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingSessionId(session.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete Session"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                                    No sessions match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {/* Edit Modal */}
        {editingSession && (
            <EditSessionModal 
                session={editingSession}
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                onSave={handleSaveEdit}
            />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal 
            isOpen={!!deletingSessionId}
            onClose={() => setDeletingSessionId(null)}
            onConfirm={handleDelete}
            title="Delete Session"
            message={
                <p>Are you sure you want to delete this session? <br/>This action cannot be undone.</p>
            }
            confirmText="Delete"
            variant="danger"
            isLoading={isDeleting}
        />
    </div>
  );
};
