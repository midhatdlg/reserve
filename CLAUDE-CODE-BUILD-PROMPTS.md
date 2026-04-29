# The Love List — Claude Code Build Prompts

Run these sequentially in Claude Code. Each prompt assumes the previous step is complete.
Drop THE-LOVE-LIST-CURSOR-PROMPT.md into your project root as CLAUDE.md first.

---

## Step 0: Project Init

```
Initialize a new Next.js 14 project with TypeScript and the App Router in this directory. Use Tailwind CSS for styling. Install these dependencies: @supabase/supabase-js @supabase/ssr stripe @upstash/ratelimit @upstash/redis sharp resend zod framer-motion. Also install dev dependencies: @types/node. Set up the full file structure from CLAUDE.md — create all the directories and placeholder files listed there (empty files are fine, we'll fill them in). Configure tailwind.config.ts with the design system from CLAUDE.md: extend the theme with the sage color palette (sage: #799D7F, sageLight: #AFC8AD, sageDim variants), border colors (#B8CCBA), dark mode charcoal bg (#1A1816) with dark green accents (#4A7A4E), border radius tokens (8px, 12px, 14px, 20px), and register the three Google Fonts (Yeseva One, Cormorant Garamond, Montserrat). Set up the root layout.tsx with font imports, metadata (title: "The Love List — One link. Every guest. Every detail."), and a ThemeProvider wrapper for light/dark mode.
```

---

## Step 1: Supabase Schema

```
Create the file supabase/migrations/001_initial_schema.sql with the complete database schema from CLAUDE.md. Include all 8 tables (couples, weddings, events, invites, rsvps, questions, photos, wedding_stats), all indexes, and all RLS policies. Also create a trigger function that automatically updates the wedding_stats table whenever an RSVP is inserted, updated, or deleted — it should recalculate attending, declined, and pending counts for that wedding. Add a second trigger that updates total_invites and total_seats in wedding_stats whenever an invite is inserted or deleted. Make sure gen_random_bytes is available (enable pgcrypto extension at the top of the file).
```

---

## Step 2: Theme Provider + Design Tokens

```
Build the theme system. Create lib/theme.ts that exports the complete light and dark mode design tokens from CLAUDE.md as TypeScript objects. Create components/ui/ThemeToggle.tsx as a button that toggles between light and dark mode, persisting the choice in localStorage. It should read the system preference on first load. Create a ThemeProvider component that wraps the app and applies CSS variables to the document root based on the current theme. The light mode uses white bg (#FFFFFF), sage accents (#799D7F), dark sage borders (#B8CCBA), charcoal text (#393735). Dark mode uses charcoal bg (#1A1816), dark green accents (#4A7A4E — NOT lightened sage), warm gray borders (#3A3835), off-white text (#F2F0EC). Wire the ThemeProvider into app/layout.tsx.
```

---

## Step 3: Supabase Client Setup

```
Set up the Supabase client files. Create lib/supabase/client.ts for the browser client using createBrowserClient from @supabase/ssr. Create lib/supabase/server.ts for server components using createServerClient with cookie handling. Create lib/supabase/admin.ts for the service role client (server-only, never import in client code). Create lib/supabase/middleware.ts with the middleware helper that refreshes auth sessions. Update middleware.ts at the project root to use this helper, protecting /dashboard/* routes (redirect to /login if not authenticated) while leaving /invite/* routes public. Add all Supabase env vars to .env.local.example as a template.
```

---

## Step 4: Auth Flow

```
Build the authentication flow. Create app/(auth)/login/page.tsx with two login options: "Continue with Google" (OAuth) and a magic link email input. Style it with the design system — white card centered on the page, sage CTA button, Yeseva One heading "Welcome to The Love List", Cormorant Garamond subtitle. Create app/(auth)/callback/route.ts that handles the Supabase auth callback, exchanges the code for a session, and redirects to /setup for new users or /dashboard for returning users (check if they have a wedding record). Add a subtle sage blob background behind the login card using the BlobBackground component.
```

---

## Step 5: Shared UI Components

```
Build the shared UI component library in components/ui/. Create Button.tsx with variants: primary (sage bg, white text), secondary (transparent, sage border), pill (rounded-full, sage dim bg). Create Input.tsx with label, placeholder, error state, and focus ring in sage. Create Card.tsx with the multi-layer card shadow from the design system, border-radius 14px. Create ProgressBar.tsx that shows a horizontal step indicator (1-5 dots connected by lines, filled dots for completed steps) — this is for the setup wizard. All components should use the CSS variables from the theme provider so they auto-adapt to light/dark mode. Use Montserrat for all UI text.
```

---

## Step 6: Setup Wizard — Step 1 (Theme)

```
Build the setup wizard at app/setup/page.tsx. Start with Step 1: Theme selection. The wizard has a sticky progress bar at the top (5 steps) and a sticky bottom nav with Back/Continue buttons. Step 1 shows: two name inputs side by side ("Your name" & "Partner's name") with an italic "&" between them, a date picker below, then a 2-column grid of template cards. Each template card has a preview area (colored gradient background with the couple's names in the template's font style), a name label, and a short description. Templates: Heritage (warm dark tones), Bloom (floral purples), Minimal (clean light), Nikah (deep greens, Islamic patterns), Sweet Love (soft illustrations), and "Upload Your Own" (dashed border, + icon, triggers file upload). The selected template gets a sage border + checkmark badge. Store all state in React useState — we'll save to the database in Step 5.
```

---

## Step 7: Setup Wizard — Steps 2-3 (Sections + Languages)

```
Add Steps 2 and 3 to the setup wizard. Step 2 "Sections": show a 3-column grid of toggleable content blocks. Each block is a card with an emoji icon, label, and short description. Blocks: Itinerary, RSVP (locked on with a green "Always on" badge), Table Numbers, Q&A, Photos, Our Story, Countdown, Dress Code, Transport, Accommodation, Menu, Gift Registry, Pre-Wedding, and a custom block input at the bottom. Active blocks get a sage border. Show a count of selected sections at the top. Step 3 "Languages": show a 3-column grid of language cards, each with a flag emoji and language name. Include 18 languages from CLAUDE.md (prioritize English, Bengali, Arabic, Hindi, Urdu, French, Spanish, Turkish). Max 3 selections with a counter badge. Custom language input at bottom. Disabled state (greyed out) when 3 are already selected.
```

---

## Step 8: Setup Wizard — Steps 4-5 (Guests + Launch)

```
Add Steps 4 and 5 to the setup wizard. Step 4 "Guests": show two large stat numbers at top (Invites count, Total Seats count), then a list of guest rows. Each row has a name input and a +/- stepper for seat allocation (1-10). Add/remove guest buttons. A tip box at the bottom explains the unique link + seat cap system. Step 5 "Launch": this step calls the Supabase API to create the wedding record, all events, and all invite records with tokens. Show a success state with a green checkmark, the couple's names, and stats (X invites, Y seats, Z sections). Display the shareable link (thelovelist.com/{slug}) with a copy button. Show 4 share buttons: WhatsApp (deep link), QR Code (generate client-side), Email (mailto link), iMessage. Show a "What's next" checklist pointing to dashboard features. The Continue button becomes "Go to Dashboard →".
```

---

## Step 9: Guest Invite Page — Core

```
Build the guest-facing invite page at app/invite/[token]/page.tsx. This is the most important page in the app. It's a server component that: 1) Looks up the invite by token from the URL, 2) Fetches the wedding, events, and any existing RSVPs for this invite, 3) If save_the_date_mode is true, only renders date/venue/countdown, 4) Renders all sections conditionally based on wedding.selected_blocks. Use ISR with revalidate = 300. The page layout is a single scrollable mobile-first column (max-width 520px centered). For now, use the Heritage template styling: warm ivory bg (#FAF7F2), gold accents (#B8965A), forest green (#2C3E2D), Playfair Display headlines, Cormorant Garamond body. Build these sections: Hero (couple names, date, venue with decorative borders), Guest Greeting (personalized name + seat count), Countdown (live timer), and a placeholder for the RSVP form.
```

---

## Step 10: Envelope Animation

```
Build components/invite/EnvelopeAnimation.tsx using Framer Motion. This wraps the entire invite page content. On first visit: show a full-screen centered envelope with a wax seal. The wax seal shows the couple's initials (from wedding.envelope_initials) in a circular badge colored with wedding.envelope_wax_color (default sage). Animation sequence on tap: 1) Wax seal cracks (scale to 1.2 then 0, opacity to 0) at 0s, 2) Envelope flap rotates up (rotateX from 0 to -180deg) at 0.2s, 3) Card slides up from inside (translateY from 100% to 0) at 0.4s, 4) Envelope fades out (opacity to 0) at 0.6s, 5) Invite page content takes over at 0.8s. Add a "Skip" text that appears after 0.5s and immediately reveals the content. Store a flag in localStorage so returning visitors skip the animation. The couple can disable this entirely via wedding.envelope_enabled. Wrap the invite page content with this component.
```

---

## Step 11: RSVP Form + API

```
Build the RSVP form and API. Create components/invite/RsvpForm.tsx: it renders exactly invite.max_guests guest slots. Each slot has a name input, an attending/declining toggle (two buttons), and a meal preference dropdown (only shown when attending). Add a dietary notes textarea at the bottom. The submit button says "Send Response". On submit, POST to /api/rsvp with the token and guest array. Create app/api/rsvp/route.ts: 1) Rate limit by token (10 req/min using Upstash), 2) Look up invite by token, 3) Validate guests.length <= invite.max_guests, 4) Validate all fields with Zod, 5) Delete existing RSVPs for this invite (allow re-submission), 6) Insert new RSVPs, 7) Update invite status to 'responded', 8) Return { success: true, table_number }. After successful submission, the form transforms into a confirmation state showing a checkmark, "Your response has been received", and the table number if assigned.
```

---

## Step 12: Remaining Invite Sections

```
Build the remaining guest-facing invite page sections. Create ItineraryTimeline.tsx: a vertical timeline with time on the left, a dot + connecting line in the middle, and event name + description on the right. Dot is filled for the first event, outlined for the rest. Create QnaSection.tsx: list of pinned FAQs as expandable accordions (tap to reveal answer), plus an "Ask a question" input at the bottom that POSTs to /api/question. Create PhotoGallery.tsx: a responsive grid of images (2 columns on mobile, 3 on desktop) loaded from the photos table. Tap opens a full-screen lightbox with swipe navigation. Lazy-load all images. Create VenueMap.tsx: a static Google Maps image using the Maps Static API with venue_lat/venue_lng, with a "Get Directions" button that opens Google Maps in a new tab. Create TableReveal.tsx: shows the table number and table name in a decorative card — only visible if invite.table_number is set. Wire all sections into the invite page, conditionally rendered based on wedding.selected_blocks.
```

---

## Step 13: Dashboard Layout + Overview

```
Build the couple's dashboard. Create app/dashboard/layout.tsx with a sidebar navigation (desktop) / bottom tab bar (mobile). Sidebar links: Overview, Guests, Design, Itinerary, Seating, Photos, Q&A, Settings. The sidebar header shows "The Love List" logo in sage. Create app/dashboard/page.tsx as the overview/RSVP tracker. Show: 1) Three stat cards in a row: Confirmed (sage), Pending (amber/warning), Declined (muted) — pulling from wedding_stats, 2) A response rate progress bar (X% of invites responded), 3) A live RSVP feed using Supabase Realtime — subscribe to rsvps table inserts, show newest first with guest name, party size, attending status, and timestamp, 4) A meal breakdown section showing counts per meal preference, 5) A dietary flags list showing guests with special notes, 6) An "Export Guest List" button that hits /api/export/guests. All dashboard UI uses Montserrat. No blobs, no decorative elements — clean and functional.
```

---

## Step 14: Guest Manager

```
Build app/dashboard/guests/page.tsx. Show a table/list of all invites for this wedding with columns: Guest Name, Allocation, Responded (count/total), Status badge (pending/confirmed/declined), Table Number, and actions (edit, delete, copy link). Above the table: an "Add Guest" button that opens a row with name input + allocation stepper, and an "Import CSV" button. The CSV import should accept a file with columns: name, allocation, email (optional), phone (optional). Below the table: "Export to CSV" button that downloads all guest data. Each invite row is expandable — clicking reveals the individual RSVPs within that invite (person names, meal preferences, dietary notes). Add a search/filter bar at the top that filters by name or status. The invite link for each guest should be copyable with a click (copy thelovelist.com/invite/{token} to clipboard with a toast confirmation).
```

---

## Step 15: Itinerary Builder

```
Build app/dashboard/itinerary/page.tsx. Show a vertical list of events that can be drag-reordered. Each event card has: name input, event type dropdown (ceremony, reception, mehndi, nikah, walima, cocktail, custom), start time picker, end time picker (optional), location input, description textarea, and a delete button. An "Add Event" button at the bottom creates a new empty event. When the couple saves, update all events in the database with their new sort_order. Show a live preview panel on the right (desktop) or below (mobile) that renders the ItineraryTimeline component with the current data — so the couple sees exactly what guests will see as they edit.
```

---

## Step 16: Seating Chart

```
Build app/dashboard/seating/page.tsx. Show a list of all invites grouped by status (confirmed first, then pending). Each row shows: guest name, party size (attending count), and a table number input + table name input. The couple can type a number and a name (e.g. "7" + "The Willow Table"). Add a batch assign feature: select multiple invites with checkboxes, then assign them all to the same table number at once. Show a summary at the top: "X of Y confirmed guests have table assignments". When saved, the table_number and table_name are written to the invites table, and guests will see them on their invite page immediately (after ISR revalidation).
```

---

## Step 17: Photo Gallery Manager

```
Build app/dashboard/photos/page.tsx. Show a drag-to-reorder grid of uploaded photos. Each photo card shows the image thumbnail, a caption input below it, and a delete button. An "Upload Photos" button opens a file picker that accepts multiple images (jpg, png, webp, max 5MB each). Uploaded files go to Supabase Storage in a wedding-specific bucket (wedding-photos/{wedding_id}/). After upload, create a record in the photos table with the public URL and sort_order. Limit to 12 photos max. Show a note: "These photos will appear in your invite's photo gallery section." The grid should use the same 2-3 column layout that guests will see.
```

---

## Step 18: Zone Editor (Custom Design Upload)

```
Build app/dashboard/design/page.tsx. This is the Canva upload + zone editor. Show two modes: "Use Template" (current template preview) and "Upload Custom Design". When the couple uploads an image (PNG/PDF, max 10MB), store it in Supabase Storage and set wedding.custom_design_url. Then show the zone editor: the uploaded image displayed in a phone-aspect-ratio preview, with a properties panel on the right. The couple can add text zones from a menu (Couple Names, Date, Venue, Guest Name, Custom Text). Each zone appears as a dashed-border overlay on the image that they can click to select. The properties panel shows: text content input (with {{guest_name}} template variable hints), font family dropdown (Playfair Display, Cormorant Garamond, Montserrat, Yeseva One, Lora, Crimson Text), font size slider, color picker with quick swatches, text alignment buttons (left/center/right), and width slider. Clicking on the image repositions the selected zone. Add a "Guest Preview" toggle that replaces template variables with sample data. Save the zone config as JSONB to wedding.design_zones.
```

---

## Step 19: Stripe + Settings

```
Build the payments integration and settings page. Create lib/stripe.ts with the Stripe client config. Create app/api/webhook/stripe/route.ts that handles checkout.session.completed events — update the couple's plan_tier in the database. Create app/dashboard/settings/page.tsx with sections: 1) "Your Plan" showing current tier with upgrade buttons that redirect to Stripe Checkout (create checkout sessions for Standard $29 and Premium $59, one-time payments), 2) "Wedding Details" form (names, date, venue, slug), 3) "Invite Settings" with toggles for envelope animation (on/off), envelope wax color picker, envelope initials input, and Save the Date mode toggle, 4) "Danger Zone" with delete wedding button (confirmation modal). Also build the share center section: show the wedding link, copy button, QR code (generate client-side as SVG), and WhatsApp/Email/iMessage share buttons with pre-filled messages.
```

---

## Step 20: Marketing Landing Page

```
Build the marketing landing page at app/page.tsx. This is the first thing visitors see. Structure: 1) Nav bar: "The Love List" logo (Yeseva One, sage) on the left, links (Templates, Pricing, Demo) in the center, "Get started" sage CTA on the right. Transparent bg that becomes white on scroll. 2) Hero section: sage blob background with the hand-drawn wavy SVG border with bow (create components/marketing/HeroBorder.tsx as a reusable SVG component). Inside the border: small caps label "Digital wedding invitations", Yeseva One headline "Your love story, beautifully shared", Cormorant Garamond subtitle, and sage CTA button. 3) Social proof bar: "Trusted by X+ couples" with a 5-star rating. 4) "How it works" section: 3 steps with icons (Choose template → Customize & add guests → Share one link). 5) Feature cards section: 3 white cards with subtle shadows showcasing key features (Smart RSVP with seat caps, One link for everything, Custom Canva designs). 6) Template gallery: horizontal scrollable row of template previews with "View demo" buttons. 7) Pricing: 3-tier comparison table (Free, Standard $29, Premium $59) with feature checkmarks. Standard is highlighted as "Most popular". 8) Footer: logo, links, "Made with love" tagline. Use Framer Motion for scroll-triggered entrance animations (fade up with spring physics). Mobile responsive throughout.
```

---

## After All Steps

Run through and verify:
1. Sign up as a new couple → complete setup wizard → verify wedding + invites created in Supabase
2. Open an invite link in incognito → see envelope animation → RSVP → verify data saved
3. Check dashboard → see realtime RSVP appear → assign table number → verify guest sees it
4. Toggle dark mode everywhere → verify dark green accents, not lightened sage
5. Test on mobile viewport → verify all pages are responsive
6. Run Lighthouse → verify performance score > 90 on invite page (ISR caching)
