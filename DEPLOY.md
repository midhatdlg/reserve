# Deploy to Vercel (Supabase + Google OAuth)

This app stays on **Supabase Auth + Google OAuth**. Do not switch to Clerk/Auth.js.

If your hosted project (`*.supabase.co`) returns NXDOMAIN, it was paused or deleted. **Restore it in the Supabase Dashboard, or create a new project** — that step cannot be done from this repo.

## You're ready when you do this

### 1. Restore or create Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. **Restore** the paused project, **or** create a new project
3. Copy from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Apply schema (migrations)

From this repo (with [Supabase CLI](https://supabase.com/docs/guides/cli) installed and logged in):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

`YOUR_PROJECT_REF` is the subdomain of `https://YOUR_PROJECT_REF.supabase.co`.

Migrations live in [`supabase/migrations/`](supabase/migrations/). Apply all of them before first login against production.

### 3. Google OAuth (Google Cloud + Supabase)

Google client ID/secret live in **Supabase + Google Cloud**, not in Vercel env vars.

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client (Web)
2. **Authorized redirect URI** (Supabase callback only):

   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

3. **Supabase** → Authentication → Providers → Google → enable, paste Client ID + Secret

`npm run env:check` (with hosted URL in `.env.local`) prints the exact redirect URI.

### 4. Supabase redirect allow-list (Vercel URL)

**Supabase** → Authentication → URL configuration:

| Setting | Value |
|---------|--------|
| Site URL | Your production origin, e.g. `https://your-app.vercel.app` (or custom domain) |
| Redirect URLs | See below |

Add at least:

```
http://localhost:3000/**
http://localhost:3000/callback
https://YOUR_VERCEL_HOST/**
https://YOUR_VERCEL_HOST/callback
```

Replace `YOUR_VERCEL_HOST` with the real host (e.g. `thelovelist.vercel.app` or your custom domain).  
If you use Preview Deployments, also allow `https://*-your-team.vercel.app/**` (or add each preview URL you care about).

The app’s OAuth `redirectTo` is `{origin}/callback` (see [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx)).

### 5. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, set for **Production** (and Preview if you test auth there):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | server-only; never expose to the client |
| `RSVP_SESSION_SECRET` | **Yes** | ≥32 random chars (new secret for prod; do not reuse a public/dev example) |
| `NEXT_PUBLIC_APP_URL` | **Strongly recommended** | Exact public origin, e.g. `https://your-app.vercel.app` — **no trailing slash**. Used for invite links, Stripe return URLs, calendar, reminder emails |
| `CRON_SECRET` | **Recommended** | Random secret; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` to `/api/cron/*` |

Optional until you use the feature: Stripe, Resend, Upstash, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.

Production boot fails fast if required vars are missing (`instrumentation.ts`):  
`RSVP_SESSION_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Generate secrets locally:

```bash
openssl rand -base64 32   # RSVP_SESSION_SECRET or CRON_SECRET
```

### 6. Deploy

```bash
# Or connect the GitHub repo in the Vercel dashboard and deploy the branch
npx vercel --prod
```

[`vercel.json`](vercel.json) registers daily crons:

- `/api/cron/reminders` — RSVP reminder emails (needs `CRON_SECRET` + Resend when you enable that)
- `/api/cron/keepalive` — lightweight Supabase ping so free-tier projects are less likely to pause from inactivity

### 7. Verify Google login

1. Open `https://YOUR_VERCEL_HOST/login`
2. **Continue with Google**
3. Expect redirect through Google → Supabase → `/callback` → `/setup` or `/dashboard`

If it fails: check Supabase Auth logs, that the Google redirect URI is the **Supabase** callback (not the Vercel URL), and that `https://YOUR_VERCEL_HOST/callback` is in the Supabase redirect allow-list.

## NEXT_PUBLIC_APP_URL

| Environment | Value |
|-------------|--------|
| Local | `http://localhost:3000` |
| Vercel Production | `https://<production-host>` (custom domain preferred once set) |
| Preview | Preview URL if you test invite/checkout links there |

Mismatch causes wrong invite/share links and broken Stripe return URLs. OAuth itself uses `window.location.origin`, but shared links and emails use `NEXT_PUBLIC_APP_URL`.

## Keeping free-tier Supabase awake

Inactive free projects can pause (DNS may fail / NXDOMAIN until restored).

- **In-repo:** daily `/api/cron/keepalive` (set `CRON_SECRET` on Vercel)
- **Manual:** Supabase Dashboard → restore if paused
- **Optional:** a GitHub Action that `curl`s `https://YOUR_VERCEL_HOST/api/cron/keepalive` with `Authorization: Bearer $CRON_SECRET` on a schedule (same auth as Vercel Cron)

## Local vs production checklist

| Item | Local | Vercel |
|------|-------|--------|
| Supabase URL/keys | `.env.local` | Vercel env |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Production HTTPS origin |
| Google redirect URI | Still `https://<ref>.supabase.co/auth/v1/callback` | Same |
| Supabase redirect allow-list | `localhost` + prod | Must include Vercel origin |
| `CRON_SECRET` | Optional | Set for crons |
