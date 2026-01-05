import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Area, BlockType } from '../types';
import { BLOCK_TYPES } from '../types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import clsx from 'clsx';

export const LogBlock: React.FC = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('Deep');
  const [duration, setDuration] = useState(90);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase.from('areas').select('*').order('display_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setAreas(data || []);
      if (data && data.length > 0) {
        setSelectedAreaId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: BlockType) => {
    setBlockType(type);
    switch (type) {
      case 'Deep': setDuration(90); break;
      case 'Short': setDuration(30); break;
      case 'Micro': setDuration(15); break;
      case 'Gym': setDuration(60); break;
      case 'Family': setDuration(120); break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('blocks').insert([{
        date,
        area_id: selectedAreaId,
        block_type: blockType,
        duration_minutes: duration,
        notes: notes.trim() || null
      }]);

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging block:', error);
      alert('Failed to log block');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading areas...</div>;
  if (areas.length === 0) return (
    <div className="p-6 text-center">
      <p className="mb-4">No areas found. Please create an area first.</p>
      <button 
        onClick={() => navigate('/areas')}
        className="text-indigo-600 hover:text-indigo-500 font-medium"
      >
        Go to Areas
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Log Block
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area</label>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Block Type</label>
          <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {BLOCK_TYPES.map((type) => (
              <div
                key={type}
                className={clsx(
                  'cursor-pointer flex items-center justify-center rounded-md border py-3 text-sm font-medium sm:flex-1',
                  blockType === type
                    ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                    : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                )}
                onClick={() => handleTypeChange(type)}
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Block
          </button>
        </div>
      </form>
    </div>
  );
};
