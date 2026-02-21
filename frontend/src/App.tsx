import React, { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

// TypeScript Interfaces
interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface ApiResponse {
  tasks: Task[];
  error?: string;
}

// Hardcoded default endpoint as requested
const API_URL = 'https://flowpilot-app.onrender.com/api/process';

function App() {
  const [text, setText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractTasks = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    
    setLoading(true);
    setTasks([]);
    setError('');
    
    try {
      const response = await axios.post<ApiResponse>(
        API_URL,
        { text },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 
        }
      );
      
      setTasks(response.data.tasks || []);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      console.error('AI Error:', axiosError);
      setError(axiosError.response?.data?.error || 'Failed to extract tasks. Try again.');
    } finally {
      setLoading(false);
    }
  }, [text]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-white/90 backdrop-blur-xl border-r border-gray-200 z-50 shadow-sm">
        <div className="p-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-8 shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <nav className="space-y-6">
            {[
              { active: true, color: 'bg-indigo-100 hover:bg-indigo-200' },
              { active: false, color: 'bg-gray-100 hover:bg-gray-200' },
              { active: false, color: 'bg-gray-100 hover:bg-gray-200' },
            ].map((nav, i) => (
              <div 
                key={i}
                className={`w-8 h-8 ${nav.color} rounded-lg flex items-center justify-center cursor-pointer transition-all group relative`}
              >
                <span className="text-xs opacity-60 group-hover:opacity-100">•</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-16 p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              FlowPilot AI
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base max-w-md">Extract actionable tasks from emails, notes, and conversations instantly</p>
          </div>
          <button className="px-6 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-semibold hover:shadow-lg hover:border-gray-300 transition-all text-gray-800">
            <span>Sign in with Google</span>
          </button>
        </header>

        {/* AI Input Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 lg:mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">AI Task Extractor</h2>
              <p className="text-gray-600">Paste notes, emails, or messages. Get structured tasks instantly.</p>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            placeholder="Email boss project update, gym 6pm, finish report tomorrow, call Sarah re: meeting..."
            className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-lg min-h-[140px] transition-all placeholder-gray-400"
            rows={4}
          />
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={extractTasks}
            disabled={!text.trim() || loading}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI Analyzing...
              </span>
            ) : (
              '✨ Extract Tasks with AI'
            )}
          </button>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Ready for Calendar */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ready for Calendar</h3>
                <p className="text-gray-600 text-sm">Tasks that can be scheduled immediately</p>
              </div>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-50 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-inner">
                  <span className="text-3xl">📱</span>
                </div>
                <p className="text-xl font-medium text-gray-600 mb-2">No tasks ready yet</p>
                <p className="text-gray-500 text-sm">Extract some tasks to see schedulable items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <article key={task.id} className="group bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-5 hover:shadow-xl hover:border-green-200 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base leading-tight group-hover:text-green-900">{task.title}</h4>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className={`${getPriorityColor(task.priority)} px-3 py-1 rounded-full text-xs font-bold`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            {task.category}
                          </span>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-green-600 hover:bg-green-200 rounded-xl transition-all ml-2">
                        ➕
                      </button>
                    </div>
                  </article>
                ))}
                {tasks.length > 3 && (
                  <div className="text-center py-8 text-gray-500 text-sm border-t border-gray-200 mt-4 pt-4">
                    +{tasks.length - 3} more ready
                  </div>
                )}
              </div>
            )}
          </section>

          {/* AI Review */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 h-fit">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xl">🔍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Review</h3>
                <p className="text-gray-600 text-sm">Extracted tasks for your confirmation</p>
              </div>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-orange-50 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-inner">
                  <span className="text-3xl">⚡</span>
                </div>
                <p className="text-xl font-medium text-gray-600 mb-2">Tasks will appear here</p>
                <p className="text-gray-500 text-sm">Paste some text and click Extract</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <article key={task.id} className="group bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base leading-tight truncate group-hover:text-indigo-900">
                          {task.title}
                        </h4>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className={`${getPriorityColor(task.priority)} px-3 py-1 rounded-full text-xs font-bold`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold whitespace-nowrap">
                            {task.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all">
                          ✓
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all">
                          ✕
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
