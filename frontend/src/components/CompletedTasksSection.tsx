// ============================================================================
// FILE: frontend/src/components/CompletedTasksSection.tsx
// Day 8: Section showing completed tasks with restore option
// ============================================================================

import React, { useState } from 'react';
import { Task, PRIORITY_COLORS, CATEGORY_STYLES, RECURRENCE_STYLES } from '../types/task';

interface CompletedTasksSectionProps {
  tasks: Task[];
  onUncomplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onClearAll: () => void;
  isDark: boolean;
}

export const CompletedTasksSection: React.FC<CompletedTasksSectionProps> = ({
  tasks,
  onUncomplete,
  onDelete,
  onClearAll,
  isDark,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (tasks.length === 0) return null;

  const formatCompletedTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`rounded-2xl shadow-md border overflow-hidden transition-all ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-4 flex justify-between items-center transition-colors ${
          isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
            <i className="fa-solid fa-check text-sm"></i>
          </div>
          <div className="text-left">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Completed Tasks
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎉</span>
          <i className={`fa-solid fa-chevron-down transition-transform ${
            expanded ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-500'}`}></i>
        </div>
      </button>

      {/* Completed Tasks List */}
      {expanded && (
        <div className={`border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          {/* Clear All Button */}
          <div className={`px-5 py-3 flex justify-end border-b ${
            isDark ? 'border-slate-700 bg-slate-700/30' : 'border-gray-100 bg-slate-50'
          }`}>
            <button
              onClick={onClearAll}
              className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-red-400 hover:bg-red-900/30'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <i className="fa-solid fa-trash-can"></i>
              Clear History
            </button>
          </div>

          {/* Tasks */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`px-5 py-4 border-b last:border-b-0 group ${
                  isDark ? 'border-slate-700 hover:bg-slate-700/30' : 'border-gray-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completed Checkmark */}
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-check text-white text-[0.6rem]"></i>
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium line-through ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {task.title}
                    </p>

                    {/* Tags */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-bold uppercase ${
                        CATEGORY_STYLES[task.category]
                      }`}>
                        {task.category}
                      </span>
                      {task.recurrence !== 'none' && (
                        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-bold uppercase ${
                          RECURRENCE_STYLES[task.recurrence].color
                        }`}>
                          <i className={`fa-solid ${RECURRENCE_STYLES[task.recurrence].icon} mr-1`}></i>
                          {RECURRENCE_STYLES[task.recurrence].label}
                        </span>
                      )}
                      <span className={`text-[0.6rem] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {task.completedAt ? formatCompletedTime(task.completedAt) : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onUncomplete(task.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isDark
                          ? 'text-amber-400 hover:bg-amber-900/30'
                          : 'text-amber-600 hover:bg-amber-50'
                      }`}
                      title="Restore task"
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isDark
                          ? 'text-red-400 hover:bg-red-900/30'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete permanently"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};