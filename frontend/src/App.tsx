import React, { useState } from 'react';
import { useTaskExtractor } from './hooks/useTaskExtractor';
import { TaskCard } from './components/TaskCard';
import { EmptyState } from './components/EmptyState';
import './index.css';

function App() {
  const [text, setText] = useState('');
  const { tasks, loading, error, extractTasks, clearTasks } = useTaskExtractor();

  const handleExtract = () => {
    extractTasks(text);
  };

  const handleClear = () => {
    setText('');
    clearTasks();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && text.trim()) {
      handleExtract();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 bg-white/90 backdrop-blur-xl border-r border-gray-200 z-50 shadow-sm">
        <div className="p-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-8 shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <nav className="space-y-6">
            {[{ active: true }, { active: false }, { active: false }].map((nav, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 ${nav.active ? 'bg-indigo-100' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg flex items-center justify-center cursor-pointer transition-all group relative`}
              >
                <span className="text-xs opacity-60 group-hover:opacity-100">•</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="ml-16 p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              FlowPilot AI
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base max-w-md">
              Extract actionable tasks from emails, notes, and conversations instantly
            </p>
          </div>
          <button className="px-6 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-semibold hover:shadow-lg hover:border-gray-300 transition-all text-gray-800">
            Sign in with Google
          </button>
        </header>

        {/* AI Input Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 lg:mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Smart Task Extractor</h2>
              <p className="text-gray-600">Paste notes, emails, or messages. Get structured tasks instantly.</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) clearTasks();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Email boss project update, gym 6pm tomorrow, finish report by Friday, call Sarah re: meeting..."
            className="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-lg min-h-[140px] transition-all placeholder-gray-400"
            rows={4}
          />

          {/* Character Counter */}
          <div className="flex justify-between items-center text-sm mt-3">
            <span className={`font-medium ${
              text.length > 4500 
                ? 'text-red-600' 
                : text.length > 4000 
                ? 'text-orange-600' 
                : 'text-gray-500'
            }`}>
              {text.length.toLocaleString()} / 5,000 characters
            </span>
            {text.length > 4500 && (
              <span className="text-red-600 text-xs animate-pulse font-semibold">
                ⚠️ Approaching limit
              </span>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleExtract}
              disabled={!text.trim() || loading || text.length < 3}
              className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                  AI Analyzing...
                </>
              ) : (
                '✨ Extract Tasks with AI'
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-2xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Tip: Press <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to extract
          </p>
        </section>

        {/* Empty State - No Tasks Found */}
        {!loading && tasks.length === 0 && text.trim().length > 0 && !error && (
          <div className="max-w-4xl mx-auto animate-slide-in">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Tasks Detected
              </h3>
              <p className="text-gray-700 mb-6 max-w-md mx-auto">
                Try adding action words like <span className="font-semibold">"call"</span>, 
                <span className="font-semibold"> "email"</span>, 
                <span className="font-semibold"> "finish"</span>, 
                <span className="font-semibold"> "buy"</span>, or 
                <span className="font-semibold"> "meet"</span>
              </p>
              <div className="bg-white/80 rounded-2xl p-4 text-left max-w-lg mx-auto shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-semibold">💡 Example:</p>
                <p className="text-gray-800 italic">
                  "Email boss about project update, call Sarah at 3pm, finish report by Friday, gym at 6pm"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task Results */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 animate-slide-in">
            {/* Ready for Calendar */}
            <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">📅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Ready for Calendar ({tasks.filter(t => t.priority !== 'low').length})
                  </h3>
                  <p className="text-gray-600 text-sm">Tasks that can be scheduled immediately</p>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                {tasks.filter(t => t.priority !== 'low').length > 0 ? (
                  tasks.filter(t => t.priority !== 'low').map(task => (
                    <TaskCard key={task.id} task={task} variant="calendar" />
                  ))
                ) : (
                  <EmptyState type="calendar" />
                )}
              </div>
            </section>

            {/* AI Review */}
            <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    All Extracted Tasks ({tasks.length})
                  </h3>
                  <p className="text-gray-600 text-sm">Review and manage your tasks</p>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} variant="review" />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;