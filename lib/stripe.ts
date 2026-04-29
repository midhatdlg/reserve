import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

export const PLANS = {
  standard: {
    name: 'Standard',
    price: 2900,
    priceId: process.env.STRIPE_STANDARD_PRICE_ID ?? '',
    tier: 'standard' as const,
  },
  premium: {
    name: 'Premium',
    price: 5900,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? '',
    tier: 'premium' as const,
  },
};
