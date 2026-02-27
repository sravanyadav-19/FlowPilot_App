// ============================================================================
// FILE: frontend/src/components/RecurrenceBadge.tsx
// Day 8: Visual badge for recurring tasks
// ============================================================================

import React from 'react';
import { RecurrenceType, RECURRENCE_STYLES } from '../types/task';

interface RecurrenceBadgeProps {
  recurrence: RecurrenceType;
  streak?: number;
  size?: 'sm' | 'md';
}

export const RecurrenceBadge: React.FC<RecurrenceBadgeProps> = ({
  recurrence,
  streak = 0,
  size = 'sm',
}) => {
  if (recurrence === 'none') return null;

  const style = RECURRENCE_STYLES[recurrence];
  const sizeClasses = size === 'sm' 
    ? 'text-[0.65rem] px-1.5 py-0.5' 
    : 'text-xs px-2 py-1';

  return (
    <span className={`${sizeClasses} rounded font-bold uppercase flex items-center gap-1 ${style.color}`}>
      <i className={`fa-solid ${style.icon} text-[0.5rem]`}></i>
      {style.label}
      {streak > 0 && (
        <span className="ml-0.5 text-[0.6rem] opacity-80">
          🔥{streak}
        </span>
      )}
    </span>
  );
};