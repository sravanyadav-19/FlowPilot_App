import { useState, useCallback } from 'react';

interface DragDropState {
  draggedTaskId: string | null;
  dragOverColumn: string | null;
}

export const useDragDrop = (onMoveTask: (taskId: string, targetColumn: 'ready' | 'review') => void) => {
  const [dragState, setDragState] = useState<DragDropState>({
    draggedTaskId: null,
    dragOverColumn: null,
  });

  const handleDragStart = useCallback((e: any, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDragState(prev => ({ ...prev, draggedTaskId: taskId }));
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.4';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: any) => {
    if (e.target) e.target.style.opacity = '1';
    setDragState({ draggedTaskId: null, dragOverColumn: null });
  }, []);

  const handleDragOver = useCallback((e: any, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({ ...prev, dragOverColumn: column }));
  }, []);

  const handleDragLeave = useCallback((e: any) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setDragState(prev => ({ ...prev, dragOverColumn: null }));
    }
  }, []);

  const handleDrop = useCallback((e: any, targetColumn: 'ready' | 'review') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetColumn);
    }
    setDragState({ draggedTaskId: null, dragOverColumn: null });
  }, [onMoveTask]);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};