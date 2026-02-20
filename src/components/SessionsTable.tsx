import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@/types';
import { Tag, Calendar, Clock, Timer } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { EditSessionModal } from './EditSessionModal';
import { SessionFilters } from './sessions/SessionFilters';
import { SessionPagination } from './sessions/SessionPagination';
import { SessionTableRow } from './sessions/SessionTableRow';
import { useTags } from '@/hooks/useTags';
import { toast } from 'react-hot-toast';
import { exportSessionsCSV } from '@/utils/sessionHelpers';

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

  const handleDateChange = (setter: (val: string) => void) => (val: string) => {
    if (val && val > today) {
      toast.error('Date cannot be in the future');
      return;
    }
    setter(val);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchNotes, selectedFilterTags]);

  const handleSaveEdit = async (id: string, updates: Pick<Session, 'tags' | 'notes'>) => {
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update');
    onUpdate();
  };

  const handleDelete = async () => {
    if (!deletingSessionId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${deletingSessionId}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
        setDeletingSessionId(null);
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFilterTag = (tagName: string) => {
    setSelectedFilterTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
      toast.error('No sessions to export');
      return;
    }
    exportSessionsCSV(filteredSessions);
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchNotes('');
    setSelectedFilterTags([]);
  };

  const handleItemsPerPageChange = (val: number) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);

      if (startDate && sessionDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (sessionDate > end) return false;
      }

      if (searchNotes) {
        const notes = session.notes || '';
        if (!notes.toLowerCase().includes(searchNotes.toLowerCase())) return false;
      }

      if (selectedFilterTags.length > 0) {
        if (!selectedFilterTags.every(tag => session.tags.includes(tag))) return false;
      }

      // Hide running sessions (no endTime) with no tags and no notes
      if (!session.endTime && (!session.tags || session.tags.length === 0) && (!session.notes || session.notes.trim() === '')) {
        return false;
      }

      return true;
    });
  }, [sessions, startDate, endDate, searchNotes, selectedFilterTags]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions
    .slice()
    .reverse()
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      <SessionFilters
        startDate={startDate}
        endDate={endDate}
        searchNotes={searchNotes}
        selectedFilterTags={selectedFilterTags}
        itemsPerPage={itemsPerPage}
        allTags={allTags}
        hasActiveFilters={!!(startDate || endDate || searchNotes || selectedFilterTags.length > 0)}
        today={today}
        onStartDateChange={handleDateChange(setStartDate)}
        onEndDateChange={handleDateChange(setEndDate)}
        onSearchNotesChange={setSearchNotes}
        onToggleFilterTag={toggleFilterTag}
        onItemsPerPageChange={handleItemsPerPageChange}
        onClearAll={clearAllFilters}
        onExportCSV={handleExportCSV}
      />

      <SessionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSessions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Table */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2"><Calendar size={16} /><span>Date</span></div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2"><Clock size={16} /><span>Time</span></div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2"><Timer size={16} /><span>Duration</span></div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2"><Tag size={16} /><span>Tags</span></div>
                </th>
                <th className="px-6 py-4 w-full">Notes</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {paginatedSessions.length > 0 ? (
                paginatedSessions.map(session => (
                  <SessionTableRow
                    key={session.id}
                    session={session}
                    allTags={allTags}
                    onEdit={setEditingSession}
                    onDelete={setDeletingSessionId}
                  />
                ))
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
