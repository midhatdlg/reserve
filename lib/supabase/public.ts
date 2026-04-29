import { createClient } from '@supabase/supabase-js';

/**
 * Anon Supabase client for use on the public invite page and its helpers.
 *
 * This client has no service-role privileges, so RLS policies ALONE decide
 * what a guest can read. Anything we expose to the guest must be allowed by
 * an explicit `select` policy on the corresponding table.
 *
 * Never use this client for writes from the invite page — all mutations go
 * through API routes that use `createAdminClient` with their own AuthZ.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
