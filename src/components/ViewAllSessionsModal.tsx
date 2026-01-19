
import React from 'react';
import { Session } from '../types';
import { FlaskConical, Tag, X } from 'lucide-react';

interface ViewAllSessionsModalProps {
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
}

export const ViewAllSessionsModal: React.FC<ViewAllSessionsModalProps> = ({ sessions, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-surface-dark z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {sessions.slice().reverse().map((session, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                session.tags[0] === 'Math' ? 'bg-purple-500/10 text-purple-500' : 
                session.tags[0] === 'Coding' ? 'bg-blue-500/10 text-blue-500' :
                'bg-slate-500/10 text-slate-500'
              }`}>
                {session.tags[0] === 'Math' ? <FlaskConical size={20} /> : <Tag size={20} />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.tags[0] || 'Uncategorized'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.notes || 'No notes'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{Math.floor(session.durationSeconds / 60)}m</p>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-slate-500 py-8">No sessions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
