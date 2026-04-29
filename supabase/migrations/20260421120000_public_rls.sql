-- Anon-readable surface for the guest invite page.
--
-- The invite page uses the anon key to fetch wedding/events/photos/public
-- questions, relying entirely on these policies for authorisation. Nothing
-- invite-scoped (invites, rsvps, private questions) is exposed here — that
-- data only leaves the database through API routes that run under the
-- service-role key.
--
-- Guarantees:
--   * Only `is_published = true` weddings are visible to anon.
--   * Events/photos/questions are only visible when their parent wedding is
--     published (enforced via a subquery rather than a join).
--   * Questions are additionally filtered to `is_public = true` so the
--     moderation queue stays private.

drop policy if exists "Anon reads published weddings" on weddings;
create policy "Anon reads published weddings"
  on weddings for select to anon
  using ( is_published = true );

drop policy if exists "Anon reads events of published weddings" on events;
create policy "Anon reads events of published weddings"
  on events for select to anon
  using (
    exists (
      select 1 from weddings w
      where w.id = events.wedding_id and w.is_published = true
    )
  );

drop policy if exists "Anon reads photos of published weddings" on photos;
create policy "Anon reads photos of published weddings"
  on photos for select to anon
  using (
    exists (
      select 1 from weddings w
      where w.id = photos.wedding_id and w.is_published = true
    )
  );

drop policy if exists "Anon reads approved public questions" on questions;
create policy "Anon reads approved public questions"
  on questions for select to anon
  using (
    is_public = true
    and exists (
      select 1 from weddings w
      where w.id = questions.wedding_id and w.is_published = true
    )
  );
