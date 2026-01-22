import React, { useState } from 'react';
import { Target, CheckCircle2, TrendingUp, ChevronDown, ChevronUp, Layers, Grid3x3 } from 'lucide-react';
import clsx from 'clsx';
import type { Block, MonthlyTarget, ViewType, Area, BlockType } from '../types';
import { BLOCK_TYPES } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface GlobalProgressProps {
  blocks: Block[];
  targets: MonthlyTarget[];
  areas: Area[];
  viewType: ViewType;
  currentDate: Date;
}

export const GlobalProgress: React.FC<GlobalProgressProps> = ({ 
  blocks, 
  targets, 
  areas,
  viewType, 
  currentDate 
}) => {
  const [showByArea, setShowByArea] = useState(false);
  const [showByBlockType, setShowByBlockType] = useState(false);
  const [showByCombination, setShowByCombination] = useState(false);
  // Calculate total targets and completed blocks for the current period
  let totalTargetBlocks = 0;
  let totalCompletedBlocks = 0;

  // Adapt targets based on view type
  targets.forEach((target) => {
    let adaptedTargetCount = target.target_count;
    
    if (viewType === 'week') {
      // Weekly: divide monthly target by 4
      adaptedTargetCount = Math.ceil(target.target_count / 4);
    } else if (viewType === 'year') {
      // Yearly: multiply monthly target by 12
      adaptedTargetCount = target.target_count * 12;
    }
    // For month view, use original target_count

    totalTargetBlocks += adaptedTargetCount;
    
    // Count completed blocks for this target
    const completed = blocks.filter(
      (b) => b.area_id === target.area_id && b.block_type === target.block_type
    ).length;
    
    totalCompletedBlocks += Math.min(completed, adaptedTargetCount); // Cap at target
  });

  const remainingBlocks = Math.max(0, totalTargetBlocks - totalCompletedBlocks);
  const completionPercent = totalTargetBlocks > 0 
    ? Math.min(100, Math.round((totalCompletedBlocks / totalTargetBlocks) * 100))
    : 0;

  // Get period label
  const getPeriodLabel = () => {
    switch (viewType) {
      case 'week':
        const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d');
        const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d');
        return `${weekStart} - ${weekEnd}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      case 'all':
        return 'All Time';
      default:
        return '';
    }
  };

  // Calculate progress by area
  const progressByArea = areas.map((area) => {
    const areaTargets = targets.filter(t => t.area_id === area.id);
    let areaTargetCount = 0;
    let areaCompleted = 0;

    areaTargets.forEach((target) => {
      let adaptedTargetCount = target.target_count;
      if (viewType === 'week') {
        adaptedTargetCount = Math.ceil(target.target_count / 4);
      } else if (viewType === 'year') {
        adaptedTargetCount = target.target_count * 12;
      }

      areaTargetCount += adaptedTargetCount;
      const completed = blocks.filter(
        (b) => b.area_id === target.area_id && b.block_type === target.block_type
      ).length;
      areaCompleted += Math.min(completed, adaptedTargetCount);
    });

    const areaPercent = areaTargetCount > 0 
      ? Math.min(100, Math.round((areaCompleted / areaTargetCount) * 100))
      : 0;

    return {
      area,
      targetCount: areaTargetCount,
      completed: areaCompleted,
      remaining: Math.max(0, areaTargetCount - areaCompleted),
      percent: areaPercent
    };
  }).filter(item => item.targetCount > 0);

  // Calculate progress by block type
  const progressByBlockType = BLOCK_TYPES.map((blockType) => {
    const typeTargets = targets.filter(t => t.block_type === blockType);
    let typeTargetCount = 0;
    let typeCompleted = 0;

    typeTargets.forEach((target) => {
      let adaptedTargetCount = target.target_count;
      if (viewType === 'week') {
        adaptedTargetCount = Math.ceil(target.target_count / 4);
      } else if (viewType === 'year') {
        adaptedTargetCount = target.target_count * 12;
      }

      typeTargetCount += adaptedTargetCount;
      const completed = blocks.filter(
        (b) => b.area_id === target.area_id && b.block_type === target.block_type
      ).length;
      typeCompleted += Math.min(completed, adaptedTargetCount);
    });

    const typePercent = typeTargetCount > 0 
      ? Math.min(100, Math.round((typeCompleted / typeTargetCount) * 100))
      : 0;

    return {
      blockType,
      targetCount: typeTargetCount,
      completed: typeCompleted,
      remaining: Math.max(0, typeTargetCount - typeCompleted),
      percent: typePercent
    };
  }).filter(item => item.targetCount > 0);

  // Calculate progress by area + block type combination
  const progressByCombination = targets.map((target) => {
    const area = areas.find(a => a.id === target.area_id);
    if (!area || !target.block_type) return null;

    let adaptedTargetCount = target.target_count;
    if (viewType === 'week') {
      adaptedTargetCount = Math.ceil(target.target_count / 4);
    } else if (viewType === 'year') {
      adaptedTargetCount = target.target_count * 12;
    }

    const completed = blocks.filter(
      (b) => b.area_id === target.area_id && b.block_type === target.block_type
    ).length;

    const comboPercent = adaptedTargetCount > 0 
      ? Math.min(100, Math.round((Math.min(completed, adaptedTargetCount) / adaptedTargetCount) * 100))
      : 0;

    return {
      area,
      blockType: target.block_type,
      targetCount: adaptedTargetCount,
      completed: Math.min(completed, adaptedTargetCount),
      remaining: Math.max(0, adaptedTargetCount - completed),
      percent: comboPercent
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  // Don't show if no targets or if viewing "all" time (targets are period-specific)
  if (targets.length === 0 || totalTargetBlocks === 0 || viewType === 'all') {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Global Progress</h3>
            <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-600">{completionPercent}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-white/60 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
              completionPercent >= 100 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-gradient-to-r from-indigo-500 to-purple-500"
            )}
            style={{ width: `${completionPercent}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-2xl font-bold text-gray-900">{totalCompletedBlocks}</span>
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-2xl font-bold text-gray-900">{remainingBlocks}</span>
          </div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-600 mr-1" />
            <span className="text-2xl font-bold text-gray-900">{totalTargetBlocks}</span>
          </div>
          <div className="text-xs text-gray-600">Total Target</div>
        </div>
      </div>

      {/* Granular Breakdown Sections */}
      <div className="mt-6 space-y-4">
        {/* By Area */}
        {progressByArea.length > 0 && (
          <div className="bg-white/40 rounded-lg p-4 backdrop-blur-sm">
            <button
              onClick={() => setShowByArea(!showByArea)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">By Area</span>
                <span className="text-sm text-gray-500">({progressByArea.length})</span>
              </div>
              {showByArea ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showByArea && (
              <div className="mt-4 space-y-3">
                {progressByArea.map((item) => (
                  <div key={item.area.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.area.color }}
                        />
                        <span className="font-medium text-gray-900">{item.area.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={clsx(
                          "h-2 rounded-full transition-all duration-500",
                          item.percent >= 100 ? "bg-green-500" : "bg-indigo-500"
                        )}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{item.completed} / {item.targetCount} completed</span>
                      <span>{item.remaining} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* By Block Type */}
        {progressByBlockType.length > 0 && (
          <div className="bg-white/40 rounded-lg p-4 backdrop-blur-sm">
            <button
              onClick={() => setShowByBlockType(!showByBlockType)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <Grid3x3 className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">By Block Type</span>
                <span className="text-sm text-gray-500">({progressByBlockType.length})</span>
              </div>
              {showByBlockType ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showByBlockType && (
              <div className="mt-4 space-y-3">
                {progressByBlockType.map((item) => (
                  <div key={item.blockType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{item.blockType}</span>
                      <span className="text-sm font-semibold text-purple-600">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={clsx(
                          "h-2 rounded-full transition-all duration-500",
                          item.percent >= 100 ? "bg-green-500" : "bg-purple-500"
                        )}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{item.completed} / {item.targetCount} completed</span>
                      <span>{item.remaining} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* By Area + Block Type Combination */}
        {progressByCombination.length > 0 && (
          <div className="bg-white/40 rounded-lg p-4 backdrop-blur-sm">
            <button
              onClick={() => setShowByCombination(!showByCombination)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">By Area & Block Type</span>
                <span className="text-sm text-gray-500">({progressByCombination.length})</span>
              </div>
              {showByCombination ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showByCombination && (
              <div className="mt-4 space-y-3">
                {progressByCombination.map((item, index) => (
                  <div key={`${item.area.id}-${item.blockType}-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.area.color }}
                        />
                        <span className="font-medium text-gray-900">
                          {item.area.name} • {item.blockType}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={clsx(
                          "h-2 rounded-full transition-all duration-500",
                          item.percent >= 100 ? "bg-green-500" : "bg-orange-500"
                        )}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{item.completed} / {item.targetCount} completed</span>
                      <span>{item.remaining} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

