import React, { useState, useEffect } from 'react';
import { Trophy, Award, Sparkles, X } from 'lucide-react';
import type { Achievement } from '../utils/achievements';
import confetti from 'canvas-confetti';
import clsx from 'clsx';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const rarityColors = {
    common: 'bg-gray-100 border-gray-300 text-gray-700',
    rare: 'bg-blue-50 border-blue-300 text-blue-700',
    epic: 'bg-purple-50 border-purple-300 text-purple-700',
    legendary: 'bg-yellow-50 border-yellow-400 text-yellow-800'
  };

  return (
    <div className={clsx(
      'p-3 rounded-lg border-2 flex items-center space-x-3 transition-all',
      achievement.unlocked 
        ? rarityColors[achievement.rarity]
        : 'bg-gray-50 border-gray-200 opacity-50'
    )}>
      <span className="text-2xl">{achievement.icon}</span>
      <div className="flex-1">
        <div className="font-semibold text-sm">{achievement.name}</div>
        <div className="text-xs opacity-70">{achievement.description}</div>
      </div>
      {achievement.unlocked && (
        <Award className="w-5 h-5 text-yellow-500" />
      )}
    </div>
  );
};

interface AchievementsPanelProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements, isOpen, onClose }) => {
  if (!isOpen) return null;

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  const byRarity = {
    common: unlocked.filter(a => a.rarity === 'common'),
    rare: unlocked.filter(a => a.rarity === 'rare'),
    epic: unlocked.filter(a => a.rarity === 'epic'),
    legendary: unlocked.filter(a => a.rarity === 'legendary')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            <span className="text-sm text-gray-500">
              {unlocked.length} / {achievements.length} unlocked
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">{byRarity.common.length}</div>
              <div className="text-xs text-gray-600">Common</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{byRarity.rare.length}</div>
              <div className="text-xs text-blue-700">Rare</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{byRarity.epic.length}</div>
              <div className="text-xs text-purple-700">Epic</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{byRarity.legendary.length}</div>
              <div className="text-xs text-yellow-700">Legendary</div>
            </div>
          </div>

          {/* Unlocked Achievements */}
          {unlocked.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Unlocked</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlocked.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {locked.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Locked</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locked.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Show level-up celebration with confetti
 */
export const celebrateLevelUp = (newLevel: number, previousLevel: number) => {
  if (newLevel > previousLevel) {
    // Epic confetti burst
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    });
    
    // Additional bursts
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF6B6B']
      });
    }, 250);
    
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4ECDC4', '#45B7D1']
      });
    }, 400);
  }
};

