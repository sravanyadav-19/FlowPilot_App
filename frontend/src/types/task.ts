export interface BackendTask {
  id: string;
  title: string;
  original_text: string;
  priority?: string;
  category?: string;
  due_date?: string;
}

export interface FrontendTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const PRIORITY_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-blue-100 text-blue-800 border-blue-200',
  Personal: 'bg-purple-100 text-purple-800 border-purple-200',
  Meeting: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};