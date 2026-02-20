import React from 'react';
import { Session, Tag } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDurationShort } from '@/utils/format';

interface SessionTableRowProps {
  session: Session;
  allTags: Tag[];
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

export const SessionTableRow: React.FC<SessionTableRowProps> = ({
  session,
  allTags,
  onEdit,
  onDelete,
}) => {
  const startDate = new Date(session.startTime);
  const endDate = session.endTime ? new Date(session.endTime) : null;

  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
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
                  borderColor: color ? `${color}33` : 'rgba(var(--primary), 0.2)',
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
            onClick={() => onEdit(session)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="Edit Session"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Session"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
