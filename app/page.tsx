'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type IconName =
  | 'plus' | 'check' | 'x' | 'upload' | 'drag' | 'arrow' | 'sparkle'
  | 'user' | 'users' | 'table' | 'file' | 'mail' | 'cal' | 'qr'
  | 'chev' | 'search' | 'download' | 'filter' | 'sort' | 'star'
  | 'pause' | 'play' | 'refresh';

function Icon({ name, size = 16, stroke = 1.5, color = 'currentColor' }: {
  name: IconName; size?: number; stroke?: number; color?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    upload:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    drag:    <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    sparkle: <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>,
    user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    table:   <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>,
    file:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    mail:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    cal:     <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    qr:      <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="17" y1="14" x2="17" y2="17"/><line x1="20" y1="17" x2="20" y2="21"/><line x1="14" y1="17" x2="17" y2="17"/></>,
    chev:    <polyline points="9 18 15 12 9 6"/>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    filter:  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    sort:    <><path d="M3 6h18"/><path d="M7 12h10"/><path d="M11 18h2"/></>,
    star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    pause:   <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    play:    <polygon points="5 3 19 12 5 21 5 3"/>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function AnimatedInvite({ width = 360, height = 500, accent = 'sage' }: {
  width?: number; height?: number; accent?: 'sage' | 'accent';
}) {
  const [stage, setStage] = useState(0);
  const stages = 6;
  const timings = [1400, 1300, 1300, 1300, 1500, 2200];

  useEffect(() => {
    const t = setTimeout(() => {
      setStage(s => (s < stages - 1 ? s + 1 : 0));
    }, timings[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const accentColor = accent === 'sage' ? '#2C3A2E' : '#8B7355';
  const cardW = width * 0.78;
  const cardH = height * 0.85;

  return (
    <div style={{
      position: 'relative', width, height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '1400px',
    }}>
      {/* Envelope */}
      <div style={{
        position: 'absolute',
        width: cardW + 28, height: cardH * 0.66,
        background: '#F0EBE3',
        borderRadius: 4,
        boxShadow: '0 30px 80px rgba(44,58,46,0.18), 0 12px 30px rgba(44,58,46,0.1)',
        zIndex: stage >= 1 ? 0 : 5,
        bottom: stage >= 2 ? -20 : '50%',
        marginBottom: stage >= 2 ? 0 : -cardH * 0.33,
        transition: 'all 0.9s cubic-bezier(0.7, 0, 0.3, 1)',
        opacity: stage >= 5 ? 0 : 1,
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0,
          height: cardH * 0.33,
          background: '#E8E2D6',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          transformOrigin: 'top',
          transform: stage >= 1 ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transition: 'transform 0.8s cubic-bezier(0.6, 0, 0.4, 1)',
          backfaceVisibility: 'hidden',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%', top: cardH * 0.16,
          transform: `translate(-50%, -50%) scale(${stage === 0 ? 1 : 0})`,
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B7355, #6E5B43)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
          fontSize: 16, color: '#F5F0E8', fontWeight: 600,
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)',
          transition: 'transform 0.4s ease 0.2s',
          zIndex: 6,
        }}>R</div>
      </div>

      {/* Card */}
      <div style={{
        position: 'absolute',
        width: cardW, height: cardH,
        background: '#FEFCF9',
        borderRadius: 6,
        boxShadow: stage >= 2
          ? '0 40px 100px rgba(44,58,46,0.22), 0 16px 40px rgba(44,58,46,0.12)'
          : '0 0 0 transparent',
        opacity: stage >= 2 ? 1 : 0,
        transform: stage >= 2 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
        transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 4,
        padding: '40px 28px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        border: '1px solid rgba(212,207,198,0.5)',
      }}>
        <div style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 9, letterSpacing: '4px',
          color: '#8B7355', textTransform: 'uppercase',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity 0.5s ease 0.2s',
          marginBottom: 24,
        }}>You are invited</div>

        <div style={{
          fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
          fontSize: 11, color: '#8B7355',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity 0.6s ease 0.4s',
          marginBottom: 4,
        }}>O &amp; R</div>

        <div style={{
          fontFamily: 'var(--font-yeseva)', fontSize: 36, fontWeight: 400,
          color: '#2C2C2C', lineHeight: 1.05, textAlign: 'center',
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
        }}>Olivia</div>

        <div style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 8,
          letterSpacing: '4px', color: '#8B7355', textTransform: 'uppercase',
          margin: '6px 0',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity 0.5s ease 0.7s',
        }}>is marrying</div>

        <div style={{
          fontFamily: 'var(--font-yeseva)', fontSize: 36, fontWeight: 400,
          color: '#2C2C2C', lineHeight: 1.05, textAlign: 'center',
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
          marginBottom: 18,
        }}>Raheem</div>

        <div style={{
          width: 1, height: 18, background: '#D4CFC6',
          marginBottom: 18,
          opacity: stage >= 3 ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }} />

        <div style={{
          fontFamily: 'var(--font-caslon)', fontStyle: 'italic',
          fontSize: 13, color: '#6B6560',
          textAlign: 'center', lineHeight: 1.6,
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: 26,
        }}>
          Saturday, September twelfth<br/>two thousand twenty-six
        </div>

        <div style={{ width: '100%', position: 'relative', marginTop: 'auto' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            opacity: stage >= 4 && stage < 5 ? 1 : 0,
            transform: stage >= 4 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            position: stage >= 5 ? 'absolute' : 'static',
            inset: 0,
          }}>
            <div style={{
              background: stage === 4 || stage === 5 ? accentColor : '#FFFFFF',
              border: stage === 4 || stage === 5 ? `1px solid ${accentColor}` : '1px solid #D4CFC6',
              borderRadius: 4, padding: '11px', textAlign: 'center',
              fontFamily: 'var(--font-caslon)', fontStyle: 'italic',
              fontSize: 12,
              color: stage === 4 || stage === 5 ? '#F5F0E8' : '#2C2C2C',
              transition: 'all 0.4s ease 0.2s',
              transform: stage === 5 ? 'scale(1.02)' : 'scale(1)',
              boxShadow: stage === 5 ? '0 6px 16px rgba(44,58,46,0.2)' : 'none',
            }}>Joyfully accepts</div>
            <div style={{
              border: '1px solid #D4CFC6', borderRadius: 4,
              padding: '11px', textAlign: 'center',
              fontFamily: 'var(--font-caslon)', fontStyle: 'italic',
              fontSize: 12, color: '#9E9890',
            }}>Regretfully declines</div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            padding: '11px',
            opacity: stage >= 5 ? 1 : 0,
            transform: stage >= 5 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={11} color="#F5F0E8" stroke={2.5}/>
            </div>
            <div style={{
              fontFamily: 'var(--font-caslon)', fontStyle: 'italic',
              fontSize: 13, color: accentColor,
            }}>You&apos;re on the list</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Guest = { id: number; name: string; status: 'attending' | 'pending' | 'declined'; meal: string; table: number | null };

const SAMPLE_GUESTS: Guest[] = [
  { id: 1, name: 'Sarah Chen',     status: 'attending', meal: 'Veg',  table: 1 },
  { id: 2, name: 'James Ali',      status: 'attending', meal: 'Fish', table: 1 },
  { id: 3, name: 'Priya Patel',    status: 'attending', meal: 'Veg',  table: 1 },
  { id: 4, name: 'Marcus Webb',    status: 'pending',   meal: '—',    table: null },
  { id: 5, name: 'Aoife Murphy',   status: 'attending', meal: 'Beef', table: 2 },
  { id: 6, name: 'Theo Nakamura',  status: 'attending', meal: 'Veg',  table: 2 },
  { id: 7, name: 'Lena Volkov',    status: 'pending',   meal: '—',    table: null },
  { id: 8, name: 'Idris Bello',    status: 'attending', meal: 'Fish', table: 3 },
  { id: 9, name: 'Hana Park',      status: 'declined',  meal: '—',    table: null },
  { id:10, name: 'Felix Carter',   status: 'attending', meal: 'Beef', table: 3 },
];

function GuestRow({ g, small, ghost, dragging }: { g: Guest; small?: boolean; ghost?: boolean; dragging?: boolean }) {
  const statusColor = ({
    attending: '#2C3A2E',
    pending:   '#8B7355',
    declined:  '#B8B0A4',
  } as const)[g.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: small ? '6px 8px' : '8px 10px',
      background: ghost ? '#FFFFFF' : (dragging ? 'rgba(212,207,198,0.3)' : '#FFFFFF'),
      border: '1px solid rgba(212,207,198,0.6)',
      borderRadius: 5,
      opacity: dragging ? 0.4 : 1,
      transition: 'opacity 0.2s ease',
    }}>
      <div style={{ color: '#B8B0A4', display: 'flex' }}>
        <Icon name="drag" size={12}/>
      </div>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
      <div style={{
        fontSize: small ? 11 : 12, color: '#2C2C2C',
        fontWeight: 500, flex: 1, whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{g.name}</div>
      {!small && g.meal !== '—' && (
        <div style={{
          fontSize: 9, color: '#8B7355',
          padding: '2px 6px', background: 'rgba(139,115,85,0.08)',
          borderRadius: 3, letterSpacing: 0.3,
        }}>{g.meal}</div>
      )}
    </div>
  );
}

function GuestManagerDemo({ scale = 1 }: { scale?: number }) {
  const [guests, setGuests] = useState<Guest[]>(SAMPLE_GUESTS);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [hoverTable, setHoverTable] = useState<number | null>(null);
  const [autoStep, setAutoStep] = useState(0);

  useEffect(() => {
    const sequence: { delay: number; action: () => void }[] = [
      { delay: 1800, action: () => { setDraggingId(4); } },
      { delay: 800,  action: () => { setHoverTable(2); } },
      { delay: 700,  action: () => {
          setGuests(g => g.map(x => x.id === 4 ? { ...x, status: 'attending', meal: 'Veg', table: 2 } : x));
          setDraggingId(null); setHoverTable(null);
      }},
      { delay: 1500, action: () => { setDraggingId(7); } },
      { delay: 700,  action: () => { setHoverTable(3); } },
      { delay: 700,  action: () => {
          setGuests(g => g.map(x => x.id === 7 ? { ...x, status: 'attending', meal: 'Beef', table: 3 } : x));
          setDraggingId(null); setHoverTable(null);
      }},
      { delay: 2000, action: () => { setGuests(SAMPLE_GUESTS); }},
    ];
    const i = autoStep % sequence.length;
    const t = setTimeout(() => {
      sequence[i].action();
      setAutoStep(s => s + 1);
    }, sequence[i].delay);
    return () => clearTimeout(t);
  }, [autoStep]);

  const tables = [
    { id: 1, name: 'Family',   seats: 8 },
    { id: 2, name: 'Friends',  seats: 8 },
    { id: 3, name: 'Uni crew', seats: 6 },
  ];

  const unassigned = guests.filter(g => !g.table);
  const byTable = (id: number) => guests.filter(g => g.table === id);

  return (
    <div style={{
      transform: `scale(${scale})`, transformOrigin: 'top left',
      width: 760,
      background: '#FFFFFF', borderRadius: 14,
      boxShadow: '0 24px 64px rgba(44,58,46,0.14), 0 8px 24px rgba(44,58,46,0.06)',
      border: '1px solid rgba(212,207,198,0.5)',
      overflow: 'hidden',
      fontFamily: 'var(--font-montserrat)',
      position: 'relative',
    }}>
      {/* Window chrome */}
      <div style={{
        height: 36, padding: '0 14px',
        background: '#F0EBE3',
        borderBottom: '1px solid rgba(212,207,198,0.5)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E8C5A0' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#D4CFC6' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#B8B0A4' }} />
        </div>
        <div style={{
          flex: 1, textAlign: 'center',
          fontSize: 11, color: '#9E9890',
          fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
        }}>reserve.app / dashboard / guests</div>
        <div style={{ width: 50 }} />
      </div>

      {/* Top bar */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid rgba(212,207,198,0.4)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', lineHeight: 1 }}>
            Guests
          </div>
          <div style={{ fontSize: 11, color: '#9E9890', marginTop: 4, letterSpacing: 0.3 }}>
            {guests.filter(g => g.status === 'attending').length} attending · {guests.filter(g => g.status === 'pending').length} pending · {guests.filter(g => g.status === 'declined').length} declined
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          background: '#F0EBE3', borderRadius: 6,
          fontSize: 11, color: '#6B6560',
        }}>
          <Icon name="search" size={12} color="#9E9890"/>
          Search
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: '#FFFFFF', border: '1px solid #D4CFC6', borderRadius: 6,
          fontSize: 11, color: '#2C2C2C', fontWeight: 500,
        }}>
          <Icon name="upload" size={12}/>
          Import CSV
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: '#2C3A2E', borderRadius: 6,
          fontSize: 11, color: '#F5F0E8', fontWeight: 500,
        }}>
          <Icon name="plus" size={12}/>
          Add guest
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 380 }}>
        <div style={{ borderRight: '1px solid rgba(212,207,198,0.4)', padding: '16px 14px', background: '#FAF7F1' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
              color: '#8B7355', textTransform: 'uppercase',
            }}>Unassigned</div>
            <div style={{
              fontSize: 10, color: '#9E9890',
              padding: '2px 8px', background: '#FFFFFF',
              borderRadius: 10, border: '1px solid #D4CFC6',
            }}>{unassigned.length}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {unassigned.map(g => (
              <GuestRow key={g.id} g={g} dragging={draggingId === g.id}/>
            ))}
            {unassigned.length === 0 && (
              <div style={{
                padding: '20px 12px', textAlign: 'center',
                fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
                fontSize: 13, color: '#9E9890',
                border: '1px dashed #D4CFC6', borderRadius: 6,
              }}>All seated ✓</div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 18px', background: '#FFFFFF' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
            color: '#8B7355', textTransform: 'uppercase',
            marginBottom: 12,
          }}>Tables</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {tables.map(t => {
              const seated = byTable(t.id);
              const isHover = hoverTable === t.id;
              return (
                <div key={t.id} style={{
                  border: isHover ? '2px dashed #2C3A2E' : '1px solid #D4CFC6',
                  background: isHover ? 'rgba(44,58,46,0.04)' : '#FAF7F1',
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 220,
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 14, color: '#2C2C2C' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#9E9890' }}>{seated.length}/{t.seats}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {seated.map(g => (
                      <GuestRow key={g.id} g={g} small/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drag indicator */}
      {draggingId && (() => {
        const g = guests.find(x => x.id === draggingId);
        if (!g) return null;
        const tableX = hoverTable ? 280 + ((hoverTable - 1) * 175) : 90;
        const tableY = hoverTable ? 90 : 60 + (unassigned.findIndex(x => x.id === draggingId) * 40);
        return (
          <div style={{
            position: 'absolute', pointerEvents: 'none',
            left: tableX, top: tableY,
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 100,
            transform: 'rotate(-2deg) scale(1.05)',
            filter: 'drop-shadow(0 12px 24px rgba(44,58,46,0.25))',
          }}>
            <GuestRow g={g} ghost/>
          </div>
        );
      })()}
    </div>
  );
}

function CsvImportDemo({ scale = 1 }: { scale?: number }) {
  const [stage, setStage] = useState(0);
  const stages = 5;
  const timings = [2200, 1100, 1400, 2200, 2500];

  useEffect(() => {
    const t = setTimeout(() => setStage(s => (s + 1) % stages), timings[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const previewGuests: { name: string; sub: string; status: 'Pending' | 'Confirmed' }[] = [
    { name: 'Danish',  sub: '0/1 attending',           status: 'Pending' },
    { name: 'Midhat',  sub: '0/2 attending',           status: 'Pending' },
    { name: 'Fahad',   sub: '1/2 attending · Table 4', status: 'Confirmed' },
    { name: 'Sunjita', sub: '0/2 attending · Table 1', status: 'Pending' },
    { name: 'Tanjin',  sub: '0/3 attending · Table 1', status: 'Pending' },
  ];

  const totalCount = stage === 4 ? 148 : 8;
  const pendingCount = stage === 4 ? 147 : 7;

  return (
    <div style={{
      transform: `scale(${scale})`, transformOrigin: 'top left',
      width: 760,
      background: '#FFFFFF', borderRadius: 14,
      boxShadow: '0 24px 64px rgba(44,58,46,0.14), 0 8px 24px rgba(44,58,46,0.06)',
      border: '1px solid rgba(212,207,198,0.5)',
      overflow: 'hidden',
      fontFamily: 'var(--font-montserrat)',
      position: 'relative',
    }}>
      {/* Window chrome */}
      <div style={{
        height: 36, padding: '0 14px',
        background: '#F0EBE3',
        borderBottom: '1px solid rgba(212,207,198,0.5)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E8C5A0' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#D4CFC6' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#B8B0A4' }} />
        </div>
        <div style={{
          flex: 1, textAlign: 'center',
          fontSize: 11, color: '#9E9890',
          fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
        }}>reserve.app / dashboard / guests</div>
        <div style={{ width: 50 }} />
      </div>

      {/* Page header */}
      <div style={{ padding: '22px 28px 0' }}>
        <div style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 28, color: '#2C2C2C', lineHeight: 1 }}>
          Guests
        </div>
        <div style={{ fontSize: 12, color: '#9E9890', marginTop: 6 }}>
          Manage invite links and seat allocations
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginTop: 18, borderBottom: '1px solid rgba(212,207,198,0.4)' }}>
          {['Guest List', 'Meal Options'].map((label, i) => (
            <div key={label} style={{
              fontSize: 12, fontWeight: i === 0 ? 600 : 500,
              color: i === 0 ? '#2C2C2C' : '#9E9890',
              padding: '10px 0',
              borderBottom: i === 0 ? '2px solid #2C2C2C' : '2px solid transparent',
              marginBottom: -1,
            }}>{label}</div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        padding: '16px 28px 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      }}>
        {[
          { v: String(totalCount), l: 'Total' },
          { v: '1',                l: 'Confirmed' },
          { v: String(pendingCount), l: 'Pending' },
          { v: '0',                l: 'Declined' },
        ].map(s => (
          <div key={s.l} style={{
            background: '#F5F0E8', borderRadius: 8,
            padding: '12px 14px',
            display: 'flex', alignItems: 'baseline', gap: 8,
            transition: 'all 0.4s ease',
          }}>
            <div style={{ fontFamily: 'var(--font-yeseva)', fontSize: 24, color: '#2C2C2C', lineHeight: 1 }}>
              {s.v}
            </div>
            <div style={{ fontSize: 10, color: '#9E9890' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Action row */}
      <div style={{
        padding: '14px 28px 16px',
        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: 11, color: '#9E9890',
          padding: '7px 10px', background: '#F0EBE3', borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 6, flex: '0 1 160px',
        }}>
          <Icon name="search" size={11}/>
          Search guests…
        </div>
        <div style={{
          fontSize: 11, color: '#6B6560',
          padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4CFC6', borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>Date added <Icon name="chev" size={10}/></div>
        <div style={{
          fontSize: 11, color: '#2C2C2C', fontWeight: 500,
          padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4CFC6', borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="plus" size={11}/> Add
        </div>
        <div style={{
          fontSize: 11, color: '#F5F0E8', fontWeight: 500,
          padding: '7px 12px', background: '#2C3A2E', borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: stage >= 1 && stage <= 3 ? '0 0 0 3px rgba(44,58,46,0.18)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          <Icon name="upload" size={11}/> Import CSV
        </div>
        <div style={{
          fontSize: 11, color: '#6B6560',
          padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4CFC6', borderRadius: 6,
        }}>Template</div>
        <div style={{
          fontSize: 11, color: '#6B6560',
          padding: '7px 10px', background: '#FFFFFF', border: '1px solid #D4CFC6', borderRadius: 6,
        }}>Send Invites</div>
      </div>

      {/* Body — guest list (faded) with import panel overlay */}
      <div style={{
        position: 'relative',
        padding: '0 28px 24px',
        minHeight: 320,
      }}>
        <div style={{
          opacity: 0.4, filter: 'blur(0.4px)',
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none',
        }}>
          {previewGuests.map(g => (
            <div key={g.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)',
              borderRadius: 8,
            }}>
              <div style={{ width: 14, height: 14, border: '1px solid #D4CFC6', borderRadius: 3 }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9E9890' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2C' }}>{g.name}</div>
                <div style={{ fontSize: 10, color: '#9E9890', marginTop: 2 }}>{g.sub}</div>
              </div>
              <div style={{
                fontSize: 9, fontWeight: 600,
                padding: '4px 10px', borderRadius: 100,
                background: g.status === 'Confirmed' ? 'rgba(44,58,46,0.08)' : 'rgba(139,115,85,0.10)',
                color: g.status === 'Confirmed' ? '#2C3A2E' : '#8B7355',
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>{g.status}</div>
            </div>
          ))}
        </div>

        {/* Import panel overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 28, right: 28,
          background: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 24px 60px rgba(44,58,46,0.22), 0 8px 24px rgba(44,58,46,0.10)',
          border: '1px solid rgba(212,207,198,0.6)',
          padding: 18,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 18, color: '#2C2C2C', lineHeight: 1 }}>
                Import guests
              </div>
              <div style={{ fontSize: 10, color: '#9E9890', marginTop: 4 }}>
                From CSV, Numbers, Excel, or Google Sheets
              </div>
            </div>
            <Icon name="x" size={16} color="#9E9890"/>
          </div>

          <div style={{
            border: stage === 1 ? '2px dashed #2C3A2E' : '2px dashed #D4CFC6',
            background: stage === 1 ? 'rgba(44,58,46,0.04)' : '#FAF7F1',
            borderRadius: 10,
            padding: '22px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8,
            transition: 'all 0.3s ease',
            position: 'relative',
            minHeight: 130,
          }}>
            {stage <= 1 && (
              <>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: stage === 1 ? '#2C3A2E' : '#FFFFFF',
                  border: '1px solid #D4CFC6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}>
                  <Icon name="upload" size={18} color={stage === 1 ? '#F5F0E8' : '#2C3A2E'} stroke={1.5}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2C' }}>
                  {stage === 1 ? 'Drop to upload' : 'Drop your CSV here'}
                </div>
                <div style={{ fontSize: 10, color: '#9E9890' }}>or click to browse</div>

                {stage === 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '72%', top: 16,
                    width: 76, height: 92,
                    background: '#FFFFFF', borderRadius: 4,
                    boxShadow: '0 12px 28px rgba(44,58,46,0.2)',
                    transform: 'rotate(-6deg)',
                    padding: 8,
                    fontFamily: 'monospace',
                    fontSize: 7,
                    lineHeight: 1.5,
                    color: '#6B6560',
                    animation: 'csvHover 1s ease-in-out infinite alternate',
                  }}>
                    <div style={{ fontWeight: 700, color: '#2C3A2E', marginBottom: 4 }}>guests.csv</div>
                    Sarah Chen,sa..<br/>
                    James Ali,ja..<br/>
                    Priya Patel..<br/>
                    Marcus Webb..
                  </div>
                )}
              </>
            )}

            {stage === 2 && (
              <>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '3px solid #D4CFC6',
                  borderTopColor: '#2C3A2E',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <div style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2C' }}>Reading guests.csv…</div>
                <div style={{ fontSize: 10, color: '#9E9890' }}>140 rows detected</div>
              </>
            )}

            {(stage === 3 || stage === 4) && (
              <div style={{ width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 12,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#2C3A2E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="check" size={10} color="#F5F0E8" stroke={2.5}/>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#2C2C2C' }}>guests.csv · 140 rows</div>
                  <div style={{ flex: 1 }}/>
                  <div style={{ fontSize: 10, color: '#9E9890' }}>Auto-mapped</div>
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: 1.5, color: '#8B7355',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Column mapping</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
                  {[
                    { csv: 'Full name',  field: 'Name' },
                    { csv: 'Email',      field: 'Email' },
                    { csv: 'Phone (UK)', field: 'Phone' },
                    { csv: 'Plus one?',  field: 'Plus one' },
                    { csv: 'Side',       field: 'Group' },
                  ].map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 0',
                      opacity: stage === 4 ? 1 : (i * 0.18 + 0.5),
                      transition: 'opacity 0.3s ease',
                    }}>
                      <div style={{
                        fontSize: 9, fontFamily: 'monospace',
                        color: '#6B6560',
                        padding: '3px 7px', background: '#F0EBE3',
                        borderRadius: 3,
                      }}>{m.csv}</div>
                      <Icon name="arrow" size={10} color="#B8B0A4"/>
                      <div style={{
                        fontSize: 10, fontWeight: 500,
                        padding: '3px 7px', background: 'rgba(44,58,46,0.06)',
                        borderRadius: 3, color: '#2C3A2E',
                      }}>{m.field}</div>
                      <div style={{ marginLeft: 'auto', color: '#2C3A2E' }}>
                        <Icon name="check" size={10} stroke={2}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{
            marginTop: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 10, color: '#9E9890', flex: 1 }}>
              {stage === 4 ? '✓ 140 guests imported' : 'CSV, XLSX, Numbers — all supported'}
            </div>
            <div style={{
              padding: '7px 14px',
              background: stage === 4 ? '#FFFFFF' : '#2C3A2E',
              color: stage === 4 ? '#9E9890' : '#F5F0E8',
              border: stage === 4 ? '1px solid #D4CFC6' : 'none',
              borderRadius: 6,
              fontSize: 11, fontWeight: 500,
              transition: 'all 0.3s ease',
            }}>
              {stage === 4 ? 'Done' : 'Import 140 guests'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children, color = '#8B7355' }: { children: React.ReactNode; color?: string }) {
  return <div style={{
    fontFamily: 'var(--font-montserrat)',
    fontSize: 12, fontWeight: 600, letterSpacing: 2,
    color, textTransform: 'uppercase',
  }}>{children}</div>;
}

function DisplayHeading({ children, size = 56, color = '#2C2C2C', italic = false, weight = 500, lh = 1.05 }: {
  children: React.ReactNode; size?: number; color?: string; italic?: boolean; weight?: number; lh?: number;
}) {
  return <h2 style={{
    fontFamily: 'var(--font-yeseva)',
    fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    color, margin: 0,
    lineHeight: lh, letterSpacing: '-0.01em',
  }}>{children}</h2>;
}

function NavBar() {
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '20px 64px',
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', alignItems: 'center', height: 48,
      }}>
        <span style={{
          fontFamily: 'var(--font-yeseva)', fontSize: 22,
          fontStyle: 'italic', fontWeight: 500,
          color: '#1F2A22', flex: 1,
        }}>Reserve</span>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="nav-links">
          {['Features', 'How it works', 'Pricing'].map((l) => (
            <a key={l} href="#" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500,
              color: 'rgba(31,42,34,0.7)', textDecoration: 'none',
            }}>{l}</a>
          ))}
          <Link href="/login" style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500,
            color: 'rgba(31,42,34,0.7)', textDecoration: 'none',
          }}>Sign in</Link>
          <Link href="/login" style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
            color: '#F5F0E8', background: '#2C3A2E',
            padding: '10px 22px', borderRadius: 20,
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>Start free <Icon name="arrow" size={11}/></Link>
        </div>
      </div>
    </nav>
  );
}

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'users',    title: 'Drag-and-drop seating', desc: 'Move guests between tables with your mouse. Capacity locks prevent over-seating before the day arrives.' },
  { icon: 'upload',   title: 'CSV / Excel import',    desc: 'Bring your guest list from Numbers, Excel, or Google Sheets. Columns auto-map, duplicates auto-merge.' },
  { icon: 'mail',     title: 'Smart RSVP links',      desc: 'Each guest gets a unique link with an enforced seat cap. No awkward plus-one surprises.' },
  { icon: 'cal',      title: 'Day-of itinerary',      desc: "Ceremony, dinner, speeches — your guests always know what's happening next." },
  { icon: 'qr',       title: 'Printable QR codes',    desc: 'Generate per-guest QR codes for the place card or program. Scan, see, sit.' },
  { icon: 'download', title: 'CSV export anytime',    desc: 'Caterers want a head-count breakdown? One click — meal preferences and dietary notes included.' },
];

function FeaturesGrid() {
  return (
    <section style={{
      padding: '120px 64px',
      background: '#F5F0E8',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 580, marginBottom: 64 }}>
          <Eyebrow>Features</Eyebrow>
          <div style={{ marginTop: 16 }}>
            <DisplayHeading size={48}>
              Everything your guests need,<br/>
              <span style={{ fontStyle: 'italic' }}>nothing they don&apos;t</span>
            </DisplayHeading>
          </div>
          <p style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 15,
            color: '#6B6560', margin: '20px 0 0', lineHeight: 1.7, maxWidth: 480,
          }}>
            One link gives each guest access to RSVP, meal choices, their table assignment, the day&apos;s schedule, and answers to common questions.
          </p>
        </div>

        <div className="features-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
          background: 'rgba(212,207,198,0.4)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: '#FFFFFF', padding: '32px 28px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(44,58,46,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#2C3A2E', marginBottom: 18,
              }}>
                <Icon name={f.icon} size={18}/>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 14,
                fontWeight: 600, color: '#2C2C2C', margin: '0 0 8px',
              }}>{f.title}</h3>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                color: '#6B6560', margin: 0, lineHeight: 1.65,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section style={{
      background: '#2C3A2E',
      padding: '120px 64px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(circle 600px at 10% 20%, rgba(74,94,76,0.4) 0%, transparent 50%)',
          'radial-gradient(circle 500px at 90% 80%, rgba(139,115,85,0.15) 0%, transparent 50%)',
        ].join(', '),
      }}/>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <Eyebrow color="rgba(196,168,122,0.85)">How it works</Eyebrow>
          <div style={{ marginTop: 16 }}>
            <DisplayHeading size={48} color="#F2F0EC">
              From spreadsheet to seated,<br/>
              <span style={{ fontStyle: 'italic' }}>in three steps</span>
            </DisplayHeading>
          </div>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { n: '01', title: 'Upload your list',        desc: 'Drop in a CSV or paste from Sheets. We parse the columns, dedupe, and stage everything for review.' },
            { n: '02', title: 'Drag guests onto tables', desc: 'Build seating with your mouse. Capacity locks, dietary clashes, and plus-ones are flagged inline.' },
            { n: '03', title: 'Send the unique link',    desc: 'Each guest opens their own page — RSVP, meal pick, table number, schedule, dress code — all from one URL.' },
          ].map((step) => (
            <div key={step.n}>
              <span style={{
                fontFamily: 'var(--font-yeseva)', fontSize: 80,
                fontStyle: 'italic', fontWeight: 400,
                color: 'rgba(242,240,236,0.1)', lineHeight: 0.9,
                display: 'block', marginBottom: 12,
                letterSpacing: '-0.02em',
              }}>{step.n}</span>
              <h3 style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 16,
                fontWeight: 600, color: '#F2F0EC', margin: '0 0 10px',
              }}>{step.title}</h3>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 14,
                color: 'rgba(242,240,236,0.5)', margin: 0, lineHeight: 1.7,
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{
      padding: '120px 64px',
      textAlign: 'center',
      background: '#F5F0E8',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(circle 500px at 30% 50%, rgba(44,58,46,0.06) 0%, transparent 50%)',
          'radial-gradient(circle 400px at 70% 50%, rgba(139,115,85,0.05) 0%, transparent 50%)',
        ].join(', '),
      }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <DisplayHeading size={56}>
          Ready to start<br/>
          <span style={{ fontStyle: 'italic' }}>planning?</span>
        </DisplayHeading>
        <p style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 16,
          color: '#9E9890', margin: '20px 0 32px',
        }}>Free to start. Set up in 5 minutes.</p>
        <Link href="/login" style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600,
          color: '#F2F0EC', background: '#2C3A2E',
          padding: '14px 36px', borderRadius: 22,
          textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          Start free
          <Icon name="arrow" size={14}/>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(212,207,198,0.4)',
      padding: '32px 64px',
      background: '#F5F0E8',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-yeseva)', fontSize: 18,
            fontStyle: 'italic', color: '#2C3A2E', fontWeight: 500,
          }}>Reserve</span>
          <span style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 11,
            color: '#9E9890', marginLeft: 12,
          }}>the R in RSVP</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Features', 'Pricing', 'Privacy', 'Contact'].map((l) => (
            <a key={l} href="#" style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 12,
              color: '#9E9890', textDecoration: 'none',
            }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const heroBg = '#D5D9C8';
  const heroAccent = '#8B7355';

  return (
    <div style={{ background: '#F5F0E8', color: '#2C2C2C', minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: 820,
        background: heroBg,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(184,196,168,0.55) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 60% at 80% 80%, rgba(196,168,122,0.22) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(245,240,232,0.4) 0%, transparent 50%)',
          ].join(', '),
        }}/>
        <NavBar/>

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1240, margin: '0 auto',
          padding: '160px 64px 100px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 60,
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(31,42,34,0.12)',
              borderRadius: 100,
              fontSize: 11, color: 'rgba(31,42,34,0.75)',
              fontFamily: 'var(--font-montserrat)', fontWeight: 500,
              letterSpacing: 0.5,
              marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, background: heroAccent, borderRadius: '50%' }}/>
              The R in RSVP
            </div>

            <h1 style={{
              fontFamily: 'var(--font-yeseva)',
              fontSize: 78, fontWeight: 500,
              color: '#1F2A22',
              lineHeight: 0.96,
              margin: '0 0 28px',
              letterSpacing: '-0.02em',
            }} className="hero-h1">
              Drag your guests<br/>
              into <span style={{ fontStyle: 'italic', color: heroAccent }}>their seats.</span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 17, fontWeight: 400,
              color: 'rgba(31,42,34,0.7)',
              margin: '0 0 36px',
              lineHeight: 1.65,
              maxWidth: 460,
            }}>
              Import 200 guests from your spreadsheet in seconds. Drag them onto tables. Send each one a personal RSVP link — RSVP, meal, seat, schedule, all from one URL.
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 600,
                color: '#F5F0E8', background: '#2C3A2E',
                padding: '13px 24px', borderRadius: 22,
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>Start free <Icon name="arrow" size={13}/></Link>
              <span style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 500,
                color: 'rgba(31,42,34,0.75)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>Watch the 60s demo <Icon name="play" size={11}/></span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 18,
              fontFamily: 'var(--font-montserrat)', fontSize: 12,
              color: 'rgba(31,42,34,0.6)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: ['#C4A87A', '#8B7355', '#4A5E4C', '#6B9B6F'][i],
                    border: '2px solid #D5D9C8',
                    marginLeft: i ? -8 : 0,
                    fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
                    fontSize: 11, fontWeight: 600,
                    color: '#1F2A22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{['o', 'j', 'a', 'm'][i]}</div>
                ))}
              </div>
              140+ couples ·{' '}
              <div style={{ display: 'flex', gap: 2 }}>
                {[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" size={11} color="#8B7355"/>)}
              </div>
              4.9 average
            </div>
          </div>

          <div style={{
            position: 'relative',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            <AnimatedInvite width={360} height={500} accent="sage"/>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, rgba(245,240,232,0.5))',
        }}/>
      </section>

      {/* PRODUCT SHOWCASE — drag-drop guest manager */}
      <section style={{
        background: '#F5F0E8',
        padding: '120px 64px 100px',
        position: 'relative',
      }}>
        <div className="showcase-grid" style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '0.85fr 1.15fr',
          gap: 60, alignItems: 'center',
        }}>
          <div>
            <Eyebrow>The seat plan, solved</Eyebrow>
            <div style={{ marginTop: 16, marginBottom: 20 }}>
              <DisplayHeading size={48}>
                Stop juggling<br/>
                <span style={{ fontStyle: 'italic' }}>spreadsheets &amp; sticky notes.</span>
              </DisplayHeading>
            </div>
            <p style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 16,
              color: '#6B6560', lineHeight: 1.7, marginBottom: 28, maxWidth: 440,
            }}>
              Drag any guest onto any table. Capacity locks, dietary clashes, and plus-one mismatches show up as you arrange — not the night before.
            </p>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              borderTop: '1px solid rgba(212,207,198,0.6)',
              paddingTop: 22,
            }}>
              {[
                { k: 'Capacity locked',  v: 'Tables refuse over-seating' },
                { k: 'Dietary aware',    v: 'Veg / fish / allergies surfaced inline' },
                { k: 'Real-time totals', v: 'Head count updates as you drag' },
              ].map(({ k, v }) => (
                <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{
                    fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
                    fontSize: 16, fontWeight: 500, color: '#2C3A2E',
                    width: 160,
                  }}>{k}</span>
                  <span style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560',
                  }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
            <GuestManagerDemo scale={0.85}/>
          </div>
        </div>
      </section>

      {/* CSV IMPORT showcase */}
      <section style={{
        background: '#EDE8DF',
        padding: '100px 64px',
        borderTop: '1px solid rgba(212,207,198,0.4)',
        borderBottom: '1px solid rgba(212,207,198,0.4)',
      }}>
        <div className="csv-grid" style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
          gap: 60, alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <CsvImportDemo scale={0.82}/>
          </div>
          <div>
            <Eyebrow>Bring your list</Eyebrow>
            <div style={{ marginTop: 16, marginBottom: 20 }}>
              <DisplayHeading size={42}>
                You started in a spreadsheet.<br/>
                <span style={{ fontStyle: 'italic' }}>Finish there too.</span>
              </DisplayHeading>
            </div>
            <p style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 15,
              color: '#6B6560', lineHeight: 1.7, marginBottom: 28, maxWidth: 460,
            }}>
              Drop in any CSV, XLSX, or paste straight from Google Sheets. We auto-map common columns, dedupe rows, and stage everything for review before a single invite goes out.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Numbers', 'Excel', 'Google Sheets', 'Airtable', 'Notion'].map(s => (
                <span key={s} style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11,
                  padding: '6px 12px',
                  background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.6)',
                  borderRadius: 100, color: '#6B6560',
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturesGrid/>
      <HowItWorks/>
      <FinalCTA/>
      <Footer/>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes csvHover {
          from { transform: rotate(-6deg) translateY(0); }
          to   { transform: rotate(-4deg) translateY(-6px); }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 140px 32px 80px !important;
            gap: 48px !important;
          }
          .hero-h1 {
            font-size: 56px !important;
          }
          .showcase-grid, .csv-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .features-grid, .steps-grid {
            grid-template-columns: 1fr !important;
          }
          nav { padding: 16px 24px !important; }
          .nav-links a:nth-child(-n+3) { display: none; }
        }
      `}</style>
    </div>
  );
}
