import React from 'react';
import { Trophy, Flame, Star, Zap } from 'lucide-react';
import clsx from 'clsx';
import { calculateLevel } from '../utils/gamification';
import { getLevelTitle, isNearNextLevel } from '../utils/achievements';

interface GamificationHeaderProps {
  totalMinutes: number;
  streak: number;
  onAchievementsClick?: () => void;
  unlockedAchievementsCount?: number;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({ 
  totalMinutes, 
  streak, 
  onAchievementsClick,
  unlockedAchievementsCount = 0
}) => {
  const { level, progressPercent, minutesToNextLevel, nextLevelXP } = calculateLevel(totalMinutes);
  const levelTitle = getLevelTitle(level);
  const isNear = isNearNextLevel(totalMinutes, nextLevelXP);
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Level & Progress */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Current Level</span>
                <div className="text-2xl font-bold">Level {level} • {levelTitle}</div>
              </div>
            </div>
            <div className="text-right">
              {isNear && minutesToNextLevel > 0 ? (
                <span className="text-sm font-bold text-yellow-300 animate-pulse">
                  ⚡ Only {minutesToNextLevel} mins to Level {level + 1}!
                </span>
              ) : (
                <span className="text-sm font-medium opacity-90">{minutesToNextLevel} mins to next level</span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm relative overflow-hidden">
            <div 
              className={clsx(
                "h-3 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out",
                isNear ? "bg-yellow-300 animate-pulse" : "bg-yellow-400"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-4 md:border-l md:border-white/20 md:pl-6">
          
          {/* Streak */}
          <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg min-w-[100px] backdrop-blur-sm">
            <Flame className={clsx("w-6 h-6 mb-1", streak > 0 ? "text-orange-400" : "text-gray-400")} />
            <span className="text-2xl font-bold">{streak}</span>
            <span className="text-xs opacity-70">Day Streak</span>
          </div>

          {/* Total XP (Hours) */}
          <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg min-w-[100px] backdrop-blur-sm">
            <Zap className="w-6 h-6 mb-1 text-blue-300" />
            <span className="text-2xl font-bold">{Math.floor(totalMinutes / 60)}</span>
            <span className="text-xs opacity-70">Total Hours</span>
          </div>

          {/* Achievements Button */}
          {onAchievementsClick && (
            <button
              onClick={onAchievementsClick}
              className="flex flex-col items-center p-3 bg-white/10 rounded-lg min-w-[100px] backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer relative"
            >
              <Trophy className="w-6 h-6 mb-1 text-yellow-300" />
              <span className="text-2xl font-bold">{unlockedAchievementsCount}</span>
              <span className="text-xs opacity-70">Achievements</span>
              {unlockedAchievementsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unlockedAchievementsCount}
                </span>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

