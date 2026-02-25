import React, { useEffect, useRef } from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, isDark }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'Enter'], action: 'Extract tasks from text' },
    { keys: ['Ctrl', 'D'], action: 'Toggle dark/light mode' },
    { keys: ['Ctrl', 'K'], action: 'Focus search bar' },
    { keys: ['Ctrl', 'Z'], action: 'Undo last action' },
    { keys: ['?'], action: 'Show this shortcuts panel' },
    { keys: ['Esc'], action: 'Close modals / Clear search' },
  ];

  const taskShortcuts = [
    { icon: '🖱️', action: 'Click title → Edit inline' },
    { icon: '🏷️', action: 'Click priority badge → Change priority' },
    { icon: '📅', action: 'Click date → Open date picker' },
    { icon: '🔀', action: 'Drag task → Move between columns' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={modalRef}
        className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-in ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <i className="fa-regular fa-keyboard text-indigo-500"></i>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-6">
          <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Global Shortcuts
          </p>
          <div className="space-y-2">
            {shortcuts.map((s, i) => (
              <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {s.action}
                </span>
                <div className="flex gap-1">
                  {s.keys.map((key, j) => (
                    <React.Fragment key={j}>
                      <kbd className={`px-2 py-1 rounded text-xs font-bold border ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-slate-200'
                          : 'bg-white border-slate-300 text-slate-700 shadow-sm'
                      }`}>
                        {key}
                      </kbd>
                      {j < s.keys.length - 1 && (
                        <span className={`text-xs self-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Interactions */}
        <div>
          <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Task Interactions
          </p>
          <div className="space-y-2">
            {taskShortcuts.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                isDark ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <span className="text-lg">{s.icon}</span>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {s.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t text-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Press <kbd className={`px-1.5 py-0.5 rounded border text-[0.65rem] mx-1 ${
              isDark ? 'bg-slate-600 border-slate-500' : 'bg-slate-100 border-slate-200'
            }`}>?</kbd> anytime to show this panel
          </p>
        </div>
      </div>
    </div>
  );
};