import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendRsvpReminder } from '@/lib/resend';

// Reminder cadence: send a nudge when wedding is exactly 14, 7, or 3 days away.
const REMINDER_DAYS = [14, 7, 3];

function daysBetween(a: Date, b: Date) {
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sets this header automatically; manual triggers must provide CRON_SECRET.
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thelovelist.app';
  const today = new Date();

  // Pull all upcoming weddings with reminders enabled
  const { data: weddings, error } = await supabase
    .from('weddings')
    .select('id, slug, title, wedding_date, settings')
    .not('wedding_date', 'is', null)
    .gte('wedding_date', today.toISOString());

  if (error) return new Response(`DB error: ${error.message}`, { status: 500 });

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const w of weddings ?? []) {
    const enabled = (w.settings as { reminders_enabled?: boolean } | null)?.reminders_enabled !== false;
    if (!enabled) { skipped++; continue; }

    const days = daysBetween(new Date(), new Date(w.wedding_date));
    if (!REMINDER_DAYS.includes(days)) { skipped++; continue; }

    const { data: invites } = await supabase
      .from('invites')
      .select('id, guest_name, email')
      .eq('wedding_id', w.id)
      .eq('status', 'pending')
      .not('email', 'is', null);

    for (const invite of invites ?? []) {
      try {
        await sendRsvpReminder({
          to: invite.email!,
          guestName: invite.guest_name,
          weddingTitle: w.title ?? 'Our Wedding',
          weddingDate: new Date(w.wedding_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          daysAway: days,
          inviteUrl: `${appUrl}/invite/${w.slug}`,
        });
        sent++;
      } catch (err) {
        errors.push(`${invite.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return Response.json({ sent, skipped, errors });
}
