export interface Area {
  id: string;
  name: string;
  color: string;
  display_order?: number;
  created_at?: string;
}

export interface Block {
  id: string;
  date: string;
  area_id: string;
  block_type: BlockType;
  duration_minutes: number;
  notes?: string;
  created_at?: string;
}

export type BlockType = 'Deep' | 'Short' | 'Micro' | 'Gym' | 'Family';

export interface MonthlyTarget {
  id: string;
  month: string; // YYYY-MM
  area_id: string;
  block_type?: BlockType;
  target_count: number;
  created_at?: string;
}

export const BLOCK_TYPES: BlockType[] = ['Deep', 'Short', 'Micro', 'Gym', 'Family'];

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
  '#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#047857', '#0e7490', '#1d4ed8', '#4338ca', '#6d28d9', '#be185d',
  '#fee2e2', '#ffedd5', '#fef3c7', '#ecfccb', '#d1fae5', '#cffafe', '#dbeafe', '#e0e7ff', '#ede9fe', '#fae8ff', '#ffe4e6'
];

export type ViewType = 'week' | 'month' | 'year' | 'all';

