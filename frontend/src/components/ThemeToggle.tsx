import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 flex items-center ${
        isDark ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-[0.6rem]">☀️</span>
      <span className="absolute right-1.5 text-[0.6rem]">🌙</span>

      {/* Thumb */}
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isDark ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
};