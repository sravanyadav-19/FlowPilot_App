// ============================================================================
// FILE: frontend/src/hooks/useTemplates.ts
// Day 8: Template management hook
// ============================================================================

import { useCallback } from 'react';
import { Task, TaskTemplate } from '../types/task';
import { TASK_TEMPLATES } from '../data/templates';
import { v4 as uuidv4 } from 'uuid';

// Simple UUID generator if uuid package is not installed
const generateId = (): string => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  );
};

export const useTemplates = () => {
  const templates = TASK_TEMPLATES;

  const createTasksFromTemplate = useCallback((template: TaskTemplate): Task[] => {
    const now = Date.now();
    
    return template.tasks.map((taskData, index) => ({
      ...taskData,
      id: generateId(),
      createdAt: now + index, // Slight offset to maintain order
      completedAt: null,
    }));
  }, []);

  const getTemplateById = useCallback((id: string): TaskTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  return {
    templates,
    createTasksFromTemplate,
    getTemplateById,
  };
};