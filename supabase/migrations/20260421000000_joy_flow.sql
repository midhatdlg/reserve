-- Joy-style invite flow migration
--
-- Adds the columns and constraints required by the slug-based, name-match
-- RSVP experience. Kept additive: existing invite tokens stay valid so
-- dashboards and reminder emails keep working during rollout.
--
-- Changes:
--   1. weddings.strict_name_match boolean (default true) — gate RSVP to
--      names present on the guest list.
--   2. weddings.timezone text (default 'Europe/London') — used by countdown
--      + .ics generation so display/calendar dates match the venue's clock.
--   3. questions.author_name / author_email text — lets an unknown guest
--      "message the couple" without having an invites row.
--   4. questions.is_public default flips to false (moderation-first). Existing
--      rows keep their value; only inserts that don't specify get the new
--      default.
--   5. invites.max_guests CHECK relaxed from 1..10 to 1..20 to cover large
--      families and group invites.
--   6. Case-insensitive functional index on (wedding_id, lower(guest_name))
--      to make the name-lookup endpoint fast.
--
-- All changes are idempotent where feasible so reruns during local dev are
-- safe.

BEGIN;

-- 1 & 2: weddings toggles ------------------------------------------------------
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS strict_name_match BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/London';

-- 3: question author fields ---------------------------------------------------
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_email TEXT;

-- 4: moderation default -------------------------------------------------------
ALTER TABLE questions ALTER COLUMN is_public SET DEFAULT false;

-- 5: relax invites.max_guests CHECK ------------------------------------------
-- Postgres doesn't let us alter a CHECK in place; drop + recreate.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'invites'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%max_guests%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE invites DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE invites
  ADD CONSTRAINT invites_max_guests_check
  CHECK (max_guests BETWEEN 1 AND 20);

-- 6: name-lookup index --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invites_wedding_guest_ci
  ON invites (wedding_id, lower(guest_name));

COMMIT;
