import React, { DragEvent } from 'react';

interface DragDropColumnProps {
  columnId: 'ready' | 'review';
  isDragOver: boolean;
  onDragOver: (e: DragEvent, column: string) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent, column: 'ready' | 'review') => void;
  isDark: boolean;
  children: React.ReactNode;
  header: React.ReactNode;
  footer?: React.ReactNode;
}

export const DragDropColumn: React.FC<DragDropColumnProps> = ({
  columnId, isDragOver, onDragOver, onDragLeave, onDrop,
  isDark, children, header, footer,
}) => {
  return (
    <section
      onDragOver={(e) => { e.preventDefault(); onDragOver(e as any, columnId); }}
      onDragLeave={(e) => onDragLeave(e as any)}
      onDrop={(e) => { e.preventDefault(); onDrop(e as any, columnId); }}
      className={`rounded-2xl shadow-md p-5 transition-all duration-200 ${
        isDark ? 'bg-slate-800' : 'bg-white'
      } ${
        isDragOver
          ? isDark
            ? 'ring-2 ring-indigo-400 bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
            : 'ring-2 ring-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/10'
          : ''
      }`}
    >
      {header}

      {isDragOver && (
        <div className={`border-2 border-dashed rounded-xl p-4 mb-3 text-center text-sm font-medium animate-pulse ${
          isDark
            ? 'border-indigo-400 text-indigo-300 bg-indigo-900/20'
            : 'border-indigo-400 text-indigo-600 bg-indigo-50'
        }`}>
          <i className="fa-solid fa-arrow-down mr-2"></i>
          Drop task here
        </div>
      )}

      <div className="max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
        {children}
      </div>

      {footer}
    </section>
  );
};