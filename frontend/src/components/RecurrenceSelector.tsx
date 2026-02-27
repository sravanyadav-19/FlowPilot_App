// ============================================================================
// FILE: frontend/src/components/RecurrenceSelector.tsx
// Day 8: Dropdown to select recurrence type
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { RecurrenceType, RECURRENCE_STYLES } from '../types/task';

interface RecurrenceSelectorProps {
  currentRecurrence: RecurrenceType;
  onRecurrenceChange: (recurrence: RecurrenceType) => void;
  onClose: () => void;
  isDark: boolean;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  currentRecurrence,
  onRecurrenceChange,
  onClose,
  isDark,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const options: { value: RecurrenceType; label: string; icon: string; description: string }[] = [
    { value: 'none', label: 'No Repeat', icon: 'fa-ban', description: 'One-time task' },
    { value: 'daily', label: 'Daily', icon: 'fa-rotate', description: 'Repeats every day' },
    { value: 'weekly', label: 'Weekly', icon: 'fa-calendar-week', description: 'Repeats every week' },
    { value: 'monthly', label: 'Monthly', icon: 'fa-calendar', description: 'Repeats every month' },
  ];

  return (
    <div
      ref={selectorRef}
      className={`absolute z-30 top-full mt-2 left-0 rounded-xl shadow-2xl border p-2 min-w-[200px] animate-slide-in ${
        isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
      }`}
      onClick={e => e.stopPropagation()}
    >
      <p className={`text-xs font-bold uppercase mb-2 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Repeat
      </p>
      
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => {
            onRecurrenceChange(option.value);
            onClose();
          }}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
            currentRecurrence === option.value
              ? isDark
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-800'
              : isDark
                ? 'hover:bg-slate-700 text-slate-200'
                : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <i className={`fa-solid ${option.icon} w-4 text-center`}></i>
          <div className="flex-1">
            <p className="text-sm font-semibold">{option.label}</p>
            <p className={`text-[0.65rem] ${
              currentRecurrence === option.value
                ? 'opacity-80'
                : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {option.description}
            </p>
          </div>
          {currentRecurrence === option.value && (
            <i className="fa-solid fa-check text-xs"></i>
          )}
        </button>
      ))}
    </div>
  );
};