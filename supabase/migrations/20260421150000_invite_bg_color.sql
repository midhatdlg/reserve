-- Per-wedding invite page background color
--
-- Lets couples pick the background color that fills the invite page wrapper
-- and the envelope animation overlay. First-class column (rather than
-- buried in settings JSONB) so it's queryable and type-safe in the UI.

ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS invite_bg_color TEXT NOT NULL DEFAULT '#F5F0E8';
