import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { BackendTask, FrontendTask } from '../types/task';

export const useTaskExtractor = () => {
  const [tasks, setTasks] = useState<FrontendTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractTasks = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return false;
    }

    // ✅ FIXED: Fallback to production URL if env var missing
    const apiUrl = import.meta.env.VITE_API_URL || 'https://flowpilot-app.onrender.com/api/process';
    
    console.log('🔗 API URL:', apiUrl); // Debug log

    setLoading(true);
    setTasks([]);
    setError('');

    try {
      const response = await axios.post<{ 
        tasks: BackendTask[]; 
        message?: string; 
        count?: number 
      }>(
        apiUrl,
        { text },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000  // 30 second timeout (increased for Render free tier)
        }
      );

      // Transform backend tasks to frontend format
      const transformedTasks: FrontendTask[] = (response.data.tasks || []).map(task => ({
        id: task.id,
        title: task.title || task.original_text.slice(0, 50),
        priority: (task.priority as 'high' | 'medium' | 'low') || 'low',
        category: task.category || 'Personal'
      }));

      setTasks(transformedTasks);
      
      // Show backend message if no tasks found
      if (transformedTasks.length === 0 && response.data.message) {
        setError(response.data.message);
      } else {
        setError('');
      }
      
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      
      let errorMsg = 'Failed to extract tasks. Please try again.';
      
      if (axiosError.code === 'ECONNABORTED') {
        errorMsg = '⏱️ Request timeout. The server might be waking up (free tier). Please wait 30 seconds and try again.';
      } else if (axiosError.response?.status === 413) {
        errorMsg = '📏 Text too long. Please keep it under 10,000 characters.';
      } else if (axiosError.response?.status === 400) {
        errorMsg = axiosError.response.data?.detail || 'Invalid input. Please check your text.';
      } else if (axiosError.response?.status === 500) {
        errorMsg = '🔧 Server error. Our team has been notified. Please try again in a few minutes.';
      } else if (axiosError.message.includes('Network Error')) {
        errorMsg = '🌐 Network error. Check your internet connection or try again later.';
      }
      
      setError(errorMsg);
      console.error('Task extraction error:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTasks = useCallback(() => {
    setTasks([]);
    setError('');
  }, []);

  return { tasks, loading, error, extractTasks, clearTasks };
};