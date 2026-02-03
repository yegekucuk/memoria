import React, { useState } from 'react';
import { Session } from '@/types';
import { Pencil, Trash2, Tag, Calendar, Clock, Timer } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { EditSessionModal } from './EditSessionModal';
import { useTags } from '@/hooks/useTags';

interface SessionsTableProps {
  sessions: Session[];
  onUpdate: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, onUpdate }) => {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { tags: allTags } = useTags();


  // Helper to format duration
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

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
    <>
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
                        {sessions.slice().reverse().map((session) => {
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
                                        {formatDuration(session.durationSeconds)}
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
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setEditingSession(session)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit Session"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setDeletingSessionId(session.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Session"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
    </>
  );
};
