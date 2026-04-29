-- Atomic RSVP replacement: delete old rows, insert new ones, and update the
-- invite status in a single transaction so a partial failure never leaves the
-- guest with zero RSVP rows.

CREATE OR REPLACE FUNCTION replace_rsvps(
  p_invite_id UUID,
  p_status TEXT,
  p_rows JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rsvps WHERE invite_id = p_invite_id;

  INSERT INTO rsvps (invite_id, wedding_id, person_name, attending, meal_preference, dietary_notes)
  SELECT
    (r->>'invite_id')::uuid,
    (r->>'wedding_id')::uuid,
    r->>'person_name',
    (r->>'attending')::boolean,
    NULLIF(r->>'meal_preference', ''),
    NULLIF(r->>'dietary_notes', '')
  FROM jsonb_array_elements(p_rows) AS r;

  UPDATE invites
  SET status = p_status,
      responded_at = now()
  WHERE id = p_invite_id;
END;
$$;
