// ============================================================================
// FILE: frontend/src/hooks/useCompletedTasks.ts
// Day 8: Manage completed tasks separately
// ============================================================================

import { useCallback } from 'react';
import { Task, RecurrenceType } from '../types/task';
import { useLocalStorage } from './useLocalStorage';

// Simple ID generator
const generateId = (): string => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  );
};

export const useCompletedTasks = () => {
  const [completedTasks, setCompletedTasks, clearCompleted] = useLocalStorage<Task[]>(
    'flowpilot-completed',
    []
  );

  const completeTask = useCallback((task: Task): Task | null => {
    const completedTask: Task = {
      ...task,
      completedAt: Date.now(),
    };

    // Add to completed list
    setCompletedTasks(prev => [completedTask, ...prev].slice(0, 100)); // Keep last 100

    // If recurring, return a new task for next occurrence
    if (task.recurrence !== 'none') {
      const nextDueDate = calculateNextDueDate(task.due_date, task.recurrence);
      const newTask: Task = {
        ...task,
        id: generateId(),
        due_date: nextDueDate,
        createdAt: Date.now(),
        completedAt: null,
        streak: (task.streak || 0) + 1,
      };
      return newTask;
    }

    return null;
  }, [setCompletedTasks]);

  const uncompleteTask = useCallback((taskId: string): Task | null => {
    let restoredTask: Task | null = null;

    setCompletedTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        restoredTask = { ...task, completedAt: null };
      }
      return prev.filter(t => t.id !== taskId);
    });

    return restoredTask;
  }, [setCompletedTasks]);

  const deleteCompletedTask = useCallback((taskId: string) => {
    setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
  }, [setCompletedTasks]);

  return {
    completedTasks,
    completeTask,
    uncompleteTask,
    deleteCompletedTask,
    clearCompleted,
  };
};

// Helper: Calculate next due date based on recurrence
function calculateNextDueDate(
  currentDue: string | null | undefined,
  recurrence: RecurrenceType
): string | null {
  if (!currentDue || recurrence === 'none') return null;

  const hasTime = currentDue.includes('T');
  let date: Date;

  if (hasTime) {
    date = new Date(currentDue);
  } else {
    const [y, m, d] = currentDue.split('-').map(Number);
    date = new Date(y, m - 1, d);
  }

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  if (hasTime) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  } else {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}