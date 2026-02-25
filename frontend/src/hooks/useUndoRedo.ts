import { useState, useCallback } from 'react';
import { Task } from '../types/task';

interface UndoAction {
  type: 'delete' | 'move' | 'edit' | 'priority' | 'date';
  taskId: string;
  previousState: Task;
  description: string;
  timestamp: number;
}

export const useUndoRedo = () => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  const pushUndo = useCallback((action: Omit<UndoAction, 'timestamp'>) => {
    setUndoStack(prev => {
      const newStack = [...prev, { ...action, timestamp: Date.now() }];
      // Keep only last 20 actions
      if (newStack.length > 20) {
        return newStack.slice(-20);
      }
      return newStack;
    });
  }, []);

  const popUndo = useCallback((): UndoAction | null => {
    let action: UndoAction | null = null;

    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      action = newStack.pop() || null;
      return newStack;
    });

    return action;
  }, []);

  const canUndo = undoStack.length > 0;
  const lastAction = undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;

  const clearUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    pushUndo,
    popUndo,
    canUndo,
    lastAction,
    undoCount: undoStack.length,
    clearUndo,
  };
};