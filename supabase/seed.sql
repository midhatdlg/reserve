-- Test/dev seed data for the Joy-style invite flow.
-- Applied automatically on `supabase db reset` thanks to
-- [db.seed].sql_paths in supabase/config.toml.
--
-- Fixture layout:
--   couple        test@example.com
--   wedding       slug='ada-and-ben', published, strict match ON
--   invites       solo (Chris Smith), couple (Dana Lee / Eli Tan, max_guests 2),
--                 family of four (Frankie Park, max_guests 4),
--                 duplicate name (Chris Smith #2 w/ email tiebreaker),
--                 declined guest (Gwen Reed)
--   events        2 itinerary rows
--   photos        2 photos
--   question      1 public, answered FAQ
--   unpublished   second wedding with slug='unpublished' to test 404

BEGIN;

-- Wipe existing test data so the seed is idempotent. The initial migration
-- defines couples.id as auth.uid() default; seed rows get explicit ids so we
-- can reference them without an auth session.
DELETE FROM couples WHERE email IN ('test@example.com');

INSERT INTO couples (id, email, name_1, name_2, plan_tier)
VALUES ('11111111-1111-1111-1111-111111111111', 'test@example.com', 'Ada', 'Ben', 'standard');

INSERT INTO weddings (id, couple_id, slug, title, wedding_date, venue_name, venue_address, template_id, selected_blocks, is_published, save_the_date_mode, envelope_enabled, envelope_initials, timezone, meal_options, strict_name_match)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'ada-and-ben',
  'Ada & Ben',
  '2026-09-12',
  'The Old Barn',
  '1 High Street, Bath, UK',
  'heritage',
  ARRAY['countdown','rsvp','table','itinerary','qna','photos','map'],
  true,
  false,
  true,
  'A & B',
  'Europe/London',
  ARRAY['Beef','Fish','Vegetarian','Vegan'],
  true
);

INSERT INTO weddings (id, couple_id, slug, title, wedding_date, is_published, strict_name_match, timezone)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'unpublished',
  'Secret',
  '2027-01-01',
  false,
  true,
  'Europe/London'
);

-- Invites -----------------------------------------------------------------
INSERT INTO invites (id, wedding_id, token, guest_name, max_guests, table_number, table_name, email, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'tok_solo',      'Chris Smith',  1, 3,  'Magnolia', 'chris@example.com',    'pending'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'tok_couple',    'Dana Lee',     2, 5,  'Ivy',      'dana@example.com',     'pending'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'tok_family',    'Frankie Park', 4, 7,  'Oak',      'frankie@example.com',  'pending'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'tok_dup',       'Chris Smith',  1, 3,  'Magnolia', 'chris2@example.com',   'pending'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'tok_declined',  'Gwen Reed',    1, NULL, NULL,     'gwen@example.com',     'declined');

INSERT INTO rsvps (invite_id, wedding_id, person_name, attending, meal_preference, dietary_notes)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Gwen Reed', false, NULL, NULL);

-- Events ------------------------------------------------------------------
INSERT INTO events (wedding_id, name, event_type, start_time, end_time, location, sort_order)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Ceremony', 'ceremony', '2026-09-12T14:00:00+01:00', '2026-09-12T15:00:00+01:00', 'Chapel', 1),
  ('22222222-2222-2222-2222-222222222222', 'Reception', 'reception', '2026-09-12T17:00:00+01:00', '2026-09-12T23:00:00+01:00', 'The Old Barn', 2);

-- Photos ------------------------------------------------------------------
INSERT INTO photos (wedding_id, image_url, caption, sort_order)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'https://placehold.co/600x400.jpg?text=1', 'Engagement', 1),
  ('22222222-2222-2222-2222-222222222222', 'https://placehold.co/600x400.jpg?text=2', 'Proposal', 2);

-- Questions ---------------------------------------------------------------
INSERT INTO questions (wedding_id, question_text, answer_text, is_pinned, is_public)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Is there parking at the venue?', 'Yes, free on-site parking is available.', true, true);

COMMIT;
