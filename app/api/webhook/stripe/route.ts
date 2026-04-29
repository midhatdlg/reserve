import { NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const coupleId = session.metadata?.couple_id;
    const tier = session.metadata?.tier as 'standard' | 'premium' | undefined;

    if (coupleId && tier) {
      const supabase = createAdminClient();
      await supabase
        .from('couples')
        .update({ plan_tier: tier, stripe_customer_id: session.customer as string })
        .eq('id', coupleId);
    }
  }

  return new Response('ok', { status: 200 });
}
