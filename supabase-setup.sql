-- BlockTrack Database Setup
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- 1. Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('Deep', 'Short', 'Micro', 'Gym', 'Family')),
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create monthly_targets table
CREATE TABLE IF NOT EXISTS monthly_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'), -- Format: YYYY-MM
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  block_type TEXT CHECK (block_type IN ('Deep', 'Short', 'Micro', 'Gym', 'Family')),
  target_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, area_id, block_type) -- One target per month/area/block_type combination
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public access (since this is a personal app)
-- For areas table
CREATE POLICY "Allow public read access on areas"
  ON areas FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on areas"
  ON areas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on areas"
  ON areas FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on areas"
  ON areas FOR DELETE
  USING (true);

-- For blocks table
CREATE POLICY "Allow public read access on blocks"
  ON blocks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on blocks"
  ON blocks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on blocks"
  ON blocks FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on blocks"
  ON blocks FOR DELETE
  USING (true);

-- For monthly_targets table
CREATE POLICY "Allow public read access on monthly_targets"
  ON monthly_targets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on monthly_targets"
  ON monthly_targets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on monthly_targets"
  ON monthly_targets FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on monthly_targets"
  ON monthly_targets FOR DELETE
  USING (true);

-- 6. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blocks_date ON blocks(date);
CREATE INDEX IF NOT EXISTS idx_blocks_area_id ON blocks(area_id);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_month ON monthly_targets(month);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_area_id ON monthly_targets(area_id);
CREATE INDEX IF NOT EXISTS idx_areas_display_order ON areas(display_order);

-- 7. Optional: Insert some sample areas (you can delete these later)
-- INSERT INTO areas (name, color, display_order) VALUES
--   ('Startup', '#3b82f6', 1),
--   ('Religion', '#10b981', 2),
--   ('German', '#f59e0b', 3);



