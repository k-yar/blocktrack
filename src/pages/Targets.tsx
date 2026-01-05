import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Area, BlockType, MonthlyTarget } from '../types';
import { BLOCK_TYPES, PRESET_COLORS } from '../types';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import clsx from 'clsx';

export const Targets: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState('');
  const [editAreaColor, setEditAreaColor] = useState('');
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetCount, setEditTargetCount] = useState(0);

  // Add new area
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState(PRESET_COLORS[0]);
  const [isAddingArea, setIsAddingArea] = useState(false);

  // Add new target
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('Deep');
  const [targetCount, setTargetCount] = useState(10);
  const [isAddingTarget, setIsAddingTarget] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasRes, targetsRes] = await Promise.all([
        supabase.from('areas').select('*').order('display_order', { ascending: true, nullsFirst: false }),
        supabase.from('monthly_targets').select('*').eq('month', currentMonth)
      ]);

      if (areasRes.error) throw areasRes.error;
      if (targetsRes.error) throw targetsRes.error;

      setAreas(areasRes.data || []);
      setTargets(targetsRes.data || []);
      if (areasRes.data && areasRes.data.length > 0 && !selectedAreaId) {
        setSelectedAreaId(areasRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const date = new Date(currentMonth + '-01');
    const newDate = delta > 0 ? addMonths(date, 1) : subMonths(date, 1);
    setCurrentMonth(format(newDate, 'yyyy-MM'));
  };

  // Area management
  const handleEditAreaClick = (area: Area) => {
    setEditingAreaId(area.id);
    setEditAreaName(area.name);
    setEditAreaColor(area.color);
  };

  const handleCancelEditArea = () => {
    setEditingAreaId(null);
    setEditAreaName('');
    setEditAreaColor('');
  };

  const handleSaveArea = async (areaId: string) => {
    if (!editAreaName.trim()) return;

    try {
      const { error } = await supabase
        .from('areas')
        .update({ name: editAreaName.trim(), color: editAreaColor })
        .eq('id', areaId);

      if (error) throw error;
      await fetchData();
      handleCancelEditArea();
    } catch (error) {
      console.error('Error updating area:', error);
      alert('Error updating area');
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    try {
      setIsAddingArea(true);
      // Get max display_order and add 1 for new area
      const maxOrder = areas.length > 0 
        ? Math.max(...areas.map(a => a.display_order || 0))
        : -1;
      
      const { error } = await supabase
        .from('areas')
        .insert([{ 
          name: newAreaName.trim(), 
          color: newAreaColor,
          display_order: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchData(); // Refresh to get updated order
      setNewAreaName('');
      setNewAreaColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error('Error adding area:', error);
      alert('Error adding area');
    } finally {
      setIsAddingArea(false);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!window.confirm('Are you sure? This will delete all blocks and targets associated with this area.')) return;

    try {
      const { error } = await supabase.from('areas').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting area:', error);
      alert('Error deleting area');
    }
  };

  // Target management
  const handleEditTargetClick = (target: MonthlyTarget) => {
    setEditingTargetId(target.id);
    setEditTargetCount(target.target_count);
  };

  const handleCancelEditTarget = () => {
    setEditingTargetId(null);
    setEditTargetCount(0);
  };

  const handleSaveTarget = async (targetId: string) => {
    if (editTargetCount < 1) return;

    try {
      const { error } = await supabase
        .from('monthly_targets')
        .update({ target_count: editTargetCount })
        .eq('id', targetId);

      if (error) throw error;
      await fetchData();
      handleCancelEditTarget();
    } catch (error) {
      console.error('Error updating target:', error);
      alert('Error updating target');
    }
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) return;

    try {
      setIsAddingTarget(true);
      const existing = targets.find(t => t.area_id === selectedAreaId && t.block_type === selectedBlockType);
      
      if (existing) {
        const { error } = await supabase
          .from('monthly_targets')
          .update({ target_count: targetCount })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monthly_targets')
          .insert([{
            month: currentMonth,
            area_id: selectedAreaId,
            block_type: selectedBlockType,
            target_count: targetCount
          }]);
        if (error) throw error;
      }
      await fetchData();
      setTargetCount(10);
    } catch (error) {
      console.error('Error saving target:', error);
      alert('Error saving target');
    } finally {
      setIsAddingTarget(false);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (!window.confirm('Delete this target?')) return;
    try {
      const { error } = await supabase.from('monthly_targets').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting target:', error);
    }
  };

  const getAreaTargets = (areaId: string) => {
    return targets.filter(t => t.area_id === areaId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Areas & Monthly Targets
          </h2>
          <p className="mt-1 text-sm text-gray-500">Set monthly targets for each area. Targets are set per month.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-lg min-w-[100px] text-center">{currentMonth}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add New Area */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Area</h3>
        <p className="text-sm text-gray-500 mb-4">Create areas to track different aspects of your life (e.g., Startup, Religion, Gym).</p>
        <form onSubmit={handleAddArea} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Area name (e.g. Startup, Religion)"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.slice(0, 10).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewAreaColor(c)}
                  className={clsx(
                    'w-8 h-8 rounded-full border-2 focus:outline-none',
                    newAreaColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isAddingArea}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-4">
          {areas.map((area) => {
            const areaTargets = getAreaTargets(area.id);
            const isEditing = editingAreaId === area.id;

            return (
              <div key={area.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                {/* Area Header */}
                <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-wrap gap-2">
                          {PRESET_COLORS.slice(0, 10).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditAreaColor(c)}
                              className={clsx(
                                'w-6 h-6 rounded-full border-2 focus:outline-none',
                                editAreaColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editAreaName}
                          onChange={(e) => setEditAreaName(e.target.value)}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveArea(area.id)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditArea}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                        <button
                          onClick={() => handleEditAreaClick(area)}
                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit area"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete area"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Targets for this area */}
                <div className="p-4">
                  {areaTargets.length === 0 ? (
                    <p className="text-sm text-gray-400 italic mb-3">No monthly targets set for {currentMonth}</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {areaTargets.map((target) => {
                        const isEditingTarget = editingTargetId === target.id;
                        return (
                          <div key={target.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            {isEditingTarget ? (
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm text-gray-700 min-w-[80px]">{target.block_type}:</span>
                                <input
                                  type="number"
                                  value={editTargetCount}
                                  onChange={(e) => setEditTargetCount(Number(e.target.value))}
                                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                                  min="1"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveTarget(target.id)}
                                  className="p-1 text-green-600 hover:text-green-700"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEditTarget}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{target.block_type}</span>
                                <span className="text-sm text-gray-500">→</span>
                                <span className="text-sm text-gray-700">{target.target_count} blocks/month</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditTargetClick(target)}
                                    className="p-1 text-gray-400 hover:text-indigo-600"
                                    title="Edit target"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTarget(target.id)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    title="Delete target"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Monthly Target Form */}
                  <form onSubmit={handleAddTarget} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                    <select
                      value={selectedBlockType}
                      onChange={(e) => setSelectedBlockType(e.target.value as BlockType)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                      {BLOCK_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Number(e.target.value))}
                      min="1"
                      placeholder="Monthly target"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <button
                      type="submit"
                      disabled={isAddingTarget || selectedAreaId !== area.id}
                      onClick={() => setSelectedAreaId(area.id)}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Monthly Target
                    </button>
                  </form>
                </div>
              </div>
            );
          })}

          {areas.length === 0 && (
            <div className="bg-white shadow sm:rounded-lg p-8 text-center text-gray-500">
              No areas found. Add one above to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
