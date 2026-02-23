import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Task, Clarification, ExtractionResponse, AppConfig } from '../types/task';

const API_BASE = process.env.REACT_APP_API_URL || 'https://flowpilot-app.onrender.com';

export const useTaskExtractor = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<AppConfig>({
    google_client_id: '',
    llm_available: false,
    debug: false,
  });

  const loadConfig = useCallback(async () => {
    try {
      const res = await axios.get<AppConfig>(`${API_BASE}/api/config`);
      setConfig(res.data);
      console.log('[Config]', res.data);
    } catch (e) {
      console.warn('[Config] Failed to load:', e);
    }
  }, []);

  const extractTasks = useCallback(async (text: string, isRerun = false): Promise<boolean> => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('text', text);

      const response = await axios.post<ExtractionResponse>(
        `${API_BASE}/api/process`,
        formData,
        { timeout: 30000 }
      );

      const data = response.data;

      if (isRerun) {
        const clarifiedIds = new Set(clarifications.map(c => c.id));
        setTasks(prev => {
          const remaining = prev.filter(t => !clarifiedIds.has(t.id));
          return [...remaining, ...data.tasks];
        });
      } else {
        setTasks(data.tasks);
      }

      setClarifications(data.clarifications || []);
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      let msg = 'Failed to extract tasks. Please try again.';

      if (axiosErr.code === 'ECONNABORTED') {
        msg = '⏱️ Timeout. Server may be waking up (free tier). Try again in 30s.';
      } else if (axiosErr.response?.status === 413) {
        msg = '📏 Text too long. Maximum 10,000 characters.';
      } else if (axiosErr.response?.status === 400) {
        msg = axiosErr.response.data?.detail || 'Invalid input.';
      } else if (axiosErr.message?.includes('Network Error')) {
        msg = '🌐 Network error. Check connection or try again.';
      }

      setError(msg);
      console.error('Extraction error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [clarifications]);

  const clearAll = useCallback(() => {
    setTasks([]);
    setClarifications([]);
    setError('');
  }, []);

  const removeSyncedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.is_clarified));
  }, []);

  return {
    tasks,
    clarifications,
    loading,
    error,
    config,
    loadConfig,
    extractTasks,
    clearAll,
    removeSyncedTasks,
  };
};