export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const PRIORITY_COLORS: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800'
};
