import React, { useState } from 'react';
import { Task, PRIORITY_COLORS, CATEGORY_STYLES } from '../types/task';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onMove?: (id: string) => void;
  onEditTitle?: (id: string, newTitle: string) => void;
  onChangePriority?: (id: string, newPriority: 'high' | 'medium' | 'low') => void;
  moveLabel?: string;
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

export const TaskCard: React.FC<TaskCardProps> = ({
  task, onDelete, onMove, onEditTitle, onChangePriority, moveLabel
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const categoryClass = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.Work;

  const handleSaveTitle = () => {
    if (editValue.trim() && editValue !== task.title) {
      onEditTitle?.(task.id, editValue.trim());
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (showConfirm) {
      onDelete?.(task.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div
      className="group task-card-hover bg-gray-50 p-4 rounded-xl mb-3 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md animate-slide-in"
      style={{ borderLeftWidth: '4px', borderLeftColor: priorityStyle.border }}
    >
      {/* Tags Row */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${categoryClass}`}>
          {task.category}
        </span>
        {task.assignee && (
          <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <i className="fa-solid fa-user text-[0.6rem]"></i> {task.assignee}
          </span>
        )}

        {/* Priority Badge - Clickable */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase cursor-pointer hover:opacity-80 ${priorityStyle.bg} ${priorityStyle.text}`}
            title="Click to change priority"
          >
            {task.priority}
          </button>

          {showPriorityMenu && (
            <div className="absolute top-6 left-0 bg-white shadow-lg rounded-lg border z-10 py-1 min-w-[100px]">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => {
                    onChangePriority?.(task.id, p);
                    setShowPriorityMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-xs font-bold uppercase hover:bg-gray-100 ${
                    p === task.priority ? 'bg-gray-50' : ''
                  }`}
                  style={{ color: PRIORITY_COLORS[p].border }}
                >
                  {p === task.priority ? `✓ ${p}` : p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title - Click to Edit */}
      {editing ? (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') setEditing(false);
            }}
            onBlur={handleSaveTitle}
            autoFocus
            className="flex-1 px-2 py-1 border-2 border-indigo-400 rounded-lg text-sm font-bold focus:outline-none"
          />
          <button
            onClick={handleSaveTitle}
            className="px-2 py-1 bg-indigo-500 text-white rounded-lg text-xs font-bold"
          >
            ✓
          </button>
        </div>
      ) : (
        <h4
          onClick={() => { setEditValue(task.title); setEditing(true); }}
          className="font-bold text-gray-900 text-sm leading-snug mb-1.5 cursor-pointer hover:text-indigo-700 transition-colors"
          title="Click to edit title"
        >
          {task.title}
        </h4>
      )}

      {/* Original Text */}
      <p className="text-xs text-gray-500 italic mb-3 leading-relaxed break-words">
        "{task.original_text}"
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>
          <i className="fa-regular fa-calendar mr-1"></i>
          {formatDate(task.due_date)}
        </span>
      </div>

      {/* Action Buttons - Show on Hover */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move Button */}
        {onMove && (
          <button
            onClick={() => onMove(task.id)}
            className="flex-1 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
          >
            <i className="fa-solid fa-arrow-right-arrow-left text-[0.6rem]"></i>
            {moveLabel || 'Move'}
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              showConfirm
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <i className="fa-solid fa-trash text-[0.6rem]"></i>
            {showConfirm ? 'Confirm?' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};