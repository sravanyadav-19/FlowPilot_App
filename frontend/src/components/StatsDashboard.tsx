// ============================================================================
// FILE: frontend/src/components/StatsDashboard.tsx
// Day 8: Comprehensive statistics dashboard
// ============================================================================

import React, { useState } from 'react';
import { TaskStats } from '../types/task';
import { StreakCounter } from './StreakCounter';

interface StatsDashboardProps {
  stats: TaskStats;
  isDark: boolean;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, isDark }) => {
  const [expanded, setExpanded] = useState(false);

  // Mini bar chart for weekly data
  const maxCompleted = Math.max(...stats.weeklyData.map(d => d.completed), 1);

  return (
    <div className={`rounded-2xl shadow-md border overflow-hidden transition-all ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-4 flex justify-between items-center transition-colors ${
          isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
            <i className="fa-solid fa-chart-line text-sm"></i>
          </div>
          <div className="text-left">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Productivity Insights
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stats.completedToday} completed today • {stats.completionRate}% rate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.currentStreak > 0 && (
            <span className="text-sm font-bold text-orange-500 flex items-center gap-1">
              🔥 {stats.currentStreak}
            </span>
          )}
          <i className={`fa-solid fa-chevron-down transition-transform ${
            expanded ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-500'}`}></i>
        </div>
      </button>

      {/* Expanded Dashboard */}
      {expanded && (
        <div className={`px-5 pb-5 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {/* Total Tasks */}
            <div className={`rounded-xl p-4 text-center ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {stats.totalTasks}
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Tasks
              </p>
            </div>

            {/* Completed */}
            <div className={`rounded-xl p-4 text-center ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <p className="text-2xl font-extrabold text-emerald-500">
                {stats.completedTasks}
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Completed
              </p>
            </div>

            {/* Today */}
            <div className={`rounded-xl p-4 text-center ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <p className="text-2xl font-extrabold text-blue-500">
                {stats.completedToday}
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Today
              </p>
            </div>

            {/* Streak */}
            <StreakCounter
              streak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              isDark={isDark}
            />
          </div>

          {/* Weekly Chart */}
          <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Last 7 Days
            </p>
            <div className="flex items-end justify-between gap-2 h-20">
              {stats.weeklyData.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${
                      day.completed > 0
                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                        : isDark ? 'bg-slate-600' : 'bg-slate-200'
                    }`}
                    style={{
                      height: `${Math.max((day.completed / maxCompleted) * 100, 8)}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className={`text-[0.6rem] font-medium ${
                    idx === 6
                      ? 'text-emerald-500 font-bold'
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority & Category Distribution */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Priority */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                By Priority
              </p>
              <div className="space-y-2">
                {[
                  { label: 'High', count: stats.byPriority.high, color: 'bg-red-500' },
                  { label: 'Medium', count: stats.byPriority.medium, color: 'bg-amber-500' },
                  { label: 'Low', count: stats.byPriority.low, color: 'bg-green-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className={`text-xs flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                By Category
              </p>
              <div className="space-y-2">
                {[
                  { label: '💼 Work', count: stats.byCategory.Work, color: 'bg-blue-500' },
                  { label: '🏠 Personal', count: stats.byCategory.Personal, color: 'bg-pink-500' },
                  { label: '📞 Meeting', count: stats.byCategory.Meeting, color: 'bg-emerald-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`text-xs flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Rate Bar */}
          <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Completion Rate
              </p>
              <span className={`text-sm font-bold ${
                stats.completionRate >= 70 ? 'text-emerald-500' :
                stats.completionRate >= 40 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {stats.completionRate}%
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.completionRate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                  stats.completionRate >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                  'bg-gradient-to-r from-red-500 to-orange-400'
                }`}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};