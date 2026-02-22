import React from 'react';
import { FrontendTask, PRIORITY_COLORS, CATEGORY_COLORS } from '../types/task';

interface TaskCardProps {
  task: FrontendTask;
  variant?: 'calendar' | 'review';
  onAction?: (task: FrontendTask, action: 'confirm' | 'delete' | 'schedule') => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = 'review',
  onAction
}) => {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const categoryColor = CATEGORY_COLORS[task.category] || 'bg-gray-100 text-gray-800 border-gray-200';

  const variantClasses = {
    calendar: 'from-green-50 to-emerald-50 border-2 border-green-100 hover:border-green-200 hover:shadow-lg',
    review: 'from-gray-50 to-indigo-50 border border-gray-200 hover:border-indigo-300 hover:shadow-md'
  };

  return (
    <article className={`group bg-gradient-to-r ${variantClasses[variant]} rounded-2xl p-5 transition-all cursor-pointer`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-indigo-900 mb-3">
            {task.title}
          </h4>
          <div className="flex gap-2 flex-wrap">
            <span className={`${priorityColor} px-3 py-1 rounded-full text-xs font-bold border`}>
              {task.priority.toUpperCase()}
            </span>
            <span className={`${categoryColor} px-3 py-1 rounded-full text-xs font-bold border`}>
              {task.category}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {variant === 'calendar' && (
            <button 
              onClick={() => onAction?.(task, 'schedule')}
              className="p-2 text-green-600 hover:bg-green-200 rounded-xl transition-all"
              title="Add to Calendar"
            >
              ➕
            </button>
          )}
          {variant === 'review' && (
            <>
              <button 
                onClick={() => onAction?.(task, 'confirm')}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                title="Confirm Task"
              >
                ✓
              </button>
              <button 
                onClick={() => onAction?.(task, 'delete')}
                className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                title="Delete Task"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};