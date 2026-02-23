import React from 'react';
import { Task, PRIORITY_COLORS, CATEGORY_STYLES } from '../types/task';

interface TaskCardProps {
  task: Task;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'No Date';
  try {
    if (dateStr.includes('T')) {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return 'Invalid Date';
      return dt.toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      });
    } else {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (isNaN(dt.getTime())) return 'Invalid Date';
      return dt.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }) + ' (All Day)';
    }
  } catch {
    return 'Invalid Date';
  }
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const categoryClass = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.Work;

  return (
    <div
      className="task-card-hover bg-gray-50 p-4 rounded-xl mb-3 shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer hover:shadow-md"
      style={{ borderLeftWidth: '4px', borderLeftColor: priorityStyle.border }}
    >
      {/* Tags */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${categoryClass}`}>
          {task.category}
        </span>
        {task.assignee && (
          <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <i className="fa-solid fa-user text-[0.6rem]"></i> {task.assignee}
          </span>
        )}
        {task.recurrence && (
          <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <i className="fa-solid fa-repeat text-[0.6rem]"></i> {task.recurrence}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">
        {task.title}
      </h4>

      {/* Original text */}
      <p className="text-xs text-gray-500 italic mb-3 leading-relaxed break-words">
        "{task.original_text}"
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>
          <i className="fa-regular fa-calendar mr-1"></i>
          {formatDate(task.due_date)}
        </span>
        <span className="font-bold" style={{ color: priorityStyle.border }}>
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
};