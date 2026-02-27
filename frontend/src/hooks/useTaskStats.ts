// ============================================================================
// FILE: frontend/src/hooks/useTaskStats.ts
// Day 8: Calculate comprehensive task statistics from localStorage
// ============================================================================

import { useMemo } from 'react';
import { Task, TaskStats } from '../types/task';

export const useTaskStats = (tasks: Task[], completedTasks: Task[]): TaskStats => {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTimestamp = today.getTime();

    // All tasks (active + completed)
    const allTasks = [...tasks, ...completedTasks];
    const totalTasks = allTasks.length;
    const totalCompleted = completedTasks.length;

    // Completed today
    const completedToday = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= today;
    }).length;

    // Completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((totalCompleted / totalTasks) * 100) 
      : 0;

    // Calculate streak (consecutive days with at least one completion)
    const calculateStreak = (): { current: number; longest: number } => {
      if (completedTasks.length === 0) return { current: 0, longest: 0 };

      // Get unique completion dates
      const completionDates = new Set<string>();
      completedTasks.forEach(t => {
        if (t.completedAt) {
          const date = new Date(t.completedAt);
          completionDates.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
        }
      });

      const sortedDates = Array.from(completionDates).sort().reverse();
      
      // Check if today or yesterday has completion (streak still active)
      const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let checkDate = new Date(today);

      // If no completion today, check from yesterday
      if (!completionDates.has(todayKey)) {
        if (!completionDates.has(yesterdayKey)) {
          currentStreak = 0;
        } else {
          checkDate = yesterday;
        }
      }

      // Count current streak
      if (completionDates.has(todayKey) || completionDates.has(yesterdayKey)) {
        while (true) {
          const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          if (completionDates.has(key)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Find longest streak
      let prevDate: Date | null = null;
      sortedDates.forEach(dateKey => {
        const parts = dateKey.split('-').map(Number);
        const date = new Date(parts[0], parts[1], parts[2]);
        
        if (!prevDate) {
          tempStreak = 1;
        } else {
          const diff = (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        prevDate = date;
      });
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      return { current: currentStreak, longest: longestStreak };
    };

    const streakData = calculateStreak();

    // By priority
    const byPriority = {
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length,
    };

    // By category
    const byCategory = {
      Work: allTasks.filter(t => t.category === 'Work').length,
      Personal: allTasks.filter(t => t.category === 'Personal').length,
      Meeting: allTasks.filter(t => t.category === 'Meeting').length,
    };

    // Weekly data (last 7 days)
    const weeklyData: { day: string; completed: number; created: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dateEnd = dateStart + 24 * 60 * 60 * 1000;

      const completedOnDay = completedTasks.filter(t => 
        t.completedAt && t.completedAt >= dateStart && t.completedAt < dateEnd
      ).length;

      const createdOnDay = allTasks.filter(t => 
        t.createdAt && t.createdAt >= dateStart && t.createdAt < dateEnd
      ).length;

      weeklyData.push({
        day: dayNames[date.getDay()],
        completed: completedOnDay,
        created: createdOnDay,
      });
    }

    // Average completion time (hours from creation to completion)
    let totalCompletionTime = 0;
    let tasksWithBothTimestamps = 0;
    completedTasks.forEach(t => {
      if (t.completedAt && t.createdAt) {
        totalCompletionTime += (t.completedAt - t.createdAt);
        tasksWithBothTimestamps++;
      }
    });
    const averageCompletionTime = tasksWithBothTimestamps > 0
      ? Math.round(totalCompletionTime / tasksWithBothTimestamps / (1000 * 60 * 60))
      : 0;

    return {
      totalTasks,
      completedTasks: totalCompleted,
      completedToday,
      completionRate,
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      byPriority,
      byCategory,
      weeklyData,
      averageCompletionTime,
    };
  }, [tasks, completedTasks]);
};