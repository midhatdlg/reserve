'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard',           label: 'Overview' },
  { href: '/dashboard/guests',    label: 'Guests' },
  { href: '/dashboard/itinerary', label: 'Itinerary' },
  { href: '/dashboard/seating',   label: 'Seating' },
  { href: '/dashboard/design',    label: 'Design' },
  { href: '/dashboard/questions', label: 'Questions' },
  { href: '/dashboard/photos',    label: 'Photos' },
  { href: '/dashboard/settings',  label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar (desktop) ───────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'linear-gradient(165deg, #345548 0%, #3f5f48 30%, #507050 55%, #6e8e6e 75%, #96a878 88%, #d4b88a 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
        className="dashboard-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 26,
              fontStyle: 'italic',
              color: '#F2F0EC',
              display: 'block',
              lineHeight: 1.1,
            }}>
              Reserve
            </span>
            <span style={{
              fontFamily: 'var(--font-caslon)',
              fontSize: 11,
              fontStyle: 'italic',
              color: 'rgba(242,240,236,0.5)',
              display: 'block',
              marginTop: 2,
            }}>
              the R in RSVP
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '2px',
            color: 'rgba(242,240,236,0.35)',
            margin: '0 12px 10px',
            textTransform: 'uppercase',
          }}>
            Your Wedding
          </p>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '8px 14px',
                borderRadius: 6,
                marginBottom: 1,
                textDecoration: 'none',
                background: isActive(href) ? 'rgba(242,240,236,0.12)' : 'transparent',
                color: isActive(href) ? '#F2F0EC' : 'rgba(242,240,236,0.55)',
                fontFamily: 'var(--font-montserrat)',
                fontSize: 13,
                fontWeight: isActive(href) ? 500 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: theme toggle + sign out */}
        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, color: 'rgba(242,240,236,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Theme
            </span>
            <ThemeToggle />
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            style={{
              width: '100%', padding: '8px', borderRadius: 6,
              border: '1px solid rgba(242,240,236,0.15)', background: 'transparent',
              fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
              color: 'rgba(242,240,236,0.4)', cursor: 'pointer', letterSpacing: '0.3px',
              transition: 'all 0.15s',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, padding: '40px 36px 80px' }}>
          {children}
        </main>
      </div>

      {/* ── Bottom tab bar (mobile) ─────────────────────────────────────── */}
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
        {NAV.slice(0, 5).map(({ href, label }) => (
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
              color: isActive(href) ? '#F2F0EC' : 'rgba(242,240,236,0.4)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 9,
              fontWeight: isActive(href) ? 600 : 400,
              letterSpacing: '0.3px',
            }}>
              {label}
            </span>
          </Link>
        ))}
      </nav>

    </div>
  );
}
