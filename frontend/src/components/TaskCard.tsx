import React from 'react';
import { Task } from '../types/task';
import { PRIORITY_COLORS } from '../types/task';

interface TaskCardProps {
  task: Task;
  variant?: 'calendar' | 'review';
  onAction?: (task: Task, action: 'confirm' | 'delete' | 'schedule') => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = 'review',
  onAction
}) => {
  const variantClasses = {
    calendar: 'from-green-50 to-emerald-50 border-2 border-green-100 hover:border-green-200',
    review: 'from-gray-50 to-indigo-50 border border-gray-200 hover:border-indigo-300'
  };

  const getPriorityColor = (priority: Task['priority']) => PRIORITY_COLORS[priority];

  return (
    <article className={`group bg-gradient-to-r ${variantClasses[variant]} rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-indigo-900">
            {task.title}
          </h4>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className={`${getPriorityColor(task.priority)} px-3 py-1 rounded-full text-xs font-bold`}>
              {task.priority.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold whitespace-nowrap">
              {task.category}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {variant === 'calendar' && (
            <button 
              onClick={() => onAction?.(task, 'schedule')}
              className="p-2 text-green-600 hover:bg-green-200 rounded-xl transition-all ml-2"
            >
              ➕
            </button>
          )}
          {variant === 'review' && (
            <>
              <button 
                onClick={() => onAction?.(task, 'confirm')}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
              >
                ✓
              </button>
              <button 
                onClick={() => onAction?.(task, 'delete')}
                className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all"
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
