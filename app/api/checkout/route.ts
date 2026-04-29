import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { tier } = await req.json() as { tier: 'standard' | 'premium' };
  const plan = PLANS[tier];
  if (!plan) return new Response('Invalid tier', { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'gbp', product_data: { name: `Reserve — ${plan.name}` }, unit_amount: plan.price }, quantity: 1 }],
    mode: 'payment',
    success_url: `${appUrl}/dashboard/settings?upgraded=1`,
    cancel_url: `${appUrl}/dashboard/settings`,
    metadata: { couple_id: user.id, tier },
  });

  return NextResponse.json({ url: session.url });
}
