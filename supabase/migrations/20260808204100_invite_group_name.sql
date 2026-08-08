-- Optional seating group label for invites (e.g. "Bride's family", "College friends").
-- Used by CSV import and auto-seat packing.
ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS group_name TEXT;
