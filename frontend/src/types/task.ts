export interface Task {
  id: string;
  title: string;
  original_text: string;
  due_date?: string | null;
  assignee?: string | null;
  priority: 'high' | 'medium' | 'low';
  category: 'Work' | 'Personal' | 'Meeting';
  recurrence?: string | null;
  is_clarified: boolean;
  is_sarcastic: boolean;
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

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: 'bg-red-50',    text: 'text-red-700',    border: '#ef4444' },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: '#f59e0b' },
  low:    { bg: 'bg-green-50',  text: 'text-green-700',  border: '#10b981' },
};

export const CATEGORY_STYLES: Record<string, string> = {
  Work:     'bg-blue-100 text-blue-800',
  Personal: 'bg-pink-100 text-pink-800',
  Meeting:  'bg-emerald-100 text-emerald-800',
};