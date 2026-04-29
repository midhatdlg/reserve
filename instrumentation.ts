/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Validates required environment variables so misconfigurations surface as
 * a deploy-time crash rather than a silent 500 on the first request.
 */
export function register() {
  if (process.env.NODE_ENV === 'production') {
    const required = [
      'RSVP_SESSION_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    const secret = process.env.RSVP_SESSION_SECRET!;
    if (secret.length < 32) {
      throw new Error('RSVP_SESSION_SECRET must be at least 32 characters');
    }
  }
}
