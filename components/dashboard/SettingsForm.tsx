'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import type { Wedding, Couple } from '@/types';
import { isValidTimeZone } from '@/lib/timezone';

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

interface Props {
  wedding: Wedding;
  couple: Couple;
  upgraded: boolean;
}

export function SettingsForm({ wedding, couple, upgraded }: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Wedding details state
  const [title, setTitle] = useState(wedding.title ?? '');
  const [weddingDate, setWeddingDate] = useState(wedding.wedding_date ?? '');
  const [venueName, setVenueName] = useState(wedding.venue_name ?? '');
  const [venueAddress, setVenueAddress] = useState(wedding.venue_address ?? '');
  const [slug, setSlug] = useState(wedding.slug ?? '');
  const [timezone, setTimezone] = useState(wedding.timezone ?? 'UTC');
  const timezoneValid = isValidTimeZone(timezone);

  // Invite settings state
  const [envelopeEnabled, setEnvelopeEnabled] = useState(wedding.envelope_enabled);
  const [saveTheDateMode, setSaveTheDateMode] = useState(wedding.save_the_date_mode);
  const [isPublished, setIsPublished] = useState(wedding.is_published);
  const [strictNameMatch, setStrictNameMatch] = useState<boolean>(wedding.strict_name_match ?? true);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(
    ((wedding.settings as { reminders_enabled?: boolean } | null)?.reminders_enabled !== false)
  );

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  async function saveWeddingDetails() {
    if (!timezoneValid) return;
    setSaving('details');
    await supabase.from('weddings').update({
      title, wedding_date: weddingDate || null,
      venue_name: venueName || null, venue_address: venueAddress || null,
      slug,
      timezone,
    }).eq('id', wedding.id);
    setSaving(null);
    flashSaved('details');
  }

  async function saveInviteSettings() {
    setSaving('invite');
    const existingSettings = (wedding.settings as Record<string, unknown> | null) ?? {};
    await supabase.from('weddings').update({
      envelope_enabled: envelopeEnabled,
      save_the_date_mode: saveTheDateMode,
      is_published: isPublished,
      strict_name_match: strictNameMatch,
      settings: { ...existingSettings, reminders_enabled: remindersEnabled },
    }).eq('id', wedding.id);
    setSaving(null);
    flashSaved('invite');
  }

  function flashSaved(key: string) {
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  async function handleUpgrade(tier: 'standard' | 'premium') {
    setCheckoutLoading(tier);
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setCheckoutLoading(null);
  }

  async function deleteWedding() {
    setDeleting(true);
    await supabase.from('weddings').delete().eq('id', wedding.id);
    window.location.href = '/setup';
  }

  // Meal options state
  const [mealOptions, setMealOptions] = useState<string[]>(wedding.meal_options ?? ['Chicken', 'Fish', 'Vegetarian', 'Vegan']);
  const [newMeal, setNewMeal] = useState('');

  function addMealOption() {
    const trimmed = newMeal.trim();
    if (!trimmed || mealOptions.includes(trimmed)) return;
    setMealOptions([...mealOptions, trimmed]);
    setNewMeal('');
  }

  function removeMealOption(index: number) {
    setMealOptions(mealOptions.filter((_, i) => i !== index));
  }

  async function saveMealOptions() {
    setSaving('meals');
    await supabase.from('weddings').update({ meal_options: mealOptions }).eq('id', wedding.id);
    setSaving(null);
    flashSaved('meals');
  }

  const PLAN_FEATURES: Record<string, string[]> = {
    free: ['50 guests', 'RSVP tracking', 'Guest links', 'Countdown timer'],
    standard: ['200 guests', 'Table assignments', 'Itinerary builder', 'Q&A section', 'Meal preferences', 'Export CSV'],
    premium: ['Everything in Standard', 'Unlimited guests', 'Per-person seating', 'Priority support'],
  };

  return (
    <div>
      {upgraded && (
        <div style={{
          background: 'var(--sage-dim)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🎉</span>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--sage)', fontWeight: 600 }}>
            Plan upgraded successfully! Your new features are now active.
          </span>
        </div>
      )}

      {/* Your Plan */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Your Plan</h2>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
          background: 'var(--sage-dim)', padding: '6px 14px', borderRadius: 20,
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600, color: 'var(--sage)', textTransform: 'capitalize' }}>
            {couple.plan_tier} Plan
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {(PLAN_FEATURES[couple.plan_tier] ?? []).map((f) => (
            <span key={f} style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 11, padding: '4px 10px',
              background: 'var(--surface-alt)', borderRadius: 20, color: 'var(--text-secondary)',
            }}>{f}</span>
          ))}
        </div>
        {couple.plan_tier === 'free' && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Standard <span style={{ color: 'var(--sage)' }}>£29</span></div>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}>One-time payment</div>
              {PLAN_FEATURES.standard.map((f) => (
                <div key={f} style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>✓ {f}</div>
              ))}
              <Button size="sm" onClick={() => handleUpgrade('standard')} loading={checkoutLoading === 'standard'} style={{ marginTop: 12, width: '100%' }}>
                Upgrade to Standard
              </Button>
            </div>
            <div style={{ background: 'var(--sage-dim)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--sage)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 4 }}>MOST POPULAR</div>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Premium <span style={{ color: 'var(--sage)' }}>£59</span></div>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}>One-time payment</div>
              {PLAN_FEATURES.premium.map((f) => (
                <div key={f} style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>✓ {f}</div>
              ))}
              <Button size="sm" onClick={() => handleUpgrade('premium')} loading={checkoutLoading === 'premium'} style={{ marginTop: 12, width: '100%' }}>
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Wedding Details */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Wedding Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sarah & James" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Wedding Date</label>
            <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Venue Name</label>
            <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="The Grand Hall" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Venue Address</label>
            <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Wedding Lane, London" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Invite URL slug</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 10px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '7px 0 0 7px', whiteSpace: 'nowrap' }}>
                {appUrl}/invite/
              </span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} style={{ ...inputStyle, borderRadius: '0 7px 7px 0', flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={labelStyle} htmlFor="tz-input">Timezone</label>
            <input
              id="tz-input"
              list="tz-options"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Europe/London"
              style={{
                ...inputStyle,
                borderColor: timezoneValid ? 'var(--border)' : '#C4564A',
              }}
              aria-invalid={!timezoneValid}
              aria-describedby="tz-help"
            />
            <datalist id="tz-options">
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
            <p
              id="tz-help"
              role={timezoneValid ? undefined : 'alert'}
              style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 11,
                color: timezoneValid ? 'var(--text-tertiary)' : '#C4564A',
                margin: '6px 0 0',
              }}
            >
              {timezoneValid
                ? 'Used for the countdown and calendar invite.'
                : 'That does not look like a valid IANA timezone (e.g. Europe/London).'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <Button size="sm" loading={saving === 'details'} disabled={!timezoneValid} onClick={saveWeddingDetails}>Save</Button>
          {saved === 'details' && <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)' }}>Saved</span>}
        </div>
      </section>

      {/* Meal Options */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Meal Options</h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 14px' }}>
          Guests will choose from these options when they RSVP.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {mealOptions.map((opt, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-montserrat)', fontSize: 12,
              padding: '5px 12px', borderRadius: 20,
              background: 'var(--sage-dim)', color: 'var(--text)',
              border: '1px solid var(--border)',
            }}>
              {opt}
              <button
                type="button"
                onClick={() => removeMealOption(i)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, color: 'var(--text-tertiary)', padding: 0, lineHeight: 1,
                }}
              >×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMealOption(); } }}
            placeholder="Add option (e.g. Lamb)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={addMealOption}
            style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
              color: 'var(--sage)', background: 'var(--sage-dim)',
              border: '1px solid var(--border)', borderRadius: 7,
              padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >+ Add</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <Button size="sm" loading={saving === 'meals'} onClick={saveMealOptions}>Save</Button>
          {saved === 'meals' && <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)' }}>Saved</span>}
        </div>
      </section>

      {/* Invite Settings */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Invite Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ToggleRow
            label="Published"
            description="Guests can access your invite link"
            value={isPublished}
            onChange={setIsPublished}
          />
          <ToggleRow
            label="Save the Date mode"
            description="Only show date, venue, and countdown — no RSVP"
            value={saveTheDateMode}
            onChange={setSaveTheDateMode}
          />
          <ToggleRow
            label="Envelope animation"
            description="Guests see an envelope opening on first visit"
            value={envelopeEnabled}
            onChange={setEnvelopeEnabled}
          />
          <ToggleRow
            label="Email reminders"
            description="Auto-nudge non-responders 14, 7 and 3 days before the wedding"
            value={remindersEnabled}
            onChange={setRemindersEnabled}
          />
          <ToggleRow
            label="Strict name matching"
            description="When ON, only guests whose name is on the list may RSVP. When OFF, anyone with the link can add themselves."
            value={strictNameMatch}
            onChange={setStrictNameMatch}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <Button size="sm" loading={saving === 'invite'} onClick={saveInviteSettings}>Save</Button>
          {saved === 'invite' && <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)' }}>Saved</span>}
        </div>
      </section>

      {/* Share */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Share Your Invite</h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-alt)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
            {appUrl}/invite/{wedding.slug}
          </span>
          <button
            onClick={() => { navigator.clipboard.writeText(`${appUrl}/invite/${wedding.slug}`); flashSaved('link'); }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)', fontSize: 11, color: saved === 'link' ? 'var(--sage)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}
          >
            {saved === 'link' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`You're invited! View our wedding invite: ${appUrl}/invite/${wedding.slug}`)}`, color: '#25D366' },
            { label: 'Email', href: `mailto:?subject=${encodeURIComponent("You're invited!")}&body=${encodeURIComponent(`View our wedding invite: ${appUrl}/invite/${wedding.slug}`)}`, color: 'var(--text-secondary)' },
          ].map(({ label, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600, color,
              padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
              textDecoration: 'none', background: 'var(--surface)',
            }}>{label}</a>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section style={{ ...sectionStyle, borderColor: 'rgba(220,38,38,0.2)' }}>
        <h2 style={{ ...sectionTitle, color: '#DC2626' }}>Danger Zone</h2>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
          Deleting your wedding removes all guests, RSVPs, and data. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600, color: '#DC2626',
            background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer',
          }}
        >
          Delete Wedding
        </button>
      </section>

      {/* Delete modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14,
            padding: '28px 24px', maxWidth: 380, width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 10px' }}>
              Delete wedding?
            </h3>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              All guests, RSVPs, photos, and events will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={deleteWedding}
                disabled={deleting}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'white', background: '#DC2626', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >{deleting ? 'Deleting…' : 'Yes, delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: value ? 'var(--sage)' : 'var(--border)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', display: 'block',
        }} />
      </button>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
  padding: '20px 22px', marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
  color: 'var(--text)', margin: '0 0 16px', letterSpacing: '0.2px',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
  color: 'var(--text-tertiary)', marginBottom: 5, letterSpacing: '0.3px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-montserrat)',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
