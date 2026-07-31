import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Lightweight daily ping so free-tier Supabase is less likely to pause.
 * Auth matches /api/cron/reminders (Vercel Cron → Bearer CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('weddings').select('id').limit(1);
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
