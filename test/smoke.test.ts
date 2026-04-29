import { describe, it, expect } from 'vitest';

describe('test infrastructure smoke', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('has jsdom globals', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('has env vars wired from setup', () => {
    expect(process.env.RSVP_SESSION_SECRET).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321');
  });
});
