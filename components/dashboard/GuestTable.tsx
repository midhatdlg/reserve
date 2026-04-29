'use client';

import { useRef, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Rsvp {
  id: string;
  person_name: string;
  attending: boolean;
  meal_preference: string | null;
  dietary_notes: string | null;
}

interface Invite {
  id: string;
  guest_name: string;
  max_guests: number;
  status: string;
  table_number: number | null;
  token: string;
  email: string | null;
  phone: string | null;
  rsvps: Rsvp[];
}

interface Props {
  weddingId: string;
  weddingSlug: string;
  initialInvites: Invite[];
}

type SortOption = 'name-asc' | 'name-desc' | 'status' | 'created';
type FilterVal = 'all' | 'responded' | 'pending' | 'declined';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  responded: { bg: 'var(--sage-dim)',       color: 'var(--sage)',           label: 'Confirmed' },
  declined:  { bg: 'var(--surface-alt)',    color: 'var(--text-tertiary)',  label: 'Declined'  },
  pending:   { bg: 'rgba(158,158,158,0.1)', color: 'var(--text-secondary)', label: 'Pending'   },
};

const STATUS_ORDER: Record<string, number> = { responded: 0, pending: 1, declined: 2 };

export function GuestTable({ weddingId, weddingSlug, initialInvites }: Props) {
  const [invites, setInvites]       = useState<Invite[]>(initialInvites);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<FilterVal>('all');
  const [sort, setSort]             = useState<SortOption>('created');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [adding, setAdding]         = useState(false);
  const [newName, setNewName]       = useState('');
  const [newAlloc, setNewAlloc]     = useState(1);
  const [saving, setSaving]         = useState(false);
  const [importing, setImporting]   = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);

  // New UX state
  const [menuOpen, setMenuOpen]           = useState<string | null>(null);
  const [detailInvite, setDetailInvite]   = useState<Invite | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Invite | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [inlineEditId, setInlineEditId]   = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState('');
  const [toast, setToast]                 = useState<string | null>(null);
  const [isMobile, setIsMobile]           = useState(false);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTemplate, setSendTemplate]   = useState<'invite' | 'reminder'>('invite');

  const csvRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const supabase = createClient();

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const filtered = invites.filter((inv) => {
    const matchSearch = inv.guest_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name-asc') return a.guest_name.localeCompare(b.guest_name);
    if (sort === 'name-desc') return b.guest_name.localeCompare(a.guest_name);
    if (sort === 'status') return (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1);
    return 0;
  });

  const totalInvites = invites.length;
  const confirmed    = invites.filter((i) => i.status === 'responded').length;
  const pending      = invites.filter((i) => i.status === 'pending').length;
  const declined     = invites.filter((i) => i.status === 'declined').length;

  // ── Actions ─────────────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg);
  }

  function copyLink(_token: string) {
    navigator.clipboard.writeText(`${appUrl}/invite/${weddingSlug}`);
    showToast('Invite link copied!');
    setMenuOpen(null);
  }

  async function addGuest() {
    if (!newName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('invites')
      .insert({ wedding_id: weddingId, guest_name: newName.trim(), max_guests: newAlloc })
      .select('*, rsvps(*)')
      .single();
    if (!error && data) {
      setInvites((prev) => [...prev, data]);
      setNewName('');
      setNewAlloc(1);
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleCsvImport(file: File) {
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const lines = text.trim().split('\n');
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('guest');
    const rows = hasHeader ? lines.slice(1) : lines;

    const guests: { name: string; seats: number; email: string | null; phone: string | null }[] = [];
    for (const row of rows) {
      const cols = row.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, '').trim()) ?? row.split(',').map((c) => c.trim());
      const name = cols[0];
      if (!name) continue;
      guests.push({ name, seats: Math.min(Math.max(parseInt(cols[1]) || 1, 1), 10), email: cols[2] || null, phone: cols[3] || null });
    }

    let added = 0, skipped = 0;
    for (const g of guests) {
      const { data, error } = await supabase
        .from('invites')
        .insert({ wedding_id: weddingId, guest_name: g.name, max_guests: g.seats, email: g.email, phone: g.phone })
        .select('*, rsvps(*)')
        .single();
      if (!error && data) { setInvites((prev) => [...prev, data]); added++; }
      else skipped++;
    }
    setImportResult({ added, skipped });
    setImporting(false);
  }

  function downloadTemplate() {
    const csv = ['Guest Name,Seats,Email,Phone', 'The Johnson Family,4,johnson@email.com,07700 900001', 'Sarah & Tom,2,sarah@email.com,', 'Emily Davis,1,emily@email.com,07700 900002', 'Uncle Bob + Guest,2,,07700 900003'].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveInlineName(id: string) {
    const trimmed = inlineEditName.trim();
    if (!trimmed) { setInlineEditId(null); return; }
    await supabase.from('invites').update({ guest_name: trimmed }).eq('id', id);
    setInvites((prev) => prev.map((inv) => inv.id === id ? { ...inv, guest_name: trimmed } : inv));
    setInlineEditId(null);
    // Also update detail panel if open
    if (detailInvite?.id === id) setDetailInvite((d) => d ? { ...d, guest_name: trimmed } : d);
  }

  async function saveDetail(id: string, fields: { guest_name: string; max_guests: number; email: string | null; phone: string | null }) {
    await supabase.from('invites').update(fields).eq('id', id);
    setInvites((prev) => prev.map((inv) => inv.id === id ? { ...inv, ...fields } : inv));
    setDetailInvite(null);
    showToast('Guest updated');
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((i) => i.id)));
  }

  function buildMessage(invite: Invite) {
    const link = `${appUrl}/invite/${weddingSlug}`;
    if (sendTemplate === 'reminder') {
      return `Hi ${invite.guest_name} — just a friendly reminder, we'd love to know if you can join us! Please RSVP here: ${link}`;
    }
    return `You're invited! 🎊\n\nRSVP here: ${link}`;
  }

  function selectPending() {
    setSelected(new Set(invites.filter((i) => i.status === 'pending').map((i) => i.id)));
    setSendTemplate('reminder');
  }

  function openWhatsApp(invite: Invite) {
    const phone = invite.phone?.replace(/[^0-9+]/g, '') ?? '';
    const msg = encodeURIComponent(buildMessage(invite));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  function openSms(invite: Invite) {
    const phone = invite.phone?.replace(/[^0-9+]/g, '') ?? '';
    const msg = encodeURIComponent(buildMessage(invite));
    // Works on iOS/macOS (sms:phone&body=) and Android (sms:phone?body=)
    const sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    window.open(`sms:${phone}${sep}body=${msg}`, '_self');
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('invites').delete().eq('id', deleteTarget.id);
    setInvites((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    setDetailInvite(null);
    setMenuOpen(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {([
          { label: 'Total',     value: totalInvites, filterVal: 'all' as FilterVal },
          { label: 'Confirmed', value: confirmed,    filterVal: 'responded' as FilterVal },
          { label: 'Pending',   value: pending,      filterVal: 'pending' as FilterVal },
          { label: 'Declined',  value: declined,     filterVal: 'declined' as FilterVal },
        ]).map(({ label, value, filterVal }) => (
          <button key={label} onClick={() => setFilter(filterVal)} style={{
            flex: 1, background: filter === filterVal ? 'var(--sage-dim)' : 'var(--surface)',
            border: filter === filterVal ? '1.5px solid var(--sage)' : '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', textAlign: 'center', cursor: 'pointer',
          }}>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.5px' }}>{label.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search guests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontFamily: 'var(--font-montserrat)', fontSize: 13, outline: 'none',
          }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)',
            fontFamily: 'var(--font-montserrat)', fontSize: 13, outline: 'none',
          }}
        >
          <option value="created">Date added</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="status">Status</option>
        </select>
        <Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>
        <Button size="sm" variant="secondary" loading={importing} onClick={() => csvRef.current?.click()}>Import CSV</Button>
        <Button size="sm" variant="secondary" onClick={downloadTemplate}>↓ Template</Button>
        <Button size="sm" variant="secondary" onClick={() => { if (selected.size === 0) { setSelected(new Set(sorted.map(i => i.id))); } setSendModalOpen(true); }}>📩 Send Invites</Button>
        <Button size="sm" variant="secondary" onClick={() => window.open('/api/export/guests?status=attending', '_blank')}>↓ Caterer List</Button>
        <input ref={csvRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) handleCsvImport(e.target.files[0]); e.target.value = ''; }}
        />
      </div>

      {importResult && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 8, marginBottom: 12,
          background: 'var(--sage-dim)', border: '1px solid var(--border)',
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--sage)' }}>
            ✓ Imported {importResult.added} guest{importResult.added !== 1 ? 's' : ''}
            {importResult.skipped > 0 && ` · ${importResult.skipped} skipped`}
          </span>
          <button onClick={() => setImportResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Add guest row */}
      {adding && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: 'var(--sage-dim)', border: '1px solid var(--border)',
          borderRadius: 10, marginBottom: 10, flexWrap: 'wrap',
        }}>
          <input autoFocus type="text" placeholder="Guest name" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGuest()}
            style={{ flex: 1, minWidth: 140, border: 'none', background: 'transparent', fontFamily: 'var(--font-montserrat)', fontSize: 14, color: 'var(--text)', outline: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setNewAlloc(Math.max(1, newAlloc - 1))} style={stepBtn}>−</button>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{newAlloc}</span>
            <button onClick={() => setNewAlloc(Math.min(10, newAlloc + 1))} style={stepBtn}>+</button>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)' }}>seats</span>
          </div>
          <Button size="sm" loading={saving} onClick={addGuest}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && !sendModalOpen && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 8, marginBottom: 12,
          background: 'var(--sage-dim)', border: '1px solid var(--border)',
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text)' }}>
            {selected.size} selected
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={() => setSendModalOpen(true)}>Send Invites</Button>
            <Button size="sm" variant="secondary" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {/* Guest list */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
              {search ? 'No guests match your search' : 'No guests yet — add your first guest above'}
            </p>
          </div>
        ) : sorted.map((invite, i) => {
          const st = STATUS_STYLE[invite.status] ?? STATUS_STYLE.pending;
          const isExpanded = expanded === invite.id;
          const attending = invite.rsvps.filter((r) => r.attending);
          const declining = invite.rsvps.filter((r) => !r.attending);

          return (
            <div key={invite.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {/* Row */}
              <div style={{ padding: '12px 16px' }}>
                {/* Line 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={selected.has(invite.id)}
                    onChange={() => toggleSelect(invite.id)}
                    style={{ width: 15, height: 15, cursor: 'pointer', flexShrink: 0, accentColor: 'var(--text)' }}
                  />
                  <button
                    onClick={() => setExpanded(isExpanded ? null : invite.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-tertiary)', fontSize: 12, flexShrink: 0 }}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>

                  {/* Name — inline editable on double-click */}
                  {inlineEditId === invite.id ? (
                    <input
                      autoFocus
                      value={inlineEditName}
                      onChange={(e) => setInlineEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveInlineName(invite.id);
                        if (e.key === 'Escape') setInlineEditId(null);
                      }}
                      onBlur={() => saveInlineName(invite.id)}
                      style={{
                        flex: 1, minWidth: 100, border: 'none', background: 'transparent',
                        fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
                        color: 'var(--text)', outline: 'none', padding: 0, margin: 0,
                        borderBottom: '1px solid var(--border)',
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => { setInlineEditId(invite.id); setInlineEditName(invite.guest_name); }}
                      style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, minWidth: 100, cursor: 'default' }}
                    >
                      {invite.guest_name}
                    </span>
                  )}

                  {/* Contact indicators */}
                  {invite.email && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }} title={invite.email}>✉</span>}
                  {invite.phone && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }} title={invite.phone}>☎</span>}

                  {/* Status badge */}
                  <span style={{
                    fontFamily: 'var(--font-montserrat)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.3px', padding: '3px 8px', borderRadius: 20,
                    background: st.bg, color: st.color, flexShrink: 0,
                  }}>
                    {st.label.toUpperCase()}
                  </span>

                  {/* Three-dot menu */}
                  <div style={{ position: 'relative', flexShrink: 0 }} ref={menuOpen === invite.id ? menuRef : undefined}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === invite.id ? null : invite.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-montserrat)', fontSize: 18, color: 'var(--text-tertiary)',
                        padding: '0 4px', lineHeight: 1,
                      }}
                    >
                      ⋯
                    </button>
                    {menuOpen === invite.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', zIndex: 10,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        minWidth: 160, marginTop: 4, overflow: 'hidden',
                      }}>
                        {[
                          { label: 'Edit details', action: () => { setDetailInvite(invite); setMenuOpen(null); } },
                          { label: 'Copy invite link', action: () => copyLink(invite.token) },
                          { label: 'Delete', action: () => { setDeleteTarget(invite); setMenuOpen(null); }, danger: true },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '10px 14px', border: 'none', background: 'none',
                              fontFamily: 'var(--font-montserrat)', fontSize: 12,
                              color: 'danger' in item && item.danger ? '#DC2626' : 'var(--text)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Line 2 — secondary info */}
                <div style={{ paddingLeft: 22, marginTop: 4, display: 'flex', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {invite.rsvps.filter(r => r.attending).length}/{invite.max_guests} attending
                  </span>
                  {invite.table_number && (
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                      Table {invite.table_number}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded RSVPs */}
              {isExpanded && (
                <div style={{ background: 'var(--surface-alt)', padding: '16px 20px 16px 44px', borderTop: '1px solid var(--border)' }}>
                  {invite.rsvps.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>No response yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...attending, ...declining].map((rsvp) => (
                        <div key={rsvp.id} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '10px 14px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: rsvp.meal_preference || rsvp.dietary_notes ? 6 : 0 }}>
                            <span style={{ fontSize: 12, color: rsvp.attending ? 'var(--sage)' : 'var(--text-tertiary)' }}>
                              {rsvp.attending ? '✓' : '✕'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                              {rsvp.person_name}
                            </span>
                          </div>
                          {rsvp.meal_preference && (
                            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-secondary)', marginLeft: 20 }}>
                              Meal: <span style={{ textTransform: 'capitalize' }}>{rsvp.meal_preference}</span>
                            </div>
                          )}
                          {rsvp.dietary_notes && (
                            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic', marginLeft: 20, marginTop: 2 }}>
                              &quot;{rsvp.dietary_notes}&quot;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────────────────── */}
      {detailInvite && (
        <GuestDetailPanel
          invite={detailInvite}
          appUrl={appUrl}
          weddingSlug={weddingSlug}
          isMobile={isMobile}
          onSave={(fields) => saveDetail(detailInvite.id, fields)}
          onDelete={() => setDeleteTarget(detailInvite)}
          onCopyLink={() => copyLink(detailInvite.token)}
          onClose={() => setDetailInvite(null)}
        />
      )}

      {/* ── Send Invites Modal ──────────────────────────────────────────────── */}
      {sendModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: 20,
        }}>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14,
            padding: 0, maxWidth: 480, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Send Invites
              </h3>
              <button onClick={() => setSendModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-tertiary)' }}>×</button>
            </div>

            {/* Guest list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {/* Template toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {([
                  { value: 'invite' as const,   label: 'Initial invite' },
                  { value: 'reminder' as const, label: 'Reminder' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSendTemplate(value)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      border: `1.5px solid ${sendTemplate === value ? 'var(--text)' : 'var(--border)'}`,
                      background: sendTemplate === value ? 'var(--sage-dim)' : 'transparent',
                      fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                      color: sendTemplate === value ? 'var(--text)' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Quick select */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                  {selected.size} selected · tap to send
                </p>
                <button
                  onClick={selectPending}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                    fontSize: 11, color: 'var(--text-secondary)',
                  }}
                >
                  Select pending only
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {invites.filter(inv => selected.has(inv.id)).map((invite) => (
                  <div key={invite.id} style={{
                    background: 'var(--surface-alt)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: invite.phone ? 10 : 0 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                          {invite.guest_name}
                        </span>
                        {invite.phone && (
                          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8 }}>
                            {invite.phone}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { copyLink(invite.token); }}
                        style={{
                          background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                          padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                          fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                    {invite.phone ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => openWhatsApp(invite)}
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                            background: '#25D366', color: '#FFFFFF', cursor: 'pointer',
                            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => openSms(invite)}
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                            background: 'var(--text)', color: 'var(--bg)', cursor: 'pointer',
                            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          iMessage / SMS
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>
                        No phone number — use "Copy Link" to share manually
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" onClick={() => setSendModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: 20,
        }}>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14,
            padding: '28px 24px', maxWidth: 380, width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 10px' }}>
              Delete invite?
            </h3>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              The invite for <strong>{deleteTarget.guest_name}</strong> and all their RSVPs will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'white', background: '#DC2626', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >{deleting ? 'Deleting…' : 'Yes, delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: isMobile ? 80 : 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text)', color: 'var(--bg)',
          fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
          padding: '10px 20px', borderRadius: 20, zIndex: 1200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function GuestDetailPanel({ invite, appUrl, weddingSlug, isMobile, onSave, onDelete, onCopyLink, onClose }: {
  invite: Invite;
  appUrl: string;
  weddingSlug: string;
  isMobile: boolean;
  onSave: (fields: { guest_name: string; max_guests: number; email: string | null; phone: string | null }) => Promise<void>;
  onDelete: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(invite.guest_name);
  const [seats, setSeats] = useState(invite.max_guests);
  const [email, setEmail] = useState(invite.email ?? '');
  const [phone, setPhone] = useState(invite.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('@/lib/qr').then(({ generateQrDataUrl }) =>
      generateQrDataUrl(`${appUrl}/invite/${weddingSlug}`).then((url) => {
        if (!cancelled) setQrUrl(url);
      })
    );
    return () => { cancelled = true; };
  }, [appUrl, weddingSlug]);

  function downloadQr() {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `${invite.guest_name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-invite.png`;
    a.click();
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ guest_name: name.trim(), max_guests: seats, email: email || null, phone: phone || null });
    setSaving(false);
  }

  const attending = invite.rsvps.filter((r) => r.attending);
  const declining = invite.rsvps.filter((r) => !r.attending);
  const link = `${appUrl}/invite/${weddingSlug}`;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 400,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        zIndex: 1001, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Edit Guest
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-tertiary)' }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Guest Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 5 }}>
                SEATS
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setSeats(Math.max(1, seats - 1))} style={stepBtn}>−</button>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: 'var(--text)', minWidth: 24, textAlign: 'center' }}>{seats}</span>
                <button onClick={() => setSeats(Math.min(10, seats + 1))} style={stepBtn}>+</button>
              </div>
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>

          {/* Invite link */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 5 }}>
              INVITE LINK
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', flex: 1, wordBreak: 'break-all' }}>{link}</span>
              <button onClick={onCopyLink} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap',
              }}>Copy</button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 5 }}>
              QR CODE
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR" style={{ width: 96, height: 96, borderRadius: 4, background: '#FFF' }} />
              ) : (
                <div style={{ width: 96, height: 96, background: 'var(--surface)', borderRadius: 4 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 8px' }}>
                  Print on physical invites or share in person.
                </p>
                <button onClick={downloadQr} disabled={!qrUrl} style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '6px 12px', cursor: qrUrl ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-secondary)',
                }}>Download PNG</button>
              </div>
            </div>
          </div>

          {/* RSVPs */}
          {invite.rsvps.length > 0 && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                RESPONSES
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...attending, ...declining].map((rsvp) => (
                  <div key={rsvp.id} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: rsvp.attending ? 'var(--sage)' : 'var(--text-tertiary)' }}>{rsvp.attending ? '✓' : '✕'}</span>
                      <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{rsvp.person_name}</span>
                    </div>
                    {rsvp.meal_preference && (
                      <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-secondary)', marginLeft: 20, marginTop: 4 }}>
                        Meal: <span style={{ textTransform: 'capitalize' }}>{rsvp.meal_preference}</span>
                      </div>
                    )}
                    {rsvp.dietary_notes && (
                      <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic', marginLeft: 20, marginTop: 2 }}>
                        &quot;{rsvp.dietary_notes}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <button onClick={onDelete} style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
            color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer',
          }}>Delete</button>
          <Button size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  fontFamily: 'var(--font-montserrat)',
};
