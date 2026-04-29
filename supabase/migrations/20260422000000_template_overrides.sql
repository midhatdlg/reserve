-- Font/style overrides per template zone (couple_names, date, venue)
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS template_overrides JSONB NOT NULL DEFAULT '{}';
