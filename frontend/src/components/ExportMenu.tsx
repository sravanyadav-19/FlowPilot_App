import React, { useState, useRef, useEffect } from 'react';

interface ExportMenuProps {
  onExportJSON: () => void;
  onExportCSV: () => void;
  onCopyClipboard: () => void;
  taskCount: number;
  isDark: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportJSON, onExportCSV, onCopyClipboard, taskCount, isDark,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (taskCount === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
          isDark
            ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
      >
        <i className="fa-solid fa-download"></i> Export
      </button>

      {open && (
        <div className={`absolute right-0 top-11 rounded-xl shadow-xl border z-20 py-2 min-w-[180px] animate-slide-in ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => { onCopyClipboard(); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 ${
              isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="fa-regular fa-clipboard w-4"></i> Copy to Clipboard
          </button>

          <button
            onClick={() => { onExportJSON(); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 ${
              isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-code w-4"></i> Download JSON
          </button>

          <button
            onClick={() => { onExportCSV(); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 ${
              isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-file-csv w-4"></i> Download CSV
          </button>

          <div className={`mx-3 my-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}></div>

          <p className={`px-4 py-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {taskCount} task(s) will be exported
          </p>
        </div>
      )}
    </div>
  );
};