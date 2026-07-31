# Reserve (The Love List)

Wedding invite + RSVP app. Auth is **Supabase + Google OAuth** (security-sensitive surface).

## Prerequisites

- **Node.js 20+**
- Team access to the shared **hosted Supabase** project (URL + anon key + service role key)

Docker / Supabase CLI are **not** required for the default path.

## Getting started

```bash
git clone <repo-url>
cd reserve
npm ci
cp .env.example .env.local
# Paste the three Supabase keys from the team vault into .env.local
npm run setup          # fills RSVP_SESSION_SECRET if needed + validates env
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) → **Continue with Google**.

If Google is already enabled on the shared Supabase project (and localhost redirects are allow-listed), that is the whole loop.

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | Ensure `.env.local` shape + print Google Auth checklist |
| `npm run env:check` | Re-validate env / print redirect URIs |
| `npm run dev` | Next.js dev server |
| `npm run setup:local` | Optional: local Supabase via Docker (see below) |

Stripe, Resend, Upstash, and Google Maps keys are optional until you use those features.

## Google Auth (required for this project)

Google credentials live in **Supabase Auth + Google Cloud**, not in Next.js `.env.local`.

The app only needs Supabase URL/keys. OAuth is: browser → Google → Supabase callback → app `/callback`.

### One-time (project owner)

Do this once on the shared hosted project so every clone can use Google.

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client (Web)
2. **Authorized redirect URI** (must be the Supabase callback, not localhost):

   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

3. **Supabase Dashboard** → Authentication → Providers → Google  
   Paste Client ID + Client Secret → enable
4. **Supabase Dashboard** → Authentication → URL configuration  
   Site URL can be production; add to redirect allow-list:

   ```
   http://localhost:3000/**
   http://localhost:3000/callback
   ```

   (plus your production origin)

5. Share only the Supabase API keys with the team (vault). **Do not** commit Google client secrets or service role keys.

`npm run env:check` prints the exact redirect URI for whatever `NEXT_PUBLIC_SUPABASE_URL` is in `.env.local`.

### Day-to-day (any contributor)

```bash
npm ci
# .env.local with hosted keys
npm run setup
npm run dev
# /login → Continue with Google
```

### Auth callback path

Login uses `signInWithOAuth({ provider: 'google' })` → Google → Supabase → [`/callback`](app/(auth)/callback/route.ts) (PKCE) → `/setup` or `/dashboard`. Middleware refreshes the session and CSP allows `accounts.google.com`.

## Optional: local Supabase (Docker)

Only if you need an offline DB or to develop without the shared project:

```bash
# Requires Docker + Supabase CLI
npm run setup:local
npm run dev
```

For Google against **local** GoTrue, put credentials in `supabase/.env`:

```bash
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
```

Google redirect URI for local:

```
http://127.0.0.1:54321/auth/v1/callback
```

Then `npm run db:stop && npm run db:start`. Wired in [`supabase/config.toml`](supabase/config.toml) under `[auth.external.google]`.

Magic Link + Inbucket (`http://127.0.0.1:54324`) works as a local fallback when Google env vars are unset.

Seeded guest invite (after `db:reset`): [http://localhost:3000/invite/ada-and-ben](http://localhost:3000/invite/ada-and-ben)

## Learn more

- [Supabase Auth — Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- Next.js APIs in this repo may differ from older guides; see `node_modules/next/dist/docs/` when in doubt.
