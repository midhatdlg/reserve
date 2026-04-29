import { createClient } from '@supabase/supabase-js';

// Service role client — NEVER import this in client components or expose to the browser.
// Only use in server actions, API routes, and server components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
