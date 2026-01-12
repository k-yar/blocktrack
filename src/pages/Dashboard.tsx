import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Area, Block, MonthlyTarget, BlockType, ViewType } from '../types';
import { BLOCK_TYPES } from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, addWeeks, subWeeks, addYears, subYears } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Edit2, Trash2, X, PlusCircle, Save, Copy, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import { addMonths, subMonths } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DashboardStats } from '../components/DashboardStats';

export const Dashboard: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>('month'); // Default to month view
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonthStr = format(currentDate, 'yyyy-MM');
  
  const [areas, setAreas] = useState<Area[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit/Delete state
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editAreaId, setEditAreaId] = useState('');
  const [editBlockType, setEditBlockType] = useState<BlockType>('Deep');
  const [editDuration, setEditDuration] = useState(90);
  const [editNotes, setEditNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log Block modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logAreaId, setLogAreaId] = useState('');
  const [logBlockType, setLogBlockType] = useState<BlockType>('Deep');
  const [logDuration, setLogDuration] = useState(90);
  const [logNotes, setLogNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [viewType, currentDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      let start: string;
      let end: string;
      
      switch (viewType) {
        case 'week':
          start = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          end = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          break;
        case 'month':
          start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
          end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
          break;
        case 'year':
          start = format(startOfYear(currentDate), 'yyyy-MM-dd');
          end = format(endOfYear(currentDate), 'yyyy-MM-dd');
          break;
        case 'all':
          start = '1970-01-01'; // Very early date
          end = format(new Date(), 'yyyy-MM-dd');
          break;
        default:
          start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
          end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      }

      const [areasRes, blocksRes, targetsRes] = await Promise.all([
        supabase.from('areas').select('*').order('display_order', { ascending: true, nullsFirst: false }),
        supabase.from('blocks').select('*').gte('date', start).lte('date', end).order('date', { ascending: false }),
        // Fetch monthly targets for the current month (we'll adapt them for weekly/yearly views)
        supabase.from('monthly_targets').select('*').eq('month', currentMonthStr)
      ]);

      if (areasRes.error) throw areasRes.error;
      if (blocksRes.error) throw blocksRes.error;
      if (targetsRes.error) throw targetsRes.error;

      setAreas(areasRes.data || []);
      setBlocks(blocksRes.data || []);
      setTargets(targetsRes.data || []);
      
      // Set default area for log modal
      if (areasRes.data && areasRes.data.length > 0 && !logAreaId) {
        setLogAreaId(areasRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePeriod = (delta: number) => {
    setCurrentDate((prev: Date) => {
      switch (viewType) {
        case 'week':
          return delta > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1);
        case 'month':
          return delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
        case 'year':
          return delta > 0 ? addYears(prev, 1) : subYears(prev, 1);
        case 'all':
          return prev; // No navigation for all-time view
        default:
          return prev;
      }
    });
  };

  const getPeriodLabel = () => {
    switch (viewType) {
      case 'week':
        const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d');
        const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy');
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleEditClick = (block: Block) => {
    setEditingBlock(block);
    setEditDate(block.date);
    setEditAreaId(block.area_id);
    setEditBlockType(block.block_type);
    setEditDuration(block.duration_minutes);
    setEditNotes(block.notes || '');
  };

  const handleEditCancel = () => {
    setEditingBlock(null);
    setEditDate('');
    setEditAreaId('');
    setEditBlockType('Deep');
    setEditDuration(90);
    setEditNotes('');
  };

  const handleEditTypeChange = (type: BlockType) => {
    setEditBlockType(type);
    switch (type) {
      case 'Deep': setEditDuration(90); break;
      case 'Short': setEditDuration(30); break;
      case 'Micro': setEditDuration(15); break;
      case 'Gym': setEditDuration(60); break;
      case 'Family': setEditDuration(120); break;
    }
  };

  const handleUpdateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock || !editAreaId) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('blocks')
        .update({
          date: editDate,
          area_id: editAreaId,
          block_type: editBlockType,
          duration_minutes: editDuration,
          notes: editNotes.trim() || null
        })
        .eq('id', editingBlock.id);

      if (error) throw error;
      
      // Refresh data
      await fetchDashboardData();
      handleEditCancel();
    } catch (error) {
      console.error('Error updating block:', error);
      alert('Failed to update block');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;

    try {
      const { error } = await supabase.from('blocks').delete().eq('id', blockId);
      if (error) throw error;
      
      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Failed to delete block');
    }
  };

  // Log Block handlers
  const handleLogTypeChange = (type: BlockType) => {
    setLogBlockType(type);
    switch (type) {
      case 'Deep': setLogDuration(90); break;
      case 'Short': setLogDuration(30); break;
      case 'Micro': setLogDuration(15); break;
      case 'Gym': setLogDuration(60); break;
      case 'Family': setLogDuration(120); break;
    }
  };

  const handleOpenLogModal = () => {
    setLogDate(format(new Date(), 'yyyy-MM-dd'));
    if (areas.length > 0 && !logAreaId) {
      setLogAreaId(areas[0].id);
    }
    setLogBlockType('Deep');
    setLogDuration(90);
    setLogNotes('');
    setShowLogModal(true);
  };

  const handleDuplicateBlock = (block: Block) => {
    setLogDate(block.date); // Use the original block's date
    setLogAreaId(block.area_id);
    setLogBlockType(block.block_type);
    setLogDuration(block.duration_minutes);
    setLogNotes(block.notes || '');
    setShowLogModal(true);
  };

  const handleCloseLogModal = () => {
    setShowLogModal(false);
    setLogDate(format(new Date(), 'yyyy-MM-dd'));
    setLogAreaId('');
    setLogBlockType('Deep');
    setLogDuration(90);
    setLogNotes('');
  };

  const handleLogBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAreaId) return;

    try {
      setIsLogging(true);
      const { error } = await supabase.from('blocks').insert([{
        date: logDate,
        area_id: logAreaId,
        block_type: logBlockType,
        duration_minutes: logDuration,
        notes: logNotes.trim() || null
      }]);

      if (error) throw error;
      
      // Refresh data
      await fetchDashboardData();
      handleCloseLogModal();
    } catch (error) {
      console.error('Error logging block:', error);
      alert('Failed to log block');
    } finally {
      setIsLogging(false);
    }
  };

  // Process Data
  // We want to show progress for each Target.
  // Also maybe show Areas that don't have targets but have blocks?
  // Let's iterate over Targets first as they define the goals.

  const getProgress = (areaId: string, blockType: string) => {
    return blocks.filter((b: Block) => b.area_id === areaId && b.block_type === blockType).length;
  };

  const getBlocksForTarget = (areaId: string, blockType: string) => {
    return blocks
      .filter((b: Block) => b.area_id === areaId && b.block_type === blockType)
      .sort((a: Block, b: Block) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
  };

  // Group targets by Area to show them nicely
  const targetsByArea = areas.map((area: Area) => {
    const areaTargets = targets.filter((t: MonthlyTarget) => t.area_id === area.id);
    const areaBlocks = blocks.filter((b: Block) => b.area_id === area.id);
    
    // Calculate stats
    const totalMinutes = areaBlocks.reduce((acc: number, b: Block) => acc + b.duration_minutes, 0);
    const totalBlocks = areaBlocks.length;

    return {
      area,
      targets: areaTargets.map((t: MonthlyTarget) => {
        // Adapt target count based on view type
        let adaptedTargetCount = t.target_count;
        if (viewType === 'week') {
          // Weekly: divide monthly target by 4
          adaptedTargetCount = Math.ceil(t.target_count / 4);
        } else if (viewType === 'year') {
          // Yearly: multiply monthly target by 12
          adaptedTargetCount = t.target_count * 12;
        }
        // For month view, use original target_count

        const completed = getProgress(area.id, t.block_type || '');
        const targetBlocks = getBlocksForTarget(area.id, t.block_type || '');
        return {
          ...t,
          target_count: adaptedTargetCount, // Use adapted target for display
          original_target_count: t.target_count, // Keep original for reference
          completed,
          percentage: Math.min(100, Math.round((completed / adaptedTargetCount) * 100)),
          blocks: targetBlocks
        };
      }),
      totalMinutes,
      totalBlocks
    };
  });

  // Show areas with targets or blocks for all views
  const activeGroups = targetsByArea.filter((g: typeof targetsByArea[0]) => g.targets.length > 0 || g.totalBlocks > 0);

  // Drag and Drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeGroups.findIndex((g: typeof activeGroups[0]) => g.area.id === active.id);
      const newIndex = activeGroups.findIndex((g: typeof activeGroups[0]) => g.area.id === over.id);

      const reorderedGroups = arrayMove(activeGroups, oldIndex, newIndex);
      
      // Update display_order in database
      try {
        const updates = reorderedGroups.map((group: typeof activeGroups[0], index: number) => ({
          id: group.area.id,
          display_order: index,
        }));

        // Update all areas in a batch
        await Promise.all(
          updates.map((update: { id: string; display_order: number }) =>
            supabase
              .from('areas')
              .update({ display_order: update.display_order })
              .eq('id', update.id)
          )
        );

        // Refresh data to get updated order
        await fetchDashboardData();
      } catch (error) {
        console.error('Error updating area order:', error);
        alert('Failed to update area order');
      }
    }
  };

  // Sortable Area Card Component
  const SortableAreaCard: React.FC<{
    group: typeof activeGroups[0];
    viewType: ViewType;
    formatTime: (minutes: number) => string;
  }> = ({ group, formatTime }) => {
    const { area, targets: areaTargets, totalMinutes, totalBlocks } = group;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: area.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className="bg-white shadow sm:rounded-lg overflow-visible">
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
              title="Drag to reorder"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: area.color }} />
            <h4 className="text-lg font-semibold text-gray-900">{area.name}</h4>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(totalMinutes)} total
          </div>
        </div>
        <div className="p-4 space-y-5 overflow-visible">
          {areaTargets.length === 0 && (
            <div className="text-sm text-gray-600">
              <p className="font-medium">Total: {totalBlocks} blocks</p>
              <p className="text-gray-500">{formatTime(totalMinutes)}</p>
            </div>
          )}
          {areaTargets.map((target: typeof areaTargets[0]) => {
            const completedBlocks = (target as any).blocks || [];
            const remainingCount = Math.max(0, target.target_count - target.completed);
            const allBlocks = [
              ...completedBlocks,
              ...Array(remainingCount).fill(null) // Placeholder for remaining blocks
            ];

            return (
              <div key={target.id} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{target.block_type} Blocks</span>
                  <span className={clsx(
                    target.completed >= target.target_count ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {target.completed} / {target.target_count}
                  </span>
                </div>
                {/* GitHub-style block grid */}
                <div className="flex flex-wrap gap-1 relative overflow-visible">
                  {allBlocks.slice(0, target.target_count).map((block: Block | null, index: number) => {
                    const isCompleted = block !== null;
                    const blockDate = block ? format(new Date(block.date), 'MMM d, yyyy') : '';
                    const blockDuration = block ? block.duration_minutes : 0;
                    const blockNotes = block?.notes || '';

                    return (
                      <div
                        key={block ? block.id : `empty-${index}`}
                        className="relative group"
                      >
                        <div
                          className={clsx(
                            "w-3 h-3 rounded-sm transition-all",
                            isCompleted
                              ? "hover:scale-110 cursor-pointer"
                              : "bg-gray-200 hover:bg-gray-300"
                          )}
                          style={isCompleted ? { backgroundColor: '#87FF6C' } : {}}
                          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                            if (isCompleted) {
                              e.currentTarget.style.backgroundColor = '#6EE64D';
                            }
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                            if (isCompleted) {
                              e.currentTarget.style.backgroundColor = '#87FF6C';
                            }
                          }}
                        />
                        {/* Tooltip */}
                        {isCompleted && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[9999] pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-xl whitespace-nowrap min-w-[150px] relative">
                              <div className="font-semibold mb-1 text-white">{blockDate}</div>
                              <div className="text-gray-300">
                                {blockDuration} min • {target.block_type}
                                {blockNotes && (
                                  <div className="mt-1 text-gray-400 italic max-w-xs break-words whitespace-normal">
                                    {blockNotes}
                                  </div>
                                )}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h2>
        <div className="flex items-center space-x-4 flex-wrap">
          {/* View Type Selector */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border overflow-hidden">
            {(['week', 'month', 'year', 'all'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={clsx(
                  'px-3 py-2 text-sm font-medium capitalize transition-colors',
                  viewType === view
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {view === 'all' ? 'All Time' : view}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenLogModal}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Log Block
          </button>

          {/* Period Navigation */}
          {viewType !== 'all' && (
            <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border">
              <button 
                onClick={() => changePeriod(-1)} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-lg min-w-[150px] text-center">{getPeriodLabel()}</span>
              <button 
                onClick={() => changePeriod(1)} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          {viewType === 'all' && (
            <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border">
              <span className="font-medium text-lg px-4">{getPeriodLabel()}</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading stats...</div>
      ) : (
        <>
          <DashboardStats blocks={blocks} areas={areas} viewType={viewType} currentDate={currentDate} />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 overflow-visible">
            {/* Progress Cards */}
            <div className="space-y-6 overflow-visible">
            <h3 className="text-lg font-medium text-gray-900">
              {viewType === 'month' ? 'Monthly Goals' : 
               viewType === 'week' ? 'Weekly Progress' :
               viewType === 'year' ? 'Yearly Progress' : 'All Time Progress'}
            </h3>
            {activeGroups.length === 0 && (
              <p className="text-gray-500">
                {viewType === 'month' ? 'No targets or activity for this month.' :
                 viewType === 'week' ? 'No activity for this week.' :
                 viewType === 'year' ? 'No activity for this year.' : 'No activity recorded yet.'}
              </p>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeGroups.map((g: typeof activeGroups[0]) => g.area.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 overflow-visible">
                  {activeGroups.map((group: typeof activeGroups[0]) => (
                    <SortableAreaCard
                      key={group.area.id}
                      group={group}
                      viewType={viewType}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {blocks.slice(0, 10).map((block: Block) => {
                  const area = areas.find((a: Area) => a.id === block.area_id);
                  return (
                    <li key={block.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 group">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {area?.name || 'Unknown'} <span className="text-gray-400">•</span> {block.block_type}
                          </p>
                          <p className="text-xs text-gray-500">{format(new Date(block.date), 'MMM d, yyyy')} • {block.duration_minutes} min</p>
                          {block.notes && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{block.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: area?.color }} />
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDuplicateBlock(block)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Duplicate block"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(block)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Edit block"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {blocks.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">No blocks logged this month.</li>
                )}
              </ul>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Edit Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Block</h3>
              <button
                onClick={handleEditCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBlock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={editAreaId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditAreaId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  {areas.map((area: Area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {BLOCK_TYPES.map((type) => (
                    <div
                      key={type}
                      className={clsx(
                        'cursor-pointer flex items-center justify-center rounded-md border py-2 text-sm font-medium sm:flex-1',
                        editBlockType === type
                          ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                          : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                      )}
                      onClick={() => handleEditTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDuration(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={editNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Block Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Log Block</h3>
              <button
                onClick={handleCloseLogModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleLogBlock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={logAreaId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLogAreaId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  {areas.map((area: Area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {BLOCK_TYPES.map((type) => (
                    <div
                      key={type}
                      className={clsx(
                        'cursor-pointer flex items-center justify-center rounded-md border py-2 text-sm font-medium sm:flex-1',
                        logBlockType === type
                          ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                          : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                      )}
                      onClick={() => handleLogTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={logDuration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogDuration(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={logNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLogNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseLogModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLogging}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 inline-flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLogging ? 'Saving...' : 'Save Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
