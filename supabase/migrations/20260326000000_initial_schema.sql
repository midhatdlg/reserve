-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Tables ────────────────────────────────────────────────────────────────────

-- Couples (authenticated users)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  name_1 TEXT NOT NULL,
  name_2 TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'standard', 'premium')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weddings
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  wedding_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat FLOAT,
  venue_lng FLOAT,
  template_id TEXT DEFAULT 'heritage',
  custom_design_url TEXT,
  design_zones JSONB DEFAULT '[]',
  selected_blocks TEXT[] DEFAULT ARRAY['rsvp','itinerary','table','qna'],
  languages TEXT[] DEFAULT ARRAY['en'],
  is_published BOOLEAN DEFAULT false,
  -- Save the Date mode
  save_the_date_mode BOOLEAN DEFAULT false,
  -- Envelope animation
  envelope_enabled BOOLEAN DEFAULT true,
  envelope_wax_color TEXT DEFAULT '#799D7F',
  envelope_initials TEXT,
  -- Settings
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events (itinerary items)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invites (each gets a unique token + guest allocation)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  guest_name TEXT NOT NULL,
  max_guests INT NOT NULL DEFAULT 1 CHECK (max_guests BETWEEN 1 AND 10),
  table_number INT,
  table_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'declined')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RSVPs (one per person within an invite)
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES invites(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT true,
  meal_preference TEXT,
  dietary_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions (guest Q&A)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  invite_id UUID REFERENCES invites(id),
  question_text TEXT NOT NULL,
  answer_text TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photos (engagement shoot gallery)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Wedding stats (materialized counts, updated via triggers)
CREATE TABLE wedding_stats (
  wedding_id UUID PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE,
  total_invites INT DEFAULT 0,
  total_seats INT DEFAULT 0,
  attending INT DEFAULT 0,
  declined INT DEFAULT 0,
  pending INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX idx_invite_token ON invites(token);
CREATE INDEX idx_invite_wedding_id ON invites(wedding_id);
CREATE INDEX idx_rsvp_invite_id ON rsvps(invite_id);
CREATE INDEX idx_rsvp_wedding_id ON rsvps(wedding_id);
CREATE INDEX idx_events_wedding_id ON events(wedding_id);
CREATE INDEX idx_questions_wedding_id ON questions(wedding_id);
CREATE INDEX idx_photos_wedding_id ON photos(wedding_id);
CREATE INDEX idx_weddings_couple_id ON weddings(couple_id);
CREATE INDEX idx_weddings_slug ON weddings(slug);

-- ── Trigger: auto-create wedding_stats row on new wedding ─────────────────────

CREATE OR REPLACE FUNCTION create_wedding_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wedding_stats (wedding_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_wedding_created
  AFTER INSERT ON weddings
  FOR EACH ROW EXECUTE FUNCTION create_wedding_stats();

-- ── Trigger: update attending/declined/pending on RSVP changes ────────────────

CREATE OR REPLACE FUNCTION update_rsvp_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  v_wedding_id := COALESCE(NEW.wedding_id, OLD.wedding_id);

  UPDATE wedding_stats
  SET
    attending = (
      SELECT COUNT(*) FROM rsvps
      WHERE wedding_id = v_wedding_id AND attending = true
    ),
    declined = (
      SELECT COUNT(*) FROM rsvps
      WHERE wedding_id = v_wedding_id AND attending = false
    ),
    pending = (
      SELECT COUNT(DISTINCT i.id)
      FROM invites i
      WHERE i.wedding_id = v_wedding_id
        AND i.status = 'pending'
    ),
    updated_at = now()
  WHERE wedding_id = v_wedding_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rsvp_change
  AFTER INSERT OR UPDATE OR DELETE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_rsvp_stats();

-- ── Trigger: update total_invites/total_seats on invite changes ───────────────

CREATE OR REPLACE FUNCTION update_invite_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  v_wedding_id := COALESCE(NEW.wedding_id, OLD.wedding_id);

  UPDATE wedding_stats
  SET
    total_invites = (
      SELECT COUNT(*) FROM invites
      WHERE wedding_id = v_wedding_id
    ),
    total_seats = (
      SELECT COALESCE(SUM(max_guests), 0) FROM invites
      WHERE wedding_id = v_wedding_id
    ),
    pending = (
      SELECT COUNT(*) FROM invites
      WHERE wedding_id = v_wedding_id AND status = 'pending'
    ),
    updated_at = now()
  WHERE wedding_id = v_wedding_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_invite_change
  AFTER INSERT OR UPDATE OR DELETE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_invite_stats();

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_stats ENABLE ROW LEVEL SECURITY;

-- Couples: own row only
CREATE POLICY "Couples own data" ON couples FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()));

-- Weddings: couple owns their weddings
CREATE POLICY "Couple manages weddings" ON weddings FOR ALL TO authenticated
  USING (couple_id = (SELECT auth.uid()));

-- Events: couple manages events for their weddings
CREATE POLICY "Couple manages events" ON events FOR ALL TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));

-- Invites: couple manages invites for their weddings
CREATE POLICY "Couple manages invites" ON invites FOR ALL TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));

-- RSVPs: couple reads all RSVPs for their weddings
CREATE POLICY "Couple reads rsvps" ON rsvps FOR SELECT TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));

-- Questions: couple manages Q&A for their weddings
CREATE POLICY "Couple manages questions" ON questions FOR ALL TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));

-- Photos: couple manages photos for their weddings
CREATE POLICY "Couple manages photos" ON photos FOR ALL TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));

-- Stats: couple reads stats for their weddings
CREATE POLICY "Couple reads stats" ON wedding_stats FOR SELECT TO authenticated
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())
  ));
