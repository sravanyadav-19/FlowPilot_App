// ============================================================================
// FILE: frontend/src/components/StreakCounter.tsx
// Day 8: Animated streak counter with fire effect
// ============================================================================

import React from 'react';

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
  isDark: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  longestStreak,
  isDark,
}) => {
  const getStreakLevel = (s: number): { emoji: string; text: string; color: string } => {
    if (s === 0) return { emoji: '❄️', text: 'Start your streak!', color: 'text-slate-400' };
    if (s < 3) return { emoji: '🔥', text: 'Building momentum', color: 'text-orange-500' };
    if (s < 7) return { emoji: '🔥', text: 'On fire!', color: 'text-orange-500' };
    if (s < 14) return { emoji: '⚡', text: 'Unstoppable!', color: 'text-yellow-500' };
    if (s < 30) return { emoji: '🚀', text: 'Incredible!', color: 'text-purple-500' };
    return { emoji: '👑', text: 'Legendary!', color: 'text-amber-500' };
  };

  const level = getStreakLevel(streak);
  const isNewRecord = streak > 0 && streak >= longestStreak;

  return (
    <div className={`relative rounded-xl p-4 text-center overflow-hidden ${
      isDark ? 'bg-slate-800' : 'bg-white'
    } shadow-sm border ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
      {/* Background glow for active streaks */}
      {streak > 0 && (
        <div className={`absolute inset-0 opacity-10 ${
          streak >= 7 ? 'bg-gradient-to-br from-orange-500 to-red-500' :
          streak >= 3 ? 'bg-gradient-to-br from-orange-400 to-amber-500' :
          'bg-gradient-to-br from-amber-400 to-yellow-500'
        }`} />
      )}

      {/* Streak Number */}
      <div className="relative">
        <p className={`text-3xl font-extrabold ${level.color} flex items-center justify-center gap-1`}>
          <span className={streak > 0 ? 'animate-pulse' : ''}>{level.emoji}</span>
          {streak}
        </p>
        <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Day Streak
        </p>
      </div>

      {/* Status Text */}
      <p className={`text-[0.65rem] mt-2 font-medium ${level.color}`}>
        {level.text}
      </p>

      {/* Record Badge */}
      {isNewRecord && streak > 1 && (
        <div className="absolute top-2 right-2">
          <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase animate-pulse">
            🏆 Record!
          </span>
        </div>
      )}

      {/* Longest Streak */}
      {longestStreak > 0 && (
        <p className={`text-[0.6rem] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Best: {longestStreak} days
        </p>
      )}
    </div>
  );
};