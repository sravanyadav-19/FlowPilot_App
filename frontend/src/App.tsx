import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTaskExtractor } from './hooks/useTaskExtractor';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TaskCard } from './components/TaskCard';
import { EmptyState } from './components/EmptyState';
import { Task } from './types/task';
import './index.css';

function App() {
  // ======================== STATE ========================
  const [text, setText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'info' | 'success' | 'error' | 'warning' });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<number, string>>({});
  const [savedTasks, setSavedTasks, clearSaved] = useLocalStorage<Task[]>('flowpilot-tasks', []);
  const toastTimeout = useRef<NodeJS.Timeout>();

  const {
    tasks, clarifications, loading, error, config,
    loadConfig, extractTasks, clearAll, removeSyncedTasks,
  } = useTaskExtractor();

  // Merge extracted tasks with saved tasks
  const allTasks = tasks.length > 0 ? tasks : savedTasks;
  const readyTasks = allTasks.filter(t => t.is_clarified);
  const reviewTasks = allTasks.filter(t => !t.is_clarified);

  // ======================== EFFECTS ========================
  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      setSavedTasks(tasks);
    }
  }, [tasks, setSavedTasks]);

  // ======================== TOAST ========================
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ show: true, message, type });
    toastTimeout.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  }, []);

  // ======================== TASK ACTIONS ========================
  const handleDeleteTask = useCallback((id: string) => {
    setSavedTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task deleted', 'warning');
  }, [setSavedTasks, showToast]);

  const handleMoveTask = useCallback((id: string) => {
    setSavedTasks(prev => prev.map(t =>
      t.id === id ? { ...t, is_clarified: !t.is_clarified } : t
    ));
    showToast('Task moved', 'success');
  }, [setSavedTasks, showToast]);

  const handleEditTitle = useCallback((id: string, newTitle: string) => {
    setSavedTasks(prev => prev.map(t =>
      t.id === id ? { ...t, title: newTitle } : t
    ));
    showToast('Title updated', 'success');
  }, [setSavedTasks, showToast]);

  const handleChangePriority = useCallback((id: string, newPriority: 'high' | 'medium' | 'low') => {
    setSavedTasks(prev => prev.map(t =>
      t.id === id ? { ...t, priority: newPriority } : t
    ));
    showToast(`Priority → ${newPriority.toUpperCase()}`, 'info');
  }, [setSavedTasks, showToast]);

  const handleClearAll = () => {
    setText('');
    clearAll();
    clearSaved();
    setClarifyAnswers({});
    showToast('All data cleared', 'warning');
  };

  // ======================== EXTRACT ========================
  const handleExtract = async () => {
    const success = await extractTasks(text);
    if (success) {
      showToast('Tasks extracted! Check the board below.', 'success');
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && text.trim()) {
      handleExtract();
    }
  };

  // ======================== CLARIFICATION ========================
  const handleClarificationUpdate = async () => {
    let combined = '';
    let count = 0;
    clarifications.forEach((c, i) => {
      const answer = clarifyAnswers[i]?.trim();
      if (answer) {
        const original = allTasks.find(t => t.id === c.id);
        combined += `${original?.original_text || c.task_title} due ${answer}.\n`;
        count++;
      }
    });
    if (count === 0) { showToast('Answer at least one question', 'warning'); return; }
    setClarifyAnswers({});
    const success = await extractTasks(combined, true);
    if (success) showToast(`${count} task(s) updated!`, 'success');
  };

  // ======================== GOOGLE AUTH ========================
  const handleGoogleAuth = () => {
    const google = (window as any).google;
    if (!google?.accounts) { showToast('Google API not loaded. Refresh page.', 'error'); return; }
    if (!config.google_client_id) { showToast('Google not configured in backend.', 'error'); return; }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: config.google_client_id,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (res: any) => {
        if (res.access_token) { setAccessToken(res.access_token); showToast('Google Connected!', 'success'); }
      },
    });
    client.requestAccessToken();
  };

  // ======================== CALENDAR SYNC ========================
  const handleCalendarSync = async () => {
    if (!accessToken) { showToast('Sign in with Google first', 'warning'); return; }
    const toSync = allTasks.filter(t => t.is_clarified && t.due_date);
    if (!toSync.length) { showToast('No ready tasks to sync', 'warning'); return; }

    setSyncing(true);
    let ok = 0;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    for (const task of toSync) {
      const event: any = {
        summary: task.title,
        description: `Original: "${task.original_text}"\nPriority: ${task.priority.toUpperCase()}\n\nCreated by FlowPilot AI`,
      };
      if (task.due_date!.includes('T')) {
        const start = new Date(task.due_date!);
        const end = new Date(start.getTime() + 3600000);
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        event.start = { dateTime: fmt(start), timeZone: tz };
        event.end = { dateTime: fmt(end), timeZone: tz };
      } else {
        const [y, m, d] = task.due_date!.split('-').map(Number);
        const next = new Date(y, m - 1, d); next.setDate(next.getDate() + 1);
        event.start = { date: task.due_date };
        event.end = { date: next.toISOString().split('T')[0] };
      }
      try {
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
        if (res.ok) ok++;
        else if (res.status === 401) { setAccessToken(null); showToast('Session expired. Sign in again.', 'error'); break; }
      } catch (e) { console.error(e); }
    }

    setSyncing(false);
    if (ok > 0) {
      showToast(`${ok} event(s) synced to Google Calendar!`, 'success');
      setSavedTasks(prev => prev.filter(t => !t.is_clarified));
      removeSyncedTasks();
    } else {
      showToast('Sync failed. Check console.', 'error');
    }
  };

  // ======================== TOAST COLORS ========================
  const toastColors = {
    info: 'from-slate-800 to-slate-900',
    success: 'from-emerald-600 to-emerald-800',
    error: 'from-red-600 to-red-800',
    warning: 'from-amber-600 to-amber-800',
  };

  // ======================== RENDER ========================
  return (
    <div className="min-h-screen bg-slate-100 font-['Inter']">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ===== HEADER ===== */}
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl grid place-items-center text-white">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">FlowPilot</h1>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded text-white tracking-wider ${
                config.llm_available ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-amber-500'
              }`}
            >
              {config.llm_available ? 'AI' : 'LOCAL'}
            </span>
          </div>

          <div className="flex gap-3 items-center">
            {/* Clear All */}
            {allTasks.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
              >
                <i className="fa-solid fa-trash-can mr-1"></i> Clear All
              </button>
            )}

            {/* Google Auth */}
            <button
              onClick={handleGoogleAuth}
              disabled={!!accessToken}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all border ${
                accessToken
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <i className={accessToken ? 'fa-solid fa-check-circle' : 'fa-brands fa-google'}></i>
              {accessToken ? 'Connected' : 'Sign in with Google'}
            </button>
          </div>
        </header>

        {/* ===== STATS BAR ===== */}
        {allTasks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-in">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{allTasks.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Total Tasks</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
              <p className="text-2xl font-extrabold text-emerald-600">{readyTasks.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Ready</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
              <p className="text-2xl font-extrabold text-amber-600">{reviewTasks.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Needs Review</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 text-center">
              <p className="text-2xl font-extrabold text-red-600">
                {allTasks.filter(t => t.priority === 'high').length}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">High Priority</p>
            </div>
          </div>
        )}

        {/* ===== INPUT PANEL ===== */}
        <section className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-brain text-indigo-500"></i>
            AI Workflow Engine
          </h3>

          <textarea
            value={text}
            onChange={e => { setText(e.target.value); if (error) clearAll(); }}
            onKeyDown={handleKeyDown}
            placeholder={`Examples:\n• "Email boss tomorrow at 2pm, gym 6pm, call Sarah"\n• "Buy groceries (milk, eggs, bread) + finish report by Friday"\n• "Urgent: submit proposal ASAP and schedule team meeting"\n\nSeparate tasks with commas, "and", "+", or new lines`}
            className="w-full h-32 p-4 border-2 border-slate-200 rounded-xl resize-y text-sm transition-colors focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          />

          <div className="flex justify-between items-center mt-2 mb-4">
            <span className={`text-xs font-medium ${
              text.length > 9000 ? 'text-red-500' : text.length > 7500 ? 'text-amber-500' : 'text-slate-400'
            }`}>
              {text.length.toLocaleString()} / 10,000
            </span>
            {allTasks.length > 0 && (
              <span className="text-xs text-emerald-600 font-medium">
                <i className="fa-solid fa-database mr-1"></i> {allTasks.length} tasks saved locally
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!text.trim() || loading}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Analyzing...</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Analyze & Extract</>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-2">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[0.65rem]">Ctrl</kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[0.65rem]">Enter</kbd>
            {' to analyze'}
          </p>
        </section>

        {/* ===== CLARIFICATION ZONE ===== */}
        {clarifications.length > 0 && (
          <section className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-6 rounded-2xl mb-8 animate-slide-in">
            <h4 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-robot"></i> Missing Details
            </h4>
            <p className="text-sm text-orange-700 mb-4">Some tasks need a due date:</p>
            {clarifications.map((c, i) => (
              <div key={c.id} className="flex gap-3 mb-3 items-start">
                <span className="font-bold text-orange-700 min-w-[24px] pt-3">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-xs text-orange-800 font-medium mb-1">{c.task_title}</p>
                  <input
                    type="text"
                    value={clarifyAnswers[i] || ''}
                    onChange={e => setClarifyAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    placeholder={c.question}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    onKeyDown={e => { if (e.key === 'Enter') handleClarificationUpdate(); }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleClarificationUpdate}
              disabled={loading}
              className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i> Update Tasks
            </button>
          </section>
        )}

        {/* ===== KANBAN BOARD ===== */}
        {allTasks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
            {/* Ready for Calendar */}
            <section className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex justify-between items-center pb-4 border-b-[3px] border-emerald-400 mb-5">
                <span className="font-bold text-xs uppercase text-emerald-600 flex items-center gap-2">
                  <i className="fa-solid fa-rocket"></i> Ready for Calendar
                </span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 font-semibold">
                  {readyTasks.length}
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {readyTasks.length > 0 ? (
                  readyTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                      onEditTitle={handleEditTitle}
                      onChangePriority={handleChangePriority}
                      moveLabel="→ Review"
                    />
                  ))
                ) : (
                  <EmptyState type="ready" />
                )}
              </div>
              {accessToken && readyTasks.length > 0 && (
                <button
                  onClick={handleCalendarSync}
                  disabled={syncing}
                  className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {syncing ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Syncing...</>
                  ) : (
                    <><i className="fa-solid fa-cloud-arrow-up"></i> Push to Google Calendar</>
                  )}
                </button>
              )}
            </section>

            {/* Needs Review */}
            <section className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex justify-between items-center pb-4 border-b-[3px] border-amber-400 mb-5">
                <span className="font-bold text-xs uppercase text-amber-600 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i> Needs Review
                </span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 font-semibold">
                  {reviewTasks.length}
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {reviewTasks.length > 0 ? (
                  reviewTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                      onEditTitle={handleEditTitle}
                      onChangePriority={handleChangePriority}
                      moveLabel="→ Ready"
                    />
                  ))
                ) : (
                  <EmptyState type="review" />
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className="text-center py-8 mt-10 border-t border-slate-200 text-xs text-slate-400 space-x-3">
          <span>FlowPilot AI © {new Date().getFullYear()}</span>
          <a href={`${process.env.REACT_APP_API_URL || 'https://flowpilot-app.onrender.com'}/api/health`}
             className="text-indigo-500 hover:underline" target="_blank" rel="noreferrer">Status</a>
          <a href={`${process.env.REACT_APP_API_URL || 'https://flowpilot-app.onrender.com'}/docs`}
             className="text-indigo-500 hover:underline" target="_blank" rel="noreferrer">API Docs</a>
        </footer>
      </div>

      {/* ===== TOAST ===== */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r ${toastColors[toast.type]} text-white px-8 py-4 rounded-xl font-medium shadow-2xl z-50 transition-all duration-400 max-w-[90%] text-center text-sm ${
        toast.show ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-5'
      }`}>
        {toast.message}
      </div>
    </div>
  );
}

export default App;