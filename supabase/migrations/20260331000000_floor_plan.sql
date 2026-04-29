ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS floor_plan_url TEXT,
  ADD COLUMN IF NOT EXISTS floor_plan_tables JSONB DEFAULT '[]';
