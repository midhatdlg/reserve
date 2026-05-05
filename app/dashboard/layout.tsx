'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ── Nav icons (24×24 line-style SVGs) ─────────────────────────────── */
function IconOverview() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconGuests() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 21v-1.5a3 3 0 00-2.5-2.96" />
    </svg>
  );
}
function IconDesign() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}
function IconItinerary() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconSeating() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v5M12 15v5M4 12h5M15 12h5" />
    </svg>
  );
}
function IconPhotos() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function IconQA() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

const ICON_MAP: Record<string, () => React.JSX.Element> = {
  Overview: IconOverview,
  Guests: IconGuests,
  Design: IconDesign,
  Itinerary: IconItinerary,
  Seating: IconSeating,
  Photos: IconPhotos,
  'Q&A': IconQA,
  Settings: IconSettings,
};

const NAV_MAIN = [
  { href: '/dashboard',           label: 'Overview' },
  { href: '/dashboard/guests',    label: 'Guests' },
  { href: '/dashboard/design',    label: 'Design' },
  { href: '/dashboard/itinerary', label: 'Itinerary' },
  { href: '/dashboard/seating',   label: 'Seating' },
  { href: '/dashboard/photos',    label: 'Photos' },
  { href: '/dashboard/questions', label: 'Q&A' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Icon Sidebar (desktop) ─────────────────────────────────────── */}
      <aside style={{
        width: 80,
        flexShrink: 0,
        background: 'linear-gradient(165deg, #345548 0%, #3f5f48 30%, #507050 55%, #6e8e6e 75%, #96a878 88%, #d4b88a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
        className="dashboard-sidebar"
      >
        {/* R Logo */}
        <div style={{ padding: '24px 0 20px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 32,
              fontStyle: 'italic',
              color: '#F2F0EC',
              display: 'block',
              textAlign: 'center',
              lineHeight: 1,
            }}>
              R
            </span>
          </Link>
        </div>

        {/* Main nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', padding: '0 8px' }}>
          {NAV_MAIN.map(({ href, label }) => {
            const active = isActive(href);
            const Icon = ICON_MAP[label];
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  width: '100%',
                  padding: '10px 4px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  background: active ? 'rgba(242,240,236,0.12)' : 'transparent',
                  color: active ? '#F2F0EC' : 'rgba(242,240,236,0.5)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {Icon && <Icon />}
                <span style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: 9,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.3px',
                  textAlign: 'center',
                }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div style={{ padding: '8px 8px 16px', width: '100%' }}>
          <Link
            href="/dashboard/settings"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              width: '100%',
              padding: '10px 4px',
              borderRadius: 8,
              textDecoration: 'none',
              background: isActive('/dashboard/settings') ? 'rgba(242,240,236,0.12)' : 'transparent',
              color: isActive('/dashboard/settings') ? '#F2F0EC' : 'rgba(242,240,236,0.5)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <IconSettings />
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 9,
              fontWeight: isActive('/dashboard/settings') ? 600 : 400,
              letterSpacing: '0.3px',
            }}>
              Settings
            </span>
          </Link>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, padding: '40px 36px 80px' }}>
          {children}
        </main>
      </div>

      {/* ── Bottom tab bar (mobile) ───────────────────────────────────── */}
      <nav
        className="dashboard-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#2C3A2E',
          display: 'flex',
          zIndex: 20,
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {NAV_MAIN.slice(0, 5).map(({ href, label }) => {
          const active = isActive(href);
          const Icon = ICON_MAP[label];
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                textDecoration: 'none',
                color: active ? '#F2F0EC' : 'rgba(242,240,236,0.4)',
              }}
            >
              {Icon && <Icon />}
              <span style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 9,
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.3px',
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
