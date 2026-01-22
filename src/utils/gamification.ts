import { differenceInCalendarDays, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';

export interface GamificationStats {
  level: number;
  currentXP: number; // Current total minutes
  nextLevelXP: number; // Total minutes needed for next level
  progressPercent: number;
  streak: number;
}

/**
 * Calculates the user's level based on total focus minutes.
 * Formula: Level = floor(sqrt(totalMinutes / 60)) + 1
 * This means:
 * Level 1: 0-59 mins
 * Level 2: 1 hr (60 mins)
 * Level 3: 4 hrs (240 mins)
 * Level 4: 9 hrs (540 mins)
 * ...
 */
export const calculateLevel = (totalMinutes: number) => {
  // Ensure non-negative
  const minutes = Math.max(0, totalMinutes);
  const hours = minutes / 60;
  
  const level = Math.floor(Math.sqrt(hours)) + 1;
  
  // Calculate XP boundaries for current and next level
  // Inverse: Hours = (Level - 1)^2
  const currentLevelBaseHours = Math.pow(level - 1, 2);
  const nextLevelBaseHours = Math.pow(level, 2);
  
  const currentLevelBaseMinutes = currentLevelBaseHours * 60;
  const nextLevelBaseMinutes = nextLevelBaseHours * 60;
  
  const minutesInCurrentLevel = minutes - currentLevelBaseMinutes;
  const minutesRequiredForLevel = nextLevelBaseMinutes - currentLevelBaseMinutes;
  
  const progressPercent = Math.min(100, Math.max(0, Math.round((minutesInCurrentLevel / minutesRequiredForLevel) * 100)));

  return {
    level,
    currentXP: minutes,
    nextLevelXP: nextLevelBaseMinutes,
    progressPercent,
    minutesToNextLevel: nextLevelBaseMinutes - minutes
  };
};

/**
 * Calculates the current daily streak.
 * A streak is maintained if there is a block for today OR yesterday.
 */
export const calculateStreak = (dates: string[]): number => {
  if (!dates.length) return 0;

  // Deduplicate and sort dates (newest first)
  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  
  let streak = 0;
  let currentDate = parseISO(uniqueDates[0]);
  
  // Check if the most recent entry is today or yesterday to start the streak
  // If the last entry was 2 days ago, the streak is broken (0)
  const diffToLatest = differenceInCalendarDays(today, currentDate);
  
  if (diffToLatest > 1) {
    return 0;
  }

  // Iterate to count consecutive days
  // We align our check date to the most recent logged date
  let expectedDate = currentDate;

  for (const dateStr of uniqueDates) {
    const date = parseISO(dateStr);
    
    // If this date matches our expected date, increment streak and move expected date back
    if (isSameDay(date, expectedDate)) {
      streak++;
      expectedDate = subDays(expectedDate, 1);
    } else {
      // If we skipped a day (gap > 1 day from previous found), stop
      // Note: Since we already sorted and are iterating, any gap means streak end
      // But we need to be careful about gaps in the array vs gaps in time
      const diff = differenceInCalendarDays(expectedDate, date); // expected is older? No, expected is moving back
      // Actually simpler:
      // prevDate = date of previous iteration (newer)
      // currDate = date of current iteration (older)
      // diff must be 1 day.
    }
  }

  // Let's rewrite simpler loop logic
  streak = 0;
  // Check start
  const latest = parseISO(uniqueDates[0]);
  if (!isSameDay(latest, today) && !isSameDay(latest, yesterday)) {
    return 0;
  }
  
  // Start counting from latest
  streak = 1;
  let lastDate = latest;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = parseISO(uniqueDates[i]);
    const diff = differenceInCalendarDays(lastDate, current);
    
    if (diff === 1) {
      streak++;
      lastDate = current;
    } else {
      break;
    }
  }

  return streak;
};

