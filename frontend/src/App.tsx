import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTaskExtractor } from './hooks/useTaskExtractor';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useExport } from './hooks/useExport';
import { TaskCard } from './components/TaskCard';
import { EmptyState } from './components/EmptyState';
import { ThemeToggle } from './components/ThemeToggle';
import { FilterBar } from './components/FilterBar';
import { ExportMenu } from './components/ExportMenu';
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

  // Day 6: New State
  const { isDark, toggleTheme } = useTheme();
  const { exportJSON, exportCSV, copyToClipboard } = useExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'priority' | 'date' | 'category'>('default');

  const {
    tasks, clarifications, loading, error, config,
    loadConfig, extractTasks, clearAll, removeSyncedTasks,
  } = useTaskExtractor();

  // ======================== COMPUTED TASKS ========================
  const allTasks = tasks.length > 0 ? tasks : savedTasks;

  // Apply filters
  const filteredTasks = allTasks.filter(task => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesOriginal = task.original_text.toLowerCase().includes(query);
      const matchesAssignee = task.assignee?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesOriginal && !matchesAssignee) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    return true;
  });

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] || 1) - (order[b.priority] || 1);
      }
      case 'date': {
        const dateA = a.due_date || 'zzzz';
        const dateB = b.due_date || 'zzzz';
        return dateA.localeCompare(dateB);
      }
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const readyTasks = sortedTasks.filter(t => t.is_clarified);
  const reviewTasks = sortedTasks.filter(t => !t.is_clarified);

  // ======================== EFFECTS ========================
  useEffect(() => { loadConfig(); }, [loadConfig]);
  useEffect(() => {
    if (tasks.length > 0) setSavedTasks(tasks);
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
    setText(''); clearAll(); clearSaved(); setClarifyAnswers({});
    setSearchQuery(''); setPriorityFilter('all'); setCategoryFilter('all');
    showToast('All data cleared', 'warning');
  };

  const handleClearFilters = () => {
    setSearchQuery(''); setPriorityFilter('all'); setCategoryFilter('all');
  };

  // ======================== EXTRACT ========================
  const handleExtract = async () => {
    const success = await extractTasks(text);
    if (success) { showToast('Tasks extracted!', 'success'); setText(''); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && text.trim()) handleExtract();
  };

  // ======================== CLARIFICATION ========================
  const handleClarificationUpdate = async () => {
    let combined = ''; let count = 0;
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
    if (!google?.accounts) { showToast('Google API not loaded', 'error'); return; }
    if (!config.google_client_id) { showToast('Google not configured', 'error'); return; }
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
        else if (res.status === 401) { setAccessToken(null); showToast('Session expired', 'error'); break; }
      } catch (e) { console.error(e); }
    }
    setSyncing(false);
    if (ok) {
      showToast(`${ok} event(s) synced!`, 'success');
      setSavedTasks(prev => prev.filter(t => !t.is_clarified));
      removeSyncedTasks();
    } else showToast('Sync failed', 'error');
  };

  // ======================== EXPORT HANDLERS ========================
  const handleExportJSON = () => { exportJSON(allTasks); showToast('JSON downloaded!', 'success'); };
  const handleExportCSV = () => { exportCSV(allTasks); showToast('CSV downloaded!', 'success'); };
  const handleCopyClipboard = async () => {
    const ok = await copyToClipboard(allTasks);
    showToast(ok ? 'Copied to clipboard!' : 'Copy failed', ok ? 'success' : 'error');
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
    <div className={`min-h-screen font-['Inter'] transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ===== HEADER ===== */}
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl grid place-items-center text-white">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              FlowPilot
            </h1>
            <span className={`text-xs font-bold px-2 py-0.5 rounded text-white tracking-wider ${
              config.llm_available ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-amber-500'
            }`}>
              {config.llm_available ? 'AI' : 'LOCAL'}
            </span>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            {/* Theme Toggle */}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

            {/* Export */}
            <ExportMenu
              onExportJSON={handleExportJSON}
              onExportCSV={handleExportCSV}
              onCopyClipboard={handleCopyClipboard}
              taskCount={allTasks.length}
              isDark={isDark}
            />

            {/* Sort */}
            {allTasks.length > 0 && (
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-200 border-slate-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                <option value="default">Sort: Default</option>
                <option value="priority">Sort: Priority</option>
                <option value="date">Sort: Date</option>
                <option value="category">Sort: Category</option>
              </select>
            )}

            {/* Clear All */}
            {allTasks.length > 0 && (
              <button onClick={handleClearAll}
                className="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200">
                <i className="fa-solid fa-trash-can mr-1"></i> Clear All
              </button>
            )}

            {/* Google Auth */}
            <button onClick={handleGoogleAuth} disabled={!!accessToken}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 border transition-all ${
                accessToken
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default'
                  : isDark
                    ? 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}>
              <i className={accessToken ? 'fa-solid fa-check-circle' : 'fa-brands fa-google'}></i>
              {accessToken ? 'Connected' : 'Sign in with Google'}
            </button>
          </div>
        </header>

        {/* ===== STATS BAR ===== */}
        {allTasks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-in">
            {[
              { label: 'Total Tasks', value: allTasks.length, color: isDark ? 'text-white' : 'text-slate-800', border: isDark ? 'border-slate-700' : 'border-gray-100' },
              { label: 'Ready', value: allTasks.filter(t => t.is_clarified).length, color: 'text-emerald-500', border: isDark ? 'border-emerald-900' : 'border-green-100' },
              { label: 'Needs Review', value: allTasks.filter(t => !t.is_clarified).length, color: 'text-amber-500', border: isDark ? 'border-amber-900' : 'border-amber-100' },
              { label: 'High Priority', value: allTasks.filter(t => t.priority === 'high').length, color: 'text-red-500', border: isDark ? 'border-red-900' : 'border-red-100' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl p-4 shadow-sm border text-center transition-colors ${
                isDark ? 'bg-slate-800' : 'bg-white'
              } ${stat.border}`}>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ===== INPUT PANEL ===== */}
        <section className={`p-6 rounded-2xl shadow-md mb-8 transition-colors ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            <i className="fa-solid fa-brain text-indigo-500"></i> AI Workflow Engine
          </h3>

          <textarea value={text}
            onChange={e => { setText(e.target.value); if (error) clearAll(); }}
            onKeyDown={handleKeyDown}
            placeholder={`Examples:\n• "Email boss tomorrow at 2pm, gym 6pm, call Sarah"\n• "Buy groceries (milk, eggs, bread) + finish report by Friday"\n\nSeparate tasks with commas, "and", "+", or new lines`}
            className={`w-full h-32 p-4 border-2 rounded-xl resize-y text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />

          <div className="flex justify-between items-center mt-2 mb-4">
            <span className={`text-xs font-medium ${
              text.length > 9000 ? 'text-red-500' : text.length > 7500 ? 'text-amber-500' : isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {text.length.toLocaleString()} / 10,000
            </span>
            {allTasks.length > 0 && (
              <span className="text-xs text-emerald-500 font-medium">
                <i className="fa-solid fa-database mr-1"></i> {allTasks.length} tasks saved
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <button onClick={handleExtract} disabled={!text.trim() || loading}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Analyzing...</>
              : <><i className="fa-solid fa-wand-magic-sparkles"></i> Analyze & Extract</>
            }
          </button>

          <p className={`text-center text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <kbd className={`px-1.5 py-0.5 rounded border text-[0.65rem] ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'}`}>Ctrl</kbd>
            {' + '}
            <kbd className={`px-1.5 py-0.5 rounded border text-[0.65rem] ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'}`}>Enter</kbd>
            {' to analyze'}
          </p>
        </section>

        {/* ===== CLARIFICATION ZONE ===== */}
        {clarifications.length > 0 && (
          <section className={`border-2 p-6 rounded-2xl mb-8 animate-slide-in ${
            isDark
              ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-700'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
          }`}>
            <h4 className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-amber-300' : 'text-orange-800'}`}>
              <i className="fa-solid fa-robot"></i> Missing Details
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-amber-400' : 'text-orange-700'}`}>
              Some tasks need a due date:
            </p>
            {clarifications.map((c, i) => (
              <div key={c.id} className="flex gap-3 mb-3 items-start">
                <span className={`font-bold min-w-[24px] pt-3 ${isDark ? 'text-amber-400' : 'text-orange-700'}`}>{i + 1}.</span>
                <div className="flex-1">
                  <p className={`text-xs font-medium mb-1 ${isDark ? 'text-amber-300' : 'text-orange-800'}`}>{c.task_title}</p>
                  <input type="text" value={clarifyAnswers[i] || ''}
                    onChange={e => setClarifyAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    placeholder={c.question}
                    onKeyDown={e => { if (e.key === 'Enter') handleClarificationUpdate(); }}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none ${
                      isDark
                        ? 'bg-slate-800 border-amber-600 text-white focus:border-amber-400 placeholder-slate-500'
                        : 'bg-white border-orange-300 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>
            ))}
            <button onClick={handleClarificationUpdate} disabled={loading}
              className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-check"></i> Update Tasks
            </button>
          </section>
        )}

        {/* ===== FILTER BAR ===== */}
        {allTasks.length > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={handleClearFilters}
            totalCount={allTasks.length}
            filteredCount={filteredTasks.length}
            isDark={isDark}
          />
        )}

        {/* ===== KANBAN BOARD ===== */}
        {allTasks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
            {/* Ready for Calendar */}
            <section className={`rounded-2xl shadow-md p-5 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center pb-4 border-b-[3px] border-emerald-400 mb-5">
                <span className="font-bold text-xs uppercase text-emerald-500 flex items-center gap-2">
                  <i className="fa-solid fa-rocket"></i> Ready for Calendar
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {readyTasks.length}
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {readyTasks.length > 0 ? (
                  readyTasks.map(task => (
                    <TaskCard key={task.id} task={task}
                      onDelete={handleDeleteTask} onMove={handleMoveTask}
                      onEditTitle={handleEditTitle} onChangePriority={handleChangePriority}
                      moveLabel="→ Review" />
                  ))
                ) : (
                  <EmptyState type="ready" />
                )}
              </div>
              {accessToken && readyTasks.length > 0 && (
                <button onClick={handleCalendarSync} disabled={syncing}
                  className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {syncing
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Syncing...</>
                    : <><i className="fa-solid fa-cloud-arrow-up"></i> Push to Google Calendar</>
                  }
                </button>
              )}
            </section>

            {/* Needs Review */}
            <section className={`rounded-2xl shadow-md p-5 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center pb-4 border-b-[3px] border-amber-400 mb-5">
                <span className="font-bold text-xs uppercase text-amber-500 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i> Needs Review
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {reviewTasks.length}
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {reviewTasks.length > 0 ? (
                  reviewTasks.map(task => (
                    <TaskCard key={task.id} task={task}
                      onDelete={handleDeleteTask} onMove={handleMoveTask}
                      onEditTitle={handleEditTitle} onChangePriority={handleChangePriority}
                      moveLabel="→ Ready" />
                  ))
                ) : (
                  <EmptyState type="review" />
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className={`text-center py-8 mt-10 border-t text-xs space-x-3 ${
          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
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