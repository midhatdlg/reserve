'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const FEATURES = [
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Smart RSVP',
    desc: 'Each guest gets a unique link with an enforced seat cap. No awkward plus-one surprises.',
  },
  {
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    title: 'Table assignments',
    desc: 'Assign guests to tables. They open their link on the day and see exactly where to sit.',
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Day-of itinerary',
    desc: "Ceremony, dinner, speeches — your guests always know what's happening next.",
  },
  {
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01',
    title: 'Guest Q&A',
    desc: 'Dress code, parking, gifts — answer it once, share it with everyone.',
  },
  {
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Photo gallery',
    desc: 'Upload engagement photos your guests can browse right from their invite link.',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Live countdown',
    desc: 'A beautiful countdown timer that builds anticipation as the big day approaches.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '£0',
    highlight: false,
    features: ['50 guests', 'RSVP tracking', 'Guest links', 'Countdown timer'],
  },
  {
    name: 'Standard',
    price: '£29',
    highlight: true,
    note: 'one-time',
    features: ['200 guests', 'Table assignments', 'Itinerary builder', 'Q&A section', 'Meal preferences', 'CSV export'],
  },
  {
    name: 'Premium',
    price: '£59',
    highlight: false,
    note: 'one-time',
    features: ['Everything in Standard', 'Unlimited guests', 'Per-person seating', 'Priority support'],
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    setTimeout(() => setHeroReady(true), 100);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font-montserrat)', color: '#2C2C2C', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(245,240,232,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212,207,198,0.4)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 32px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', height: 64,
        }}>
          <Link href="/" style={{ textDecoration: 'none', flex: 1 }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)', fontSize: 24,
              fontStyle: 'italic', fontWeight: 600,
              color: scrolled ? '#2C3A2E' : '#FFFFFF',
              transition: 'color 0.3s',
            }}>Reserve</span>
          </Link>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {['Features', 'Pricing'].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 500,
                color: scrolled ? '#6B6560' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none', transition: 'color 0.3s',
              }}>{l}</a>
            ))}
            <Link href="/login" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 500,
              color: scrolled ? '#6B6560' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none', transition: 'color 0.3s',
            }}>Sign in</Link>
            <Link href="/login" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
              color: scrolled ? '#F2F0EC' : '#2C3A2E',
              background: scrolled ? '#2C3A2E' : 'rgba(255,255,255,0.95)',
              padding: '10px 22px', borderRadius: 20,
              textDecoration: 'none', transition: 'all 0.3s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Start free
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — vivid gradient mesh ─────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Vivid gradient mesh — bold, saturated, Stripe-style */}
        <div className="hero-gradient" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: [
            'linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 25%, #3a7a5a 40%, #5a9a6a 55%, #8aba7a 70%, #c4a87a 85%, #d4b88a 100%)',
          ].join(', '),
        }}>
          {/* Layered radial gradients for mesh effect */}
          <div style={{
            position: 'absolute', inset: 0,
            background: [
              'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(10,40,25,0.9) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 80% at 100% 20%, rgba(90,160,110,0.6) 0%, transparent 50%)',
              'radial-gradient(ellipse 70% 50% at 60% 100%, rgba(196,168,122,0.7) 0%, transparent 50%)',
              'radial-gradient(ellipse 50% 40% at 20% 60%, rgba(44,90,62,0.5) 0%, transparent 50%)',
              'radial-gradient(ellipse 40% 50% at 80% 70%, rgba(160,200,140,0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse 90% 40% at 50% -10%, rgba(26,58,42,0.8) 0%, transparent 50%)',
            ].join(', '),
          }} />
          {/* Warm wash at bottom for depth */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(245,240,232,0.15) 100%)',
          }} />
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1240, margin: '0 auto',
          padding: '160px 40px 120px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          alignItems: 'center',
          gap: 48,
        }}
          className="hero-grid"
        >
          {/* Left: Copy */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 0.95,
              margin: '0 0 32px',
              letterSpacing: '-0.02em',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.7s ease 0.15s',
            }}>
              Guest list<br />
              infrastructure<br />
              <span style={{ fontStyle: 'italic', color: 'rgba(196,168,122,0.9)' }}>for weddings</span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 40px',
              lineHeight: 1.7,
              maxWidth: 480,
              opacity: heroReady ? 1 : 0,
              transition: 'opacity 0.7s ease 0.35s',
            }}>
              Couples of all sizes use Reserve to manage RSVPs, assign tables, share itineraries, and answer guest questions — all from a single unique link per guest.
            </p>

            <div style={{
              display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
              opacity: heroReady ? 1 : 0,
              transition: 'opacity 0.7s ease 0.5s',
            }}>
              <Link href="/login" style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600,
                color: '#2C3A2E', background: '#FFFFFF',
                padding: '14px 28px', borderRadius: 22,
                textDecoration: 'none', display: 'inline-flex',
                alignItems: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                Start now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#features" style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 500,
                color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                How it works
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>

          {/* Right: Floating product cards */}
          <div style={{
            position: 'relative', height: 580,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
            className="hero-cards"
          >
            {/* Card 1: Phone mockup (invite preview) */}
            <div style={{
              position: 'absolute', left: 0, top: 20,
              width: 260, borderRadius: 28,
              background: '#FFFFFF',
              boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden', zIndex: 2,
            }}>
              <div style={{
                background: '#F5F0E8', padding: '36px 20px 28px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 9,
                  letterSpacing: '3px', color: '#8B7355',
                  textTransform: 'uppercase', marginBottom: 20,
                }}>YOU ARE INVITED</div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 12,
                  fontStyle: 'italic', color: '#8B7355', marginBottom: 2,
                }}>O &amp; R</div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 28,
                  fontWeight: 400, color: '#2C2C2C', textAlign: 'center',
                  lineHeight: 1.1, marginBottom: 2,
                }}>Olivia</div>
                <div style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 7,
                  letterSpacing: '3px', color: '#8B7355',
                  textTransform: 'uppercase', margin: '5px 0',
                }}>IS MARRYING</div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 28,
                  fontWeight: 400, color: '#2C2C2C', textAlign: 'center',
                  lineHeight: 1.1, marginBottom: 14,
                }}>Raheem</div>
                <div style={{ width: 1, height: 16, background: '#D4CFC6', marginBottom: 14 }} />
                <div style={{
                  fontFamily: 'var(--font-caslon, Georgia, serif)',
                  fontSize: 10, fontStyle: 'italic', color: '#6B6560',
                  textAlign: 'center', lineHeight: 1.6, marginBottom: 20,
                }}>
                  Saturday, September twelfth<br />two thousand twenty-six
                </div>
                {/* RSVP buttons */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{
                    background: '#2C3A2E', borderRadius: 7, padding: '9px',
                    textAlign: 'center', fontFamily: 'var(--font-caslon, Georgia, serif)',
                    fontSize: 10, fontStyle: 'italic', color: '#F2F0EC',
                  }}>Joyfully accepts</div>
                  <div style={{
                    border: '1px solid #D4CFC6', borderRadius: 7, padding: '9px',
                    textAlign: 'center', fontFamily: 'var(--font-caslon, Georgia, serif)',
                    fontSize: 10, fontStyle: 'italic', color: '#6B6560',
                  }}>Regretfully declines</div>
                </div>
              </div>
            </div>

            {/* Card 2: Dashboard snippet (floating right/behind) */}
            <div style={{
              position: 'absolute', right: -20, top: 60,
              width: 280, borderRadius: 16,
              background: '#FFFFFF',
              boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)',
              overflow: 'hidden', zIndex: 1,
              padding: '20px',
            }}>
              {/* Dashboard header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2C3A2E' }} />
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: '#2C2C2C' }}>RESERVE</span>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, color: '#9E9890', marginLeft: 'auto' }}>Dashboard</span>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Attending', value: '86', color: '#2C3A2E' },
                  { label: 'Pending', value: '42', color: '#8B7355' },
                  { label: 'Regrets', value: '12', color: '#9E9890' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: '#F5F0E8', borderRadius: 8, padding: '10px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontStyle: 'italic', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 8, color: '#9E9890', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent RSVPs */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, fontWeight: 600, color: '#9E9890', letterSpacing: '1px', marginBottom: 10 }}>RECENT RSVPS</div>
                {[
                  { name: 'Sarah Chen', status: 'Accepted', time: '2m ago' },
                  { name: 'James Ali', status: 'Accepted +1', time: '15m ago' },
                  { name: 'Priya Patel', status: 'Declined', time: '1h ago' },
                ].map((r) => (
                  <div key={r.name} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 0', borderBottom: '1px solid #F0EBE3',
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: r.status.startsWith('Accepted') ? '#2C3A2E' : '#D4CFC6',
                    }} />
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#2C2C2C', flex: 1 }}>{r.name}</span>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, color: '#9E9890' }}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Small table card (floating bottom-right) */}
            <div style={{
              position: 'absolute', right: 10, bottom: 10,
              width: 180, borderRadius: 12,
              background: '#FFFFFF',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
              padding: '16px', zIndex: 3,
            }}>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, fontWeight: 600, color: '#9E9890', letterSpacing: '1px', marginBottom: 10 }}>TABLE PLAN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                  <div key={n} style={{
                    width: '100%', aspectRatio: '1', borderRadius: 4,
                    background: n <= 8 ? '#2C3A2E' : 'transparent',
                    border: n > 8 ? '1px solid #D4CFC6' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-montserrat)', fontSize: 8,
                    color: n <= 8 ? '#F2F0EC' : '#9E9890',
                  }}>{n}</div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 9, color: '#6B6560', marginTop: 8 }}>
                8 of 12 seated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────── */}
      <section style={{
        borderBottom: '1px solid rgba(212,207,198,0.4)',
        background: '#FEFCF9',
        padding: '40px 32px',
      }}>
        <FadeIn>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 56, flexWrap: 'wrap',
          }}>
            {[
              { val: '5 min', desc: 'to set up' },
              { val: '1 link', desc: 'per guest' },
              { val: '0 apps', desc: 'to download' },
              { val: '140+', desc: 'weddings served' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 26,
                  fontStyle: 'italic', fontWeight: 600, color: '#2C3A2E',
                }}>{s.val}</span>
                <span style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 13,
                  color: '#9E9890',
                }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Features grid ──────────────────────────────────────────── */}
      <section id="features" style={{
        padding: '120px 32px',
        background: '#F5F0E8',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ maxWidth: 560, marginBottom: 72 }}>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                fontWeight: 600, letterSpacing: '1px', color: '#8B7355',
                textTransform: 'uppercase', margin: '0 0 16px',
              }}>Features</p>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 500, color: '#2C2C2C',
                margin: '0 0 16px', lineHeight: 1.1,
              }}>
                Everything your guests need,<br />
                <span style={{ fontStyle: 'italic' }}>nothing they don&apos;t</span>
              </h2>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 16,
                color: '#6B6560', margin: 0, lineHeight: 1.7,
              }}>
                One link gives each guest access to RSVP, meal choices, their table assignment, the day&apos;s schedule, and answers to common questions.
              </p>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'rgba(212,207,198,0.4)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
            className="features-grid"
          >
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.06} style={{ height: '100%' }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '36px 32px',
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(44,58,46,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2C3A2E', marginBottom: 20,
                  }}>
                    <FeatureIcon path={f.icon} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 15,
                    fontWeight: 600, color: '#2C2C2C', margin: '0 0 8px',
                  }}>{f.title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 14,
                    color: '#6B6560', margin: 0, lineHeight: 1.65, flex: 1,
                  }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — dark section ────────────────────────────── */}
      <section style={{
        background: '#2C3A2E',
        padding: '120px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(circle 600px at 10% 20%, rgba(74,94,76,0.4) 0%, transparent 50%)',
            'radial-gradient(circle 500px at 90% 80%, rgba(139,115,85,0.15) 0%, transparent 50%)',
          ].join(', '),
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                fontWeight: 600, letterSpacing: '1px',
                color: 'rgba(196,168,122,0.8)', textTransform: 'uppercase',
                margin: '0 0 16px',
              }}>How it works</p>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 500, color: '#F2F0EC',
                margin: 0, lineHeight: 1.1,
              }}>
                Three steps to<br />
                <span style={{ fontStyle: 'italic' }}>a stress-free guest list</span>
              </h2>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32,
          }}
            className="steps-grid"
          >
            {[
              { n: '01', title: 'Set up your wedding', desc: 'Add your names, date, and guest list. Takes under 5 minutes.' },
              { n: '02', title: 'Share each guest\'s link', desc: 'Drop it in your Canva invite, WhatsApp it, or print a QR code.' },
              { n: '03', title: 'Guests RSVP & find their seat', desc: 'They confirm attendance, choose their meal, and check their table on the day.' },
            ].map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.12}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: 64,
                    fontStyle: 'italic', fontWeight: 400,
                    color: 'rgba(242,240,236,0.08)', lineHeight: 1,
                    display: 'block', marginBottom: 16,
                  }}>{step.n}</span>
                  <h3 style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 16,
                    fontWeight: 600, color: '#F2F0EC',
                    margin: '0 0 10px',
                  }}>{step.title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 14,
                    color: 'rgba(242,240,236,0.5)', margin: 0, lineHeight: 1.7,
                  }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────── */}
      <section style={{
        padding: '100px 32px',
        background: '#FEFCF9',
        borderBottom: '1px solid rgba(212,207,198,0.4)',
      }}>
        <FadeIn>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 28,
            }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#8B7355">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <blockquote style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontStyle: 'italic', fontWeight: 400, color: '#2C2C2C',
              margin: '0 0 24px', lineHeight: 1.45,
            }}>
              &ldquo;We sent 140 invites in one afternoon. Every guest knew their seat before they arrived.&rdquo;
            </blockquote>
            <p style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 13,
              fontWeight: 500, color: '#6B6560',
            }}>A couple who used Reserve</p>
          </div>
        </FadeIn>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" style={{
        padding: '120px 32px',
        background: '#F5F0E8',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                fontWeight: 600, letterSpacing: '1px', color: '#8B7355',
                textTransform: 'uppercase', margin: '0 0 16px',
              }}>Pricing</p>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 500, color: '#2C2C2C',
                margin: '0 0 12px', lineHeight: 1.1,
              }}>
                Pay once, <span style={{ fontStyle: 'italic' }}>use forever</span>
              </h2>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 16,
                color: '#9E9890', margin: 0,
              }}>No subscriptions. No hidden fees.</p>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16, alignItems: 'stretch',
          }}
            className="pricing-grid"
          >
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1} style={{ height: '100%' }}>
                <div style={{
                  background: plan.highlight ? '#2C3A2E' : '#FFFFFF',
                  border: plan.highlight ? 'none' : '1px solid rgba(212,207,198,0.5)',
                  borderRadius: 16, padding: '40px 32px',
                  position: 'relative',
                  boxShadow: plan.highlight
                    ? '0 24px 64px rgba(44,58,46,0.2)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  transform: plan.highlight ? 'scale(1.03)' : 'none',
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: '#8B7355', color: '#F2F0EC',
                      fontFamily: 'var(--font-montserrat)', fontSize: 10,
                      fontWeight: 700, letterSpacing: '1px',
                      padding: '5px 18px', borderRadius: 20,
                    }}>POPULAR</div>
                  )}
                  <h3 style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 14,
                    fontWeight: 600,
                    color: plan.highlight ? 'rgba(242,240,236,0.5)' : '#9E9890',
                    margin: '0 0 12px',
                  }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-cormorant)', fontSize: 48,
                      fontStyle: 'italic',
                      color: plan.highlight ? '#F2F0EC' : '#2C2C2C',
                    }}>{plan.price}</span>
                    {plan.note && (
                      <span style={{
                        fontFamily: 'var(--font-montserrat)', fontSize: 13,
                        color: plan.highlight ? 'rgba(242,240,236,0.35)' : '#9E9890',
                      }}>{plan.note}</span>
                    )}
                  </div>
                  <div style={{
                    height: 1, margin: '20px 0',
                    background: plan.highlight ? 'rgba(242,240,236,0.1)' : 'rgba(212,207,198,0.4)',
                  }} />
                  <div style={{ flex: 1 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 14,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke={plan.highlight ? '#8BB88F' : '#8B7355'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{
                          fontFamily: 'var(--font-montserrat)', fontSize: 13,
                          color: plan.highlight ? 'rgba(242,240,236,0.7)' : '#6B6560',
                        }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/login" style={{
                    display: 'block', marginTop: 24, textAlign: 'center',
                    fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 600,
                    color: plan.highlight ? '#2C3A2E' : '#2C3A2E',
                    background: plan.highlight ? '#F2F0EC' : 'transparent',
                    padding: '14px', borderRadius: 10, textDecoration: 'none',
                    border: plan.highlight ? 'none' : '1px solid rgba(212,207,198,0.5)',
                  }}>
                    {plan.name === 'Free' ? 'Start free' : `Get ${plan.name}`}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{
        padding: '140px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#F5F0E8',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(circle 500px at 30% 50%, rgba(44,58,46,0.08) 0%, transparent 50%)',
            'radial-gradient(circle 400px at 70% 50%, rgba(139,115,85,0.06) 0%, transparent 50%)',
          ].join(', '),
        }} />
        <FadeIn>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 500, color: '#2C2C2C',
              margin: '0 0 16px', lineHeight: 1.1,
            }}>
              Ready to start<br />
              <span style={{ fontStyle: 'italic' }}>planning?</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 16,
              color: '#9E9890', margin: '0 0 40px',
            }}>
              Free to start. Set up in 5 minutes.
            </p>
            <Link href="/login" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600,
              color: '#F2F0EC', background: '#2C3A2E',
              padding: '16px 48px', borderRadius: 24,
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: 8,
            }}>
              Start free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(212,207,198,0.4)',
        padding: '48px 32px 40px',
        background: '#F5F0E8',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-cormorant)', fontSize: 20,
              fontStyle: 'italic', color: '#2C3A2E',
            }}>Reserve</span>
            <span style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 11,
              color: '#9E9890', marginLeft: 12,
            }}>the R in RSVP</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 12,
                color: '#9E9890', textDecoration: 'none',
              }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding-top: 120px !important;
            gap: 48px !important;
          }
          .hero-cards {
            height: 480px !important;
          }
          .hero-cards > div:nth-child(2) {
            right: 0 !important;
          }
          .hero-cards > div:nth-child(3) {
            display: none !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hero-cards > div:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
