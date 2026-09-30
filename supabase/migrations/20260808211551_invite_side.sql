-- Required wedding-party side for seating zones (bride vs groom).
ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS side TEXT
  CHECK (side IS NULL OR side IN ('bride', 'groom'));
