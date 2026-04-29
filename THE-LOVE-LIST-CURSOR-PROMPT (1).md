# The Love List — Full Implementation Prompt for Cursor

## What is The Love List?

The Love List is a premium digital wedding invitation platform where couples create beautiful, shareable invite pages and guests RSVP, view seating, check the itinerary, and ask questions — all from one link. No app downloads, no guest logins.

**Core differentiator:** The all-in-one guest journey. One link handles everything — invite, RSVP with enforced seat caps, itinerary, table assignment, Q&A, and photo gallery. Per-invite guest allocation means each invite enforces a hard cap on seats (e.g. "Uncle Ahmed gets 4 seats, college friend gets 1"). Guests see their table number when they revisit their link. Optimized for WhatsApp sharing.

**Brand name:** The Love List
**Tagline:** One link. Every guest. Every detail.

**Monetization:** One-time payments, no subscriptions.
- Free: 25 guests, 1 template, 4 content blocks
- Standard ($29): 150 guests, all templates, 8 blocks, photo gallery, map, guest export, 2 languages
- Premium ($59): unlimited guests, all blocks, custom Canva upload + zone editor, custom domain, SMS/email reminders, 3 languages, Excel export
- Save the Date: not a separate product — couples publish their invite in "Save the Date mode" (date + venue + countdown only), then unlock full RSVP later. Same URL, same database record.

---

## Design System

### Brand Identity
- **Logo:** "The Love List" in Yeseva One (serif), colored sage (#799D7F in light, #AFC8AD in dark)
- **Signature element:** Hand-drawn wavy SVG border with bow at top center, sage-colored, used ONLY on the marketing site hero section
- **Atmosphere:** Organic sage-toned blob gradients (Partiful-style, 55-65px CSS blur) on the marketing site hero. Dashboard is clean and flat — no blobs.

### Color Palette — Minimal (sage-only, no dusty rose)

**Light Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #FFFFFF | Page background |
| bgWarm | #FAFAF8 | Alternate background |
| surface | #FFFFFF | Cards, panels |
| surfaceAlt | #F7F7F5 | Hover states, secondary surfaces |
| border | #B8CCBA | All borders — dark sage |
| borderHover | #99B49C | Border hover state |
| borderActive | #6B8F6F | Active/focused border |
| text | #393735 | Primary text — warm charcoal |
| textSecondary | #6B6560 | Body text, descriptions |
| textTertiary | #A09A93 | Captions, placeholders |
| sage | #799D7F | Primary brand color, CTAs, logo |
| sageLight | #AFC8AD | Light sage for backgrounds, tags |
| sageDim | rgba(121,157,127,0.1) | Sage tinted backgrounds |
| accent | #799D7F | Same as sage — primary action color |
| accentText | #FFFFFF | Text on sage buttons |
| success | #799D7F | Success states (same as sage) |
| error | #C4564A | Error states |
| blob1 | rgba(121,157,127,0.2) | Hero blob 1 |
| blob2 | rgba(175,200,173,0.25) | Hero blob 2 |
| blob3 | rgba(149,185,155,0.18) | Hero blob 3 |

**Dark Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #1A1816 | Page background — warm charcoal |
| bgWarm | #1E1C19 | Alternate background |
| surface | #242220 | Cards, panels |
| surfaceAlt | #2A2826 | Hover states |
| border | #3A3835 | Borders |
| borderHover | #4A4744 | Border hover |
| borderActive | #4A7A4E | Active border — dark green |
| text | #F2F0EC | Primary text |
| textSecondary | #A09A93 | Body text |
| textTertiary | #6B6560 | Captions |
| sage | #4A7A4E | Dark green accent (NOT light sage) |
| sageLight | #6B9B6F | Lighter green for tags |
| sageDim | rgba(74,122,78,0.15) | Dark green tinted backgrounds |
| accent | #4A7A4E | Dark green — primary action in dark mode |
| accentText | #F2F0EC | Text on dark green buttons |
| success | #4A7A4E | Success states |
| error | #D4736A | Error states |
| blob1 | rgba(74,122,78,0.1) | Hero blob 1 |
| blob2 | rgba(107,155,111,0.08) | Hero blob 2 |
| blob3 | rgba(90,140,94,0.06) | Hero blob 3 |

**Key dark mode rule:** Accents are DARK GREEN (#4A7A4E), not lightened sage. This gives the dark mode its own distinct identity rather than just inverting the light theme.

### Typography

| Context | Font | Weight | Usage |
|---------|------|--------|-------|
| Marketing headlines | Yeseva One | 400 | Hero, section headings, logo |
| Marketing body | Cormorant Garamond | 400 | Landing page paragraphs, descriptions |
| Dashboard headings | Montserrat | 600 | Page titles, stat numbers |
| Dashboard body | Montserrat | 400 | Body text, table content |
| Dashboard labels | Montserrat | 600 | Buttons, badges, captions |
| Invite page headlines | Per template | varies | Each template has its own font pairing |
| Invite page body | Per template | varies | Each template has its own font pairing |

**Type scale:**
- Hero headline: 42px Yeseva One
- H1 marketing: 36px Yeseva One
- H2 marketing: 24px Yeseva One
- Body marketing: 18-19px Cormorant Garamond, line-height 1.7
- H1 dashboard: 22px Montserrat 600
- H2 dashboard: 16px Montserrat 600
- Body dashboard: 14px Montserrat 400, line-height 1.6
- Button text: 12px Montserrat 600, letter-spacing 0.5px
- Caption: 10px Montserrat 500

### Component Tokens
- **Border radius:** 8px buttons, 12-14px cards, 20px pills
- **Card shadows (light):** `rgba(57,55,53,0.04) 0px 1px 3px, rgba(57,55,53,0.03) 0px 4px 12px, rgba(57,55,53,0.02) 0px 12px 36px`
- **Card shadows (dark):** `rgba(0,0,0,0.3) 0px 1px 3px, rgba(0,0,0,0.2) 0px 4px 12px`
- **Shadows on marketing feature cards only** — no shadows on dashboard cards, inputs, or buttons

### Design Rules
1. Sage green is the ONLY accent color. No dusty rose, no gold, no secondary colors.
2. Logo is always sage (#799D7F light, #4A7A4E dark) in Yeseva One.
3. Hand-drawn wavy border with bow appears ONLY on the marketing hero section.
4. Blobs appear ONLY on the marketing hero. Dashboard is clean and flat.
5. Yeseva One is NEVER used in the dashboard — only marketing site.
6. All dashboard UI uses Montserrat exclusively.
7. Dark mode uses dark green (#4A7A4E) accents, NOT lightened sage.
8. White backgrounds only — never tinted. Let the sage accents do the work.
9. Invite templates have their OWN design systems (fonts, colors) — the brand tokens above are for the platform, not the invite pages.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (OAuth + Magic Links) |
| Database | Supabase PostgreSQL with Row-Level Security |
| Realtime | Supabase Realtime (WebSocket for RSVP feed) |
| File Storage | Supabase Storage (couple photos, Canva uploads) |
| Image Processing | Sharp (server-side image composition for custom designs) |
| Payments | Stripe Checkout (one-time payments) |
| Email | Resend (RSVP confirmations, reminders) |
| Rate Limiting | Upstash Redis |
| Hosting | Vercel (Edge CDN, Serverless Functions) |
| Animation | Framer Motion (envelope opening, section reveals) |
| Fonts | Google Fonts (Yeseva One, Cormorant Garamond, Montserrat) |

---

## Database Schema (Supabase PostgreSQL)

### Tables

```sql
-- Couples (authenticated users)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  name_1 TEXT NOT NULL,
  name_2 TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'standard', 'premium')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weddings
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  wedding_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat FLOAT,
  venue_lng FLOAT,
  template_id TEXT DEFAULT 'heritage',
  custom_design_url TEXT,
  design_zones JSONB DEFAULT '[]',
  selected_blocks TEXT[] DEFAULT ARRAY['rsvp','itinerary','table','qna'],
  languages TEXT[] DEFAULT ARRAY['en'],
  is_published BOOLEAN DEFAULT false,
  -- Save the Date mode
  save_the_date_mode BOOLEAN DEFAULT false, -- when true, only date/venue/countdown visible
  -- Envelope animation
  envelope_enabled BOOLEAN DEFAULT true,
  envelope_wax_color TEXT DEFAULT '#799D7F',
  envelope_initials TEXT,
  -- Settings
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events (itinerary items)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invites (each gets a unique token + guest allocation)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  guest_name TEXT NOT NULL,
  max_guests INT NOT NULL DEFAULT 1 CHECK (max_guests BETWEEN 1 AND 10),
  table_number INT,
  table_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'declined')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RSVPs (one per person within an invite)
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES invites(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT true,
  meal_preference TEXT,
  dietary_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions (guest Q&A)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  invite_id UUID REFERENCES invites(id),
  question_text TEXT NOT NULL,
  answer_text TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photos (engagement shoot gallery)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Wedding stats (materialized counts, updated via trigger)
CREATE TABLE wedding_stats (
  wedding_id UUID PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE,
  total_invites INT DEFAULT 0,
  total_seats INT DEFAULT 0,
  attending INT DEFAULT 0,
  declined INT DEFAULT 0,
  pending INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE UNIQUE INDEX idx_invite_token ON invites(token);
CREATE INDEX idx_invite_wedding_id ON invites(wedding_id);
CREATE INDEX idx_rsvp_invite_id ON rsvps(invite_id);
CREATE INDEX idx_rsvp_wedding_id ON rsvps(wedding_id);
CREATE INDEX idx_events_wedding_id ON events(wedding_id);
CREATE INDEX idx_questions_wedding_id ON questions(wedding_id);
CREATE INDEX idx_photos_wedding_id ON photos(wedding_id);
CREATE INDEX idx_weddings_couple_id ON weddings(couple_id);
CREATE INDEX idx_weddings_slug ON weddings(slug);
```

### Row-Level Security Policies

```sql
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples own data" ON couples FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Couple manages weddings" ON weddings FOR ALL TO authenticated
  USING (couple_id = (SELECT auth.uid()));

CREATE POLICY "Couple manages invites" ON invites FOR ALL TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));

CREATE POLICY "Couple reads rsvps" ON rsvps FOR SELECT TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));

CREATE POLICY "Couple manages events" ON events FOR ALL TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));

CREATE POLICY "Couple manages questions" ON questions FOR ALL TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));

CREATE POLICY "Couple manages photos" ON photos FOR ALL TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));

CREATE POLICY "Couple reads stats" ON wedding_stats FOR SELECT TO authenticated
  USING (wedding_id IN (SELECT id FROM weddings WHERE couple_id = (SELECT auth.uid())));
```

---

## File Structure

```
the-love-list/
├── app/
│   ├── layout.tsx                    # Root layout with fonts, metadata, theme provider
│   ├── page.tsx                      # Marketing landing page
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login (Google OAuth + Magic Link)
│   │   └── callback/route.ts         # Supabase auth callback
│   ├── setup/                        # 5-step setup wizard
│   │   └── page.tsx
│   ├── dashboard/                    # Couple's dashboard (protected)
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   ├── page.tsx                  # Overview / RSVP summary
│   │   ├── guests/page.tsx           # Guest manager + allocations
│   │   ├── design/page.tsx           # Zone editor for custom designs
│   │   ├── itinerary/page.tsx        # Itinerary builder
│   │   ├── seating/page.tsx          # Table assignment
│   │   ├── photos/page.tsx           # Photo gallery upload
│   │   ├── questions/page.tsx        # Q&A management
│   │   └── settings/page.tsx         # Wedding settings, billing, theme toggle
│   ├── invite/[token]/               # Guest-facing invite page
│   │   └── page.tsx                  # ISR-cached invite with all sections
│   └── api/
│       ├── rsvp/route.ts             # POST: submit RSVP (token-validated)
│       ├── question/route.ts         # POST: submit question
│       ├── invite/[token]/route.ts   # GET: fetch invite data for guest
│       ├── compose-image/route.ts    # GET: generate personalized invite PNG
│       ├── export/guests/route.ts    # GET: download guest list CSV
│       ├── webhook/stripe/route.ts   # Stripe payment webhook
│       └── webhook/rsvp-notify/route.ts
├── components/
│   ├── setup/                        # Setup wizard steps
│   │   ├── StepTemplatePicker.tsx
│   │   ├── StepBlockSelector.tsx
│   │   ├── StepLanguages.tsx
│   │   ├── StepGuests.tsx
│   │   └── StepLaunch.tsx
│   ├── dashboard/                    # Dashboard components
│   │   ├── GuestTable.tsx
│   │   ├── RsvpTracker.tsx
│   │   ├── ZoneEditor.tsx
│   │   ├── ItineraryBuilder.tsx
│   │   ├── SeatingChart.tsx
│   │   └── PhotoUploader.tsx
│   ├── invite/                       # Guest-facing components
│   │   ├── EnvelopeAnimation.tsx     # Framer Motion envelope + wax seal
│   │   ├── InviteHero.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── RsvpForm.tsx
│   │   ├── ItineraryTimeline.tsx
│   │   ├── TableReveal.tsx
│   │   ├── QnaSection.tsx
│   │   ├── PhotoGallery.tsx
│   │   └── VenueMap.tsx              # Static map image + directions link
│   ├── marketing/
│   │   ├── HeroBorder.tsx            # Hand-drawn wavy SVG border with bow
│   │   └── BlobBackground.tsx        # Animated sage blob gradients
│   └── ui/                           # Shared UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── ThemeToggle.tsx           # Light/dark mode switch
│       └── ProgressBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts                  # Service role (server only!)
│   ├── stripe.ts
│   ├── resend.ts
│   ├── rate-limit.ts
│   ├── image-composer.ts             # Sharp-based image composition
│   ├── validators.ts                 # Zod schemas
│   └── theme.ts                      # Design tokens for light/dark mode
├── types/
│   └── index.ts
├── middleware.ts
├── tailwind.config.ts                # Custom colors from design system
├── next.config.ts
└── .env.local
```

---

## Features — What's In and What's Out

### IN — Core (build these)
- **One-link guest journey:** invite + RSVP + itinerary + table number + Q&A + photo gallery, all on one URL
- **Per-invite guest allocation:** enforced seat caps per unique invite link (1-10 guests)
- **Table number visible to guest:** guest reopens their link and sees their assigned table
- **Custom Canva upload + zone editor:** couple uploads PNG, places dynamic text zones (names, date, guest name) with font/color/position controls
- **5-step setup wizard:** Theme → Sections → Languages → Guests → Launch
- **Modular content blocks:** toggle sections on/off (14 block types)
- **Multilingual support:** up to 3 languages per invite, flag-picker UI
- **RSVP with meal preferences + dietary tracking**
- **Itinerary timeline:** vertical timeline of events
- **Q&A / FAQ section:** guests ask questions, couple pins answers
- **Photo gallery:** couple uploads engagement shoot photos (6-12 images, lightbox on tap)
- **Countdown timer**
- **Realtime RSVP dashboard:** Supabase Realtime, live stats, meal breakdown
- **Guest list export:** CSV download
- **Envelope animation:** Framer Motion animated envelope with wax seal, skippable after 0.5s, cookie-skip on return visits
- **Save the Date mode:** same URL, couple toggles between "Save the Date" (date + venue only) and full invite
- **Venue map:** static Google Maps image with "Get Directions" link (no interactive embed)
- **QR code + WhatsApp + email sharing**

### IN — With Your Twist
- **Content blocks are included in tier, not per-block pricing** (unlike The Digital Invite's +5€/block)
- **Envelope animation is skippable** (unlike competitors that force it every time)
- **Save the Date is a mode, not a separate product** (same URL, no extra Stripe product)

### OUT — Cut for launch
- **Background music** — browsers block autoplay, most guests won't tap play, adds complexity
- **Custom venue illustration** — too complex, Canva upload covers custom visuals
- **Gift registry integration** — just a text block with a link, don't build browsing/checkout
- **Interactive Google Maps embed** — static image + directions link does 95% of the job
- **Guestbook** — low engagement, guests prefer WhatsApp. Add later if requested.
- **Canva Connect API** — rate limits, OAuth complexity, third-party dependency. Skip.

---

## Key Implementation Details

### 1. Guest Invite Page (app/invite/[token]/page.tsx)

The most important page. ISR-cached with `revalidate = 300`.

- Token validation server-side: look up invite by token, fetch wedding + events
- If `wedding.save_the_date_mode` is true, only render date/venue/countdown
- If `wedding.envelope_enabled` is true, wrap page in EnvelopeAnimation component
- Sections rendered conditionally based on `wedding.selected_blocks`
- RSVP form shows exactly `invite.max_guests` slots
- Table number shown only if `invite.table_number` is set
- No auth required — the token IS the authentication
- Mobile-first — designed for WhatsApp open-in-browser

### 2. Envelope Animation (components/invite/EnvelopeAnimation.tsx)

- Full-screen envelope with wax seal bearing couple's initials
- Guest taps → seal cracks → flap lifts → card slides up → reveals invite
- Total animation: ~1.2 seconds
- "Skip" text appears after 0.5s
- Cookie/localStorage flag skips envelope on return visits
- Built with Framer Motion (AnimatePresence, motion.div)
- Couple can toggle off in settings

### 3. RSVP API (app/api/rsvp/route.ts)

- Rate limit by token: 10 req/min (Upstash Redis)
- Validate token exists in invites table
- Enforce `guests.length <= invite.max_guests`
- Validate all inputs with Zod
- Upsert RSVPs (delete old, insert new — allows re-submission)
- Update invite status to 'responded'
- Trigger email confirmation via Resend (async)
- Return `{ success: true, table_number }` if assigned

### 4. Custom Design Image Composition (lib/image-composer.ts)

- Fetch base image from Supabase Storage
- Read zone config from `wedding.design_zones` JSONB
- Replace template variables: `{{couple_names}}`, `{{guest_name}}`, `{{date}}`, etc.
- Render text at each zone's position using Sharp SVG overlay
- Return composited PNG, cache via CDN

### 5. Zone Editor Data Model

```typescript
type DesignZone = {
  id: string;
  type: 'couple_names' | 'date' | 'venue' | 'guest_name' | 'custom';
  x: number;         // % from left
  y: number;         // % from top
  width: number;     // % width
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  content: string;   // e.g. "{{couple_names}}" or "{{guest_name}}"
};
```

### 6. Realtime RSVP Dashboard

```typescript
supabase
  .channel(`rsvps-${weddingId}`)
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'rsvps',
    filter: `wedding_id=eq.${weddingId}`
  }, (payload) => {
    setRsvps(prev => [...prev, payload.new]);
    // Toast: "The Patels just confirmed — 4 attending!"
  })
  .subscribe();
```

Dashboard shows: stat cards (confirmed/pending/declined), live RSVP feed, meal breakdown chart, dietary flags list, response rate progress bar, export button.

---

## Security Requirements

1. RLS on every table — no exceptions
2. Never expose `service_role` key in client code
3. Validate all inputs with Zod schemas server-side
4. Rate limit all public endpoints: 10 req/min per token
5. CSRF protection with SameSite=Strict cookies
6. Security headers: CSP, X-Frame-Options, HSTS
7. Invite tokens: 16-char hex from gen_random_bytes(8) = 64 bits entropy
8. Guest tokens never grant write access to other invites

---

## Scaling Notes

- Invite pages ISR-cached at edge: `revalidate = 300`. 90%+ of guest traffic served from CDN.
- Use Supavisor (port 6543) for all DB connections from serverless functions.
- Index all foreign keys + invite token column.
- Materialized stats table updated via trigger.
- Handles 200-500 guests per wedding comfortably on Supabase Pro ($25/mo) + Vercel Pro ($20/mo).

---

## Setup Wizard Flow (5 Steps)

### Step 1: Theme
- Input: couple names + wedding date
- Template grid: Heritage, Bloom, Minimal, Nikah, Sweet Love, Upload Your Own
- "Upload Your Own" triggers file upload → Supabase Storage

### Step 2: Sections
- Toggle grid of 14 blocks: Itinerary, RSVP (locked on), Table Numbers, Q&A, Photos, Our Story, Countdown, Dress Code, Transport, Accommodation, Menu, Gift Registry, Pre-Wedding
- Custom block input at bottom

### Step 3: Languages
- Flag grid, max 3 selections (18 pre-built languages)
- Custom language input

### Step 4: Guest Allocation
- Add guest rows: name + allocation stepper (1-10)
- Creates invite records with unique tokens
- Running totals: X invites, Y total seats

### Step 5: Launch
- Wedding published. Show shareable link.
- Share buttons: WhatsApp, QR Code, Email, iMessage
- "What's next" checklist → dashboard

---

## Guest-Facing Invite Page Sections

Conditionally rendered based on `wedding.selected_blocks`:

1. **Envelope Animation** — animated envelope + wax seal opening (if enabled)
2. **Hero** — couple names, date, time, venue (template-styled or custom Canva design)
3. **Guest Greeting** — "{guest_name}, you have been invited for {max_guests} guests"
4. **Countdown** — live days/hours/minutes
5. **Our Story** — couple's text
6. **RSVP Form** — exactly max_guests slots with name, attending/declining, meal, dietary
7. **Table Assignment** — table_number + table_name (hidden until assigned)
8. **Itinerary** — vertical timeline from events table
9. **Photo Gallery** — engagement shoot grid, lightbox on tap
10. **Q&A** — pinned FAQs + ask question form
11. **Venue Map** — static map image + "Get Directions" link
12. **Dress Code** — text block
13. **Transport** — directions, parking, shuttle
14. **Accommodation** — hotel blocks, booking links
15. **Menu** — dinner selections
16. **Pre-Wedding** — Mehndi, Haldi, etc.

---

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=https://thelovelist.com
```

---

## Build Order (Recommended)

1. **Supabase setup** — schema SQL, RLS, Auth providers (Google OAuth + Magic Link)
2. **Theme provider** — light/dark mode with design tokens from this spec
3. **Auth flow** — login page, callback, middleware
4. **Setup wizard** — 5-step flow creating wedding + invites
5. **Guest invite page** — core product: `app/invite/[token]/page.tsx`
6. **Envelope animation** — Framer Motion wrapper
7. **RSVP API** — token validation, seat cap enforcement, Zod validation
8. **Dashboard overview** — realtime RSVP tracker, stats, meal chart
9. **Guest manager** — CRUD invites, allocation stepper, CSV import/export
10. **Itinerary builder** — drag-to-reorder timeline
11. **Seating chart** — table number assignment
12. **Photo gallery** — upload in dashboard, grid on invite page
13. **Zone editor** — Canva upload + text zone placement
14. **Image composer** — Sharp server-side composition
15. **Venue map** — static map + directions link
16. **Stripe integration** — Standard/Premium checkout
17. **Email notifications** — RSVP confirmations, reminders
18. **Share center** — QR code, WhatsApp deep-links
19. **Multilingual** — i18n for invite page
20. **Marketing landing page** — hero with hand-drawn border, features, pricing, testimonials
