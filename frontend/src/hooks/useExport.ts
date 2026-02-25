import { useCallback } from 'react';
import { Task } from '../types/task';

export const useExport = () => {

  const exportJSON = useCallback((tasks: Task[], filename = 'flowpilot-tasks') => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportCSV = useCallback((tasks: Task[], filename = 'flowpilot-tasks') => {
    const headers = ['Title', 'Priority', 'Category', 'Due Date', 'Assignee', 'Status', 'Original Text'];
    const rows = tasks.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.category,
      t.due_date || 'No Date',
      t.assignee || 'Unassigned',
      t.is_clarified ? 'Ready' : 'Needs Review',
      `"${t.original_text.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async (tasks: Task[]): Promise<boolean> => {
    const text = tasks.map((t, i) =>
      `${i + 1}. ${t.title}\n   Priority: ${t.priority.toUpperCase()} | Category: ${t.category} | Due: ${t.due_date || 'No Date'}${t.assignee ? ` | Assignee: ${t.assignee}` : ''}`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }, []);

  return { exportJSON, exportCSV, copyToClipboard };
};