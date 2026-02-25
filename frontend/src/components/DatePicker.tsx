import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  currentDate?: string | null;
  onDateChange: (newDate: string | null) => void;
  onClose: () => void;
  isDark: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  currentDate, onDateChange, onClose, isDark,
}) => {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse current date
  useEffect(() => {
    if (currentDate) {
      if (currentDate.includes('T')) {
        const [date, time] = currentDate.split('T');
        setDateValue(date);
        setTimeValue(time.slice(0, 5)); // HH:MM
      } else {
        setDateValue(currentDate);
        setTimeValue('');
      }
    } else {
      setDateValue('');
      setTimeValue('');
    }
  }, [currentDate]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!dateValue) {
      onDateChange(null);
    } else if (timeValue) {
      onDateChange(`${dateValue}T${timeValue}:00`);
    } else {
      onDateChange(dateValue);
    }
    onClose();
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const now = new Date();
    let target: Date;

    switch (type) {
      case 'today':
        target = now;
        break;
      case 'tomorrow':
        target = new Date(now);
        target.setDate(target.getDate() + 1);
        break;
      case 'nextWeek':
        target = new Date(now);
        target.setDate(target.getDate() + 7);
        break;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    setDateValue(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`);
  };

  const handleClearDate = () => {
    setDateValue('');
    setTimeValue('');
    onDateChange(null);
    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className={`absolute z-30 top-full mt-2 left-0 rounded-xl shadow-2xl border p-4 min-w-[280px] animate-slide-in ${
        isDark
          ? 'bg-slate-800 border-slate-600'
          : 'bg-white border-slate-200'
      }`}
      onClick={e => e.stopPropagation()}
    >
      <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Set Due Date
      </p>

      {/* Quick Date Buttons */}
      <div className="flex gap-2 mb-3">
        {[
          { label: 'Today', type: 'today' as const },
          { label: 'Tomorrow', type: 'tomorrow' as const },
          { label: 'Next Week', type: 'nextWeek' as const },
        ].map(btn => (
          <button
            key={btn.type}
            onClick={() => handleQuickDate(btn.type)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Date Input */}
      <div className="mb-3">
        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Date
        </label>
        <input
          type="date"
          value={dateValue}
          onChange={e => setDateValue(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm border-2 transition-colors focus:outline-none focus:border-indigo-500 ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        />
      </div>

      {/* Time Input */}
      <div className="mb-4">
        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Time (optional)
        </label>
        <input
          type="time"
          value={timeValue}
          onChange={e => setTimeValue(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm border-2 transition-colors focus:outline-none focus:border-indigo-500 ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!dateValue}
          className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i className="fa-solid fa-check mr-1"></i> Save
        </button>
        <button
          onClick={handleClearDate}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
            isDark
              ? 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
          }`}
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
            isDark
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};