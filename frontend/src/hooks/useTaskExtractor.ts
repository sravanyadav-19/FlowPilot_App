import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Task } from '../types/task';

export const useTaskExtractor = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractTasks = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return false;
    }

    setLoading(true);
    setTasks([]);
    setError('');

    try {
      const response = await axios.post<{ tasks: Task[] }>(
        'https://flowpilot-app.onrender.com/api/process',
        { text },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 
        }
      );
      
      setTasks(response.data.tasks || []);
      setError('');
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMsg = axiosError.response?.data?.error || 
                      axiosError.message || 
                      'Failed to extract tasks. Try again.';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTasks = useCallback(() => {
    setTasks([]);
    setError('');
  }, []);

  return {
    tasks,
    loading,
    error,
    extractTasks,
    clearTasks
  };
};
