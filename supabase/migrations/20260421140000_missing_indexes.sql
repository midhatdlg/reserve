-- Indexes for foreign-key columns used in RLS subqueries. Without these,
-- the anon-read policies on events/photos/questions do sequential scans.

CREATE INDEX IF NOT EXISTS idx_events_wedding_id ON events (wedding_id);
CREATE INDEX IF NOT EXISTS idx_photos_wedding_id ON photos (wedding_id);
CREATE INDEX IF NOT EXISTS idx_questions_wedding_id ON questions (wedding_id);
