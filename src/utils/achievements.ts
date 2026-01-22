import type { Block } from '../types';
import { parseISO, startOfDay, isAfter, getHours } from 'date-fns';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCheckOptions {
  currentStreak?: number;
}

export interface PersonalRecord {
  type: 'daily_blocks' | 'daily_minutes' | 'weekly_blocks' | 'weekly_minutes' | 'streak';
  value: number;
  achievedAt: string;
}

/**
 * Check all achievements and return unlocked ones
 */
export const checkAchievements = (blocks: Block[], options?: AchievementCheckOptions): Achievement[] => {
  const currentStreak = options?.currentStreak || 0;
  const achievements: Achievement[] = [];
  const now = new Date();
  
  // Calculate stats
  const totalBlocks = blocks.length;
  const totalMinutes = blocks.reduce((acc, b) => acc + b.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  
  // Count by type
  const deepBlocks = blocks.filter(b => b.block_type === 'Deep').length;
  const shortBlocks = blocks.filter(b => b.block_type === 'Short').length;
  const microBlocks = blocks.filter(b => b.block_type === 'Micro').length;
  
  // Daily stats
  const today = startOfDay(now);
  const todayBlocks = blocks.filter(b => {
    const blockDate = parseISO(b.date);
    return isAfter(blockDate, today) || blockDate.getTime() === today.getTime();
  });
  const todayMinutes = todayBlocks.reduce((acc, b) => acc + b.duration_minutes, 0);
  
  // Early bird check (before 8 AM)
  const hasEarlyBird = blocks.some(b => {
    const blockDate = parseISO(b.date);
    return getHours(blockDate) < 8;
  });
  
  // Night owl check (after 10 PM)
  const hasNightOwl = blocks.some(b => {
    const blockDate = parseISO(b.date);
    return getHours(blockDate) >= 22;
  });
  
  // Marathon check (6+ hours in one day) - calculated inline for daily_6h achievement
  
  // Define achievements
  const allAchievements: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    // First steps
    { id: 'first_block', name: 'Getting Started', description: 'Log your first block', icon: '🎯', rarity: 'common' },
    { id: 'first_hour', name: 'Hour One', description: 'Complete 1 hour of focus time', icon: '⏰', rarity: 'common' },
    { id: 'first_10', name: 'Decade', description: 'Log 10 blocks', icon: '🔟', rarity: 'common' },
    
    // Milestones
    { id: '100_blocks', name: 'Century', description: 'Log 100 blocks', icon: '💯', rarity: 'rare' },
    { id: '500_blocks', name: 'Half Grand', description: 'Log 500 blocks', icon: '🎖️', rarity: 'epic' },
    { id: '1000_blocks', name: 'Millennium', description: 'Log 1,000 blocks', icon: '🏆', rarity: 'legendary' },
    
    // Time milestones
    { id: '10_hours', name: 'Tenacious', description: 'Complete 10 hours of focus', icon: '⏱️', rarity: 'common' },
    { id: '50_hours', name: 'Dedicated', description: 'Complete 50 hours of focus', icon: '🔥', rarity: 'rare' },
    { id: '100_hours', name: 'Centurion', description: 'Complete 100 hours of focus', icon: '⚡', rarity: 'epic' },
    { id: '500_hours', name: 'Master', description: 'Complete 500 hours of focus', icon: '👑', rarity: 'legendary' },
    
    // Type-specific
    { id: '50_deep', name: 'Deep Diver', description: 'Complete 50 Deep Work blocks', icon: '🌊', rarity: 'rare' },
    { id: '100_deep', name: 'Abyssal Explorer', description: 'Complete 100 Deep Work blocks', icon: '🐋', rarity: 'epic' },
    { id: '100_short', name: 'Quick Draw', description: 'Complete 100 Short blocks', icon: '⚡', rarity: 'rare' },
    { id: '100_micro', name: 'Micro Master', description: 'Complete 100 Micro blocks', icon: '🔬', rarity: 'rare' },
    
    // Daily achievements
    { id: 'daily_5', name: 'Power Day', description: 'Log 5 blocks in one day', icon: '💪', rarity: 'rare' },
    { id: 'daily_6h', name: 'Marathon Day', description: 'Log 6+ hours in one day', icon: '🏃', rarity: 'epic' },
    { id: 'early_bird', name: 'Early Bird', description: 'Log a block before 8 AM', icon: '🌅', rarity: 'common' },
    { id: 'night_owl', name: 'Night Owl', description: 'Log a block after 10 PM', icon: '🦉', rarity: 'common' },
    
    // Streak achievements
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '📅', rarity: 'rare' },
    { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🗓️', rarity: 'epic' },
    { id: 'streak_100', name: 'Centurion Streak', description: 'Maintain a 100-day streak', icon: '🔥', rarity: 'legendary' },
  ];
  
  // Check each achievement
  for (const achievement of allAchievements) {
    let unlocked = false;
    
    switch (achievement.id) {
      case 'first_block':
        unlocked = totalBlocks >= 1;
        break;
      case 'first_hour':
        unlocked = totalHours >= 1;
        break;
      case 'first_10':
        unlocked = totalBlocks >= 10;
        break;
      case '100_blocks':
        unlocked = totalBlocks >= 100;
        break;
      case '500_blocks':
        unlocked = totalBlocks >= 500;
        break;
      case '1000_blocks':
        unlocked = totalBlocks >= 1000;
        break;
      case '10_hours':
        unlocked = totalHours >= 10;
        break;
      case '50_hours':
        unlocked = totalHours >= 50;
        break;
      case '100_hours':
        unlocked = totalHours >= 100;
        break;
      case '500_hours':
        unlocked = totalHours >= 500;
        break;
      case '50_deep':
        unlocked = deepBlocks >= 50;
        break;
      case '100_deep':
        unlocked = deepBlocks >= 100;
        break;
      case '100_short':
        unlocked = shortBlocks >= 100;
        break;
      case '100_micro':
        unlocked = microBlocks >= 100;
        break;
      case 'daily_5':
        unlocked = todayBlocks.length >= 5;
        break;
      case 'daily_6h':
        unlocked = todayMinutes >= 360;
        break;
      case 'early_bird':
        unlocked = hasEarlyBird;
        break;
      case 'night_owl':
        unlocked = hasNightOwl;
        break;
      case 'streak_7':
        unlocked = currentStreak >= 7;
        break;
      case 'streak_30':
        unlocked = currentStreak >= 30;
        break;
      case 'streak_100':
        unlocked = currentStreak >= 100;
        break;
    }
    
    achievements.push({
      ...achievement,
      unlocked,
      unlockedAt: unlocked ? new Date().toISOString() : undefined
    });
  }
  
  return achievements;
};

/**
 * Get level title based on level number
 */
export const getLevelTitle = (level: number): string => {
  if (level <= 1) return 'Novice';
  if (level <= 3) return 'Apprentice';
  if (level <= 5) return 'Practitioner';
  if (level <= 10) return 'Focused';
  if (level <= 15) return 'Dedicated';
  if (level <= 20) return 'Expert';
  if (level <= 30) return 'Master';
  if (level <= 50) return 'Grandmaster';
  if (level <= 100) return 'Legend';
  return 'Transcendent';
};

/**
 * Calculate personal records
 */
export const calculatePersonalRecords = (blocks: Block[]): PersonalRecord[] => {
  const records: PersonalRecord[] = [];
  
  if (blocks.length === 0) return records;
  
  // Group by date
  const dailyStats = blocks.reduce((acc, block) => {
    const date = block.date;
    if (!acc[date]) {
      acc[date] = { blocks: 0, minutes: 0, date };
    }
    acc[date].blocks++;
    acc[date].minutes += block.duration_minutes;
    return acc;
  }, {} as Record<string, { blocks: number; minutes: number; date: string }>);
  
  // Find daily records
  const dailyBlocks = Math.max(...Object.values(dailyStats).map(s => s.blocks));
  const dailyMinutes = Math.max(...Object.values(dailyStats).map(s => s.minutes));
  
  if (dailyBlocks > 0) {
    const recordDate = Object.values(dailyStats).find(s => s.blocks === dailyBlocks)?.date || '';
    records.push({ type: 'daily_blocks', value: dailyBlocks, achievedAt: recordDate });
  }
  
  if (dailyMinutes > 0) {
    const recordDate = Object.values(dailyStats).find(s => s.minutes === dailyMinutes)?.date || '';
    records.push({ type: 'daily_minutes', value: dailyMinutes, achievedAt: recordDate });
  }
  
  return records;
};

/**
 * Check if user is close to next level (within 10% or 30 minutes)
 */
export const isNearNextLevel = (currentMinutes: number, nextLevelMinutes: number): boolean => {
  const minutesToGo = nextLevelMinutes - currentMinutes;
  const percentToGo = (minutesToGo / (nextLevelMinutes - (nextLevelMinutes - Math.pow(Math.floor(Math.sqrt(currentMinutes / 60)), 2) * 60))) * 100;
  return minutesToGo <= 30 || percentToGo <= 10;
};

