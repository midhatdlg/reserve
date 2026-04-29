import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');
const JOY_MIGRATION = '20260421000000_joy_flow.sql';

describe('Joy-flow migration', () => {
  const sql = readFileSync(join(MIGRATIONS_DIR, JOY_MIGRATION), 'utf8');

  it('is listed in the migrations directory', () => {
    const files = readdirSync(MIGRATIONS_DIR);
    expect(files).toContain(JOY_MIGRATION);
  });

  it('runs inside a transaction', () => {
    expect(sql).toMatch(/^\s*BEGIN;/m);
    expect(sql).toMatch(/COMMIT;\s*$/m);
  });

  it('adds strict_name_match column to weddings', () => {
    expect(sql).toMatch(
      /ALTER TABLE weddings[\s\S]*ADD COLUMN IF NOT EXISTS strict_name_match BOOLEAN NOT NULL DEFAULT true/i
    );
  });

  it('adds timezone column to weddings', () => {
    expect(sql).toMatch(
      /ALTER TABLE weddings[\s\S]*ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe\/London'/i
    );
  });

  it('adds author_name and author_email columns to questions', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS author_name TEXT/i);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS author_email TEXT/i);
  });

  it('flips questions.is_public default to false', () => {
    expect(sql).toMatch(
      /ALTER TABLE questions ALTER COLUMN is_public SET DEFAULT false/i
    );
  });

  it('relaxes invites.max_guests CHECK to allow up to 20', () => {
    expect(sql).toMatch(/CHECK \(max_guests BETWEEN 1 AND 20\)/i);
  });

  it('creates a case-insensitive name lookup index', () => {
    expect(sql).toMatch(
      /CREATE INDEX IF NOT EXISTS idx_invites_wedding_guest_ci[\s\S]*lower\(guest_name\)/i
    );
  });

  it('does not drop invites.token column', () => {
    expect(sql).not.toMatch(/DROP COLUMN[\s\S]*token/i);
  });
});

describe('Public RLS migration', () => {
  const FILE = '20260421120000_public_rls.sql';
  const sql = readFileSync(join(MIGRATIONS_DIR, FILE), 'utf8');

  it('is listed in the migrations directory', () => {
    const files = readdirSync(MIGRATIONS_DIR);
    expect(files).toContain(FILE);
  });

  it('adds an anon select policy for published weddings only', () => {
    expect(sql).toMatch(/create policy "Anon reads published weddings"[\s\S]*is_published = true/i);
  });

  it('gates events/photos visibility on their parent wedding being published', () => {
    expect(sql).toMatch(/create policy "Anon reads events of published weddings"[\s\S]*is_published = true/i);
    expect(sql).toMatch(/create policy "Anon reads photos of published weddings"[\s\S]*is_published = true/i);
  });

  it('only exposes questions flagged is_public = true', () => {
    expect(sql).toMatch(/create policy "Anon reads approved public questions"[\s\S]*is_public = true/i);
  });

  it('does not expose invites or rsvps to anon', () => {
    expect(sql).not.toMatch(/create policy[\s\S]*to anon[\s\S]*on invites/i);
    expect(sql).not.toMatch(/create policy[\s\S]*to anon[\s\S]*on rsvps/i);
  });

  it('uses drop-if-exists to stay idempotent', () => {
    const drops = sql.match(/drop policy if exists/gi) ?? [];
    expect(drops.length).toBeGreaterThanOrEqual(4);
  });
});

describe('test seed fixtures', () => {
  const seed = readFileSync(join(process.cwd(), 'supabase', 'seed.sql'), 'utf8');

  it('seeds a published wedding with the known slug', () => {
    expect(seed).toMatch(/'ada-and-ben'/);
    expect(seed).toMatch(/is_published[\s\S]*true/);
  });

  it('seeds an unpublished wedding for 404 tests', () => {
    expect(seed).toMatch(/'unpublished'/);
  });

  it('seeds multiple invites including a duplicate-name case', () => {
    const chrisLines = seed.split('\n').filter((l) => l.includes("'Chris Smith'"));
    expect(chrisLines.length).toBeGreaterThanOrEqual(2);
  });

  it('seeds strict_name_match true on the primary wedding', () => {
    expect(seed).toMatch(/strict_name_match[\s\S]*true/);
  });

  it('seeds a timezone', () => {
    expect(seed).toMatch(/'Europe\/London'/);
  });
});
