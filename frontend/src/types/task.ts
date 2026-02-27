// ============================================================================
// FILE: frontend/src/types/task.ts
// Day 8: Enhanced with recurrence, completion, and template types
// ============================================================================

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  original_text: string;
  due_date?: string | null;
  assignee?: string | null;
  priority: 'high' | 'medium' | 'low';
  category: 'Work' | 'Personal' | 'Meeting';
  recurrence: RecurrenceType;
  is_clarified: boolean;
  is_sarcastic: boolean;
  // Day 8: New fields
  completedAt?: number | null;      // Timestamp when completed
  createdAt: number;                 // Timestamp when created
  streak?: number;                   // For recurring tasks
}

export interface TaskTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  tasks: Omit<Task, 'id' | 'createdAt' | 'completedAt'>[];
  color: string;
}

export interface Clarification {
  id: string;
  task_title: string;
  question: string;
}

export interface ExtractionResponse {
  tasks: Task[];
  clarifications: Clarification[];
}

export interface AppConfig {
  google_client_id: string;
  llm_available: boolean;
  debug: boolean;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completedToday: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  byPriority: { high: number; medium: number; low: number };
  byCategory: { Work: number; Personal: number; Meeting: number };
  weeklyData: { day: string; completed: number; created: number }[];
  averageCompletionTime: number; // in hours
}

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  high:   { bg: 'bg-red-50',    text: 'text-red-700',    border: '#ef4444', darkBg: 'bg-red-900/30',    darkText: 'text-red-300' },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: '#f59e0b', darkBg: 'bg-amber-900/30',  darkText: 'text-amber-300' },
  low:    { bg: 'bg-green-50',  text: 'text-green-700',  border: '#10b981', darkBg: 'bg-green-900/30',  darkText: 'text-green-300' },
};

export const CATEGORY_STYLES: Record<string, string> = {
  Work:     'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Personal: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  Meeting:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export const RECURRENCE_STYLES: Record<RecurrenceType, { icon: string; label: string; color: string }> = {
  none:    { icon: '', label: '', color: '' },
  daily:   { icon: 'fa-rotate', label: 'Daily', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  weekly:  { icon: 'fa-calendar-week', label: 'Weekly', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  monthly: { icon: 'fa-calendar', label: 'Monthly', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
};