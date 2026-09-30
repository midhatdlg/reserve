'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  autoSeatByGroup,
  parseGuestSide,
  planVenueSections,
  sectionForTable,
  type GuestSide,
} from '@/lib/seating/auto-seat';

const TABLE_SETTINGS_INFO =
  'Set how many tables your venue has and seats per table. The room splits into a Bride section and a Groom section. Within each section, groups sit together (neighboring tables if needed). Drag to fine-tune.';

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
  group_name?: string | null;
  side?: GuestSide | null;
  token: string;
  email: string | null;
  phone: string | null;
  rsvps: Rsvp[];
}

interface Props {
  weddingId: string;
  weddingSlug: string;
  initialInvites: Invite[];
  initialMealOptions: string[];
  initialMealEnabled: boolean;
  initialTogetherSets?: string[][];
}

type TabKey = 'guests' | 'meals';
type SortOption = 'name-asc' | 'name-desc' | 'status' | 'created';

const STATUS_STYLE: Record<string, { dot: string; bg: string; color: string; label: string }> = {
  responded: { dot: '#2C3A2E', bg: 'rgba(44,58,46,0.08)',  color: '#2C3A2E', label: 'Confirmed' },
  declined:  { dot: '#B8B0A4', bg: 'rgba(212,207,198,0.4)', color: '#9E9890', label: 'Declined'  },
  pending:   { dot: '#8B7355', bg: 'rgba(139,115,85,0.10)', color: '#8B7355', label: 'Pending'   },
};

const STATUS_ORDER: Record<string, number> = { responded: 0, pending: 1, declined: 2 };

/** Quick-pick group labels; any other string is allowed as a custom group. */
const GROUP_PRESETS = ['Family', 'Friends', 'High school'] as const;

type IconName = 'plus' | 'check' | 'x' | 'upload' | 'drag' | 'arrow' | 'search' | 'mail' | 'chev' | 'more' | 'trash' | 'edit' | 'link' | 'download' | 'send' | 'phone' | 'info' | 'settings';

function Icon({ name, size = 16, stroke = 1.5, color = 'currentColor' }: { name: IconName; size?: number; stroke?: number; color?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    upload:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    drag:    <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    mail:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    chev:    <polyline points="6 9 12 15 18 9"/>,
    more:    <><circle cx="12" cy="5"  r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    link:    <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    send:    <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    phone:   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    info:    <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function GuestTableV2({
  weddingId,
  weddingSlug,
  initialInvites,
  initialMealOptions,
  initialMealEnabled,
  initialTogetherSets = [],
}: Props) {
  const [activeTab, setActiveTab]   = useState<TabKey>('guests');
  const [invites, setInvites]       = useState<Invite[]>(initialInvites);
  const [search, setSearch]         = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sort, setSort]             = useState<SortOption>('created');
  const [adding, setAdding]         = useState(false);
  const [newName, setNewName]       = useState('');
  const [newAlloc, setNewAlloc]     = useState(1);
  const [saving, setSaving]         = useState(false);
  const [importing, setImporting]   = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);

  const [menuOpen, setMenuOpen]           = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState<string | null>(null);
  const [detailInvite, setDetailInvite]   = useState<Invite | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Invite | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState<'selected' | 'all' | null>(null);
  const [bulkDeleting, setBulkDeleting]   = useState(false);
  const [inlineEditId, setInlineEditId]   = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState('');
  const [toast, setToast]                 = useState<string | null>(null);
  const [isMobile, setIsMobile]           = useState(false);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTemplate, setSendTemplate]   = useState<'invite' | 'reminder'>('invite');

  // Drag-and-drop
  const [draggingIds, setDraggingIds] = useState<Set<string>>(new Set());
  const [hoverTarget, setHoverTarget] = useState<number | 'unassigned' | null>(null);
  const [tableCount, setTableCount] = useState<number>(() => {
    const maxAssigned = Math.max(0, ...initialInvites.map((i) => i.table_number ?? 0));
    return Math.max(3, maxAssigned);
  });
  const [tableCapacity, setTableCapacity] = useState(8);
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false);
  const [draftTableCount, setDraftTableCount] = useState(3);
  const [draftTableCapacity, setDraftTableCapacity] = useState(8);
  const [autoSeatSettingsOpen, setAutoSeatSettingsOpen] = useState(false);
  const [togetherSets, setTogetherSets] = useState<string[][]>(initialTogetherSets);
  const [draftTogetherSets, setDraftTogetherSets] = useState<string[][]>(initialTogetherSets);
  const [draftPickGroups, setDraftPickGroups] = useState<Set<string>>(new Set());
  const [savingAutoSeatSettings, setSavingAutoSeatSettings] = useState(false);
  const [clearingSeats, setClearingSeats] = useState(false);
  const [autoSeating, setAutoSeating] = useState(false);

  const csvRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const supabase = createClient();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
        setTableMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const groupNames = useMemo(() => {
    const names = new Set<string>();
    for (const inv of invites) {
      const g = inv.group_name?.trim();
      if (g) names.add(g);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [invites]);

  const venueSections = useMemo(
    () => planVenueSections(
      invites.map((inv) => ({
        id: inv.id,
        seats: inv.max_guests,
        tableNumber: inv.table_number,
        groupName: inv.group_name ?? null,
        side: inv.side ?? null,
      })),
      tableCount,
      tableCapacity,
    ),
    [invites, tableCount, tableCapacity],
  );

  const filtered = invites.filter((inv) => {
    if (!inv.guest_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (groupFilter === 'all') return true;
    if (groupFilter === '__none__') return !inv.group_name?.trim();
    return (inv.group_name?.trim() ?? '') === groupFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name-asc') return a.guest_name.localeCompare(b.guest_name);
    if (sort === 'name-desc') return b.guest_name.localeCompare(a.guest_name);
    if (sort === 'status') return (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1);
    return 0;
  });

  const unassigned = sorted.filter((inv) => inv.table_number == null);
  const assigned = sorted.filter((inv) => inv.table_number != null);

  // Make sure tableCount always covers any assigned table that crept in (e.g. from CSV import)
  useEffect(() => {
    const maxAssigned = Math.max(0, ...invites.map((i) => i.table_number ?? 0));
    if (maxAssigned > tableCount) setTableCount(maxAssigned);
  }, [invites, tableCount]);

  const tableNumbers = useMemo(
    () => Array.from({ length: tableCount }, (_, i) => i + 1),
    [tableCount],
  );

  const totalAttending = invites.reduce((sum, inv) => sum + inv.rsvps.filter((r) => r.attending).length, 0);
  const pendingCount   = invites.filter((i) => i.status === 'pending').length;
  const confirmedCount = invites.filter((i) => i.status === 'responded').length;
  const declinedCount  = invites.filter((i) => i.status === 'declined').length;

  // ── Actions ───────────────────────────────────────────────────────────────

  function showToast(msg: string) { setToast(msg); }

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

    function splitCsv(row: string): string[] {
      const cols: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (inQuotes) {
          if (ch === '"') {
            if (row[i + 1] === '"') { cur += '"'; i++; }
            else inQuotes = false;
          } else {
            cur += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          cols.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      cols.push(cur.trim());
      return cols;
    }

    const firstCols = splitCsv(lines[0]).map((c) => c.toLowerCase());
    const hasHeader = firstCols.some((c) => c.includes('name') || c.includes('guest'));

    function findIdx(...keys: string[]) {
      if (!hasHeader) return -1;
      for (const k of keys) {
        const i = firstCols.findIndex((h) => h.includes(k));
        if (i >= 0) return i;
      }
      return -1;
    }

    const nameIdx  = hasHeader ? Math.max(findIdx('name', 'guest'), 0) : 0;
    const seatsIdx = hasHeader ? findIdx('seat', 'max', 'allowed') : 1;
    const emailIdx = hasHeader ? findIdx('email') : 2;
    const phoneIdx = hasHeader ? findIdx('phone', 'mobile') : 3;
    const tableIdx = hasHeader ? findIdx('table') : 4;
    const sideIdx  = hasHeader ? findIdx('side') : 5;
    const groupIdx = hasHeader ? findIdx('group', 'tag') : 6;

    const rows = hasHeader ? lines.slice(1) : lines;

    const guests: {
      name: string;
      seats: number;
      email: string | null;
      phone: string | null;
      table: number | null;
      side: GuestSide | null;
      group: string | null;
    }[] = [];
    for (const row of rows) {
      const cols = splitCsv(row);
      const name = nameIdx >= 0 ? cols[nameIdx] : cols[0];
      if (!name) continue;
      const seatsRaw = seatsIdx >= 0 ? cols[seatsIdx] : '';
      const tableRaw = tableIdx >= 0 ? cols[tableIdx] : '';
      const tableNum = tableRaw ? parseInt(tableRaw.replace(/[^0-9]/g, ''), 10) : NaN;
      const sideRaw = sideIdx >= 0 ? (cols[sideIdx] || '') : '';
      const groupRaw = groupIdx >= 0 ? (cols[groupIdx] || '').trim() : '';
      const side = parseGuestSide(sideRaw);
      // Side is required — skip rows that don't have Bride/Groom when a Side column exists
      if (sideIdx >= 0 && !side) continue;
      guests.push({
        name,
        seats: Math.min(Math.max(parseInt(seatsRaw) || 1, 1), 10),
        email: emailIdx >= 0 ? (cols[emailIdx] || null) : null,
        phone: phoneIdx >= 0 ? (cols[phoneIdx] || null) : null,
        table: Number.isFinite(tableNum) && tableNum > 0 ? tableNum : null,
        side,
        group: groupRaw || null,
      });
    }

    let added = 0, skipped = 0;
    for (const g of guests) {
      const { data, error } = await supabase
        .from('invites')
        .insert({
          wedding_id: weddingId,
          guest_name: g.name,
          max_guests: g.seats,
          email: g.email,
          phone: g.phone,
          table_number: g.table,
          side: g.side,
          group_name: g.group,
        })
        .select('*, rsvps(*)')
        .single();
      if (!error && data) { setInvites((prev) => [...prev, data]); added++; }
      else skipped++;
    }
    setImportResult({ added, skipped });
    setImporting(false);
  }

  function downloadTemplate() {
    // Notes column is ignored on import. Tip row has blank Guest Name (skipped).
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const row = (cols: string[]) => cols.map((c) => (c === '' ? '' : esc(c))).join(',');
    const csv = [
      row(['Guest Name', 'Seats', 'Email', 'Phone', 'Table', 'Side', 'Group', 'Notes (ignored on import)']),
      row([
        '', '', '', '', '', '', '',
        'Fill one row per invite. Guest Name required. Side required: Bride or Groom. Seats = party size (1–10). Email/Phone optional. Table optional. Group optional (Family, Friends, High school, or custom). Replace the two example rows with your guests.',
      ]),
      row([
        'The Johnson Family', '4', 'johnson@email.com', '07700 900001', '', 'Bride', 'Family',
        'Example: Bride side, Family group',
      ]),
      row([
        'Sarah & Tom', '2', 'sarah@email.com', '', '', 'Groom', 'Friends',
        'Example: Groom side, Friends group',
      ]),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded — replace the two example rows with your guests');
  }

  async function saveInlineName(id: string) {
    const trimmed = inlineEditName.trim();
    if (!trimmed) { setInlineEditId(null); return; }
    await supabase.from('invites').update({ guest_name: trimmed }).eq('id', id);
    setInvites((prev) => prev.map((inv) => inv.id === id ? { ...inv, guest_name: trimmed } : inv));
    setInlineEditId(null);
    if (detailInvite?.id === id) setDetailInvite((d) => d ? { ...d, guest_name: trimmed } : d);
  }

  async function saveDetail(id: string, fields: {
    guest_name: string;
    max_guests: number;
    email: string | null;
    phone: string | null;
    side: GuestSide;
    group_name: string | null;
  }) {
    await supabase.from('invites').update(fields).eq('id', id);
    setInvites((prev) => prev.map((inv) => inv.id === id ? { ...inv, ...fields } : inv));
    setDetailInvite(null);
    showToast('Guest updated');
  }

  async function assignTable(inviteId: string, tableNumber: number | null) {
    setInvites((prev) => prev.map((inv) => inv.id === inviteId ? { ...inv, table_number: tableNumber } : inv));
    await supabase.from('invites').update({ table_number: tableNumber }).eq('id', inviteId);
    showToast(tableNumber == null ? 'Moved to Unassigned' : `Moved to Table ${tableNumber}`);
    setMenuOpen(null);
    setTableMenuOpen(null);
  }

  async function assignTableMany(ids: string[], tableNumber: number | null) {
    if (ids.length === 0) return;
    if (ids.length === 1) return assignTable(ids[0], tableNumber);
    setInvites((prev) => prev.map((inv) => ids.includes(inv.id) ? { ...inv, table_number: tableNumber } : inv));
    await supabase.from('invites').update({ table_number: tableNumber }).in('id', ids);
    showToast(`Moved ${ids.length} guests to ${tableNumber == null ? 'Unassigned' : `Table ${tableNumber}`}`);
  }

  function openTableSettings() {
    setDraftTableCount(tableCount);
    setDraftTableCapacity(tableCapacity);
    setTableSettingsOpen(true);
  }

  async function clearSeating(reason?: string) {
    const seatedCount = invites.filter((inv) => inv.table_number != null).length;
    if (seatedCount === 0) {
      showToast('No seated guests to return');
      return 0;
    }
    setClearingSeats(true);
    setInvites((prev) => prev.map((inv) => (
      inv.table_number == null ? inv : { ...inv, table_number: null }
    )));
    await Promise.all([
      supabase
        .from('invites')
        .update({ table_number: null, table_name: null })
        .eq('wedding_id', weddingId)
        .not('table_number', 'is', null),
      supabase
        .from('rsvps')
        .update({ table_number: null, table_name: null })
        .eq('wedding_id', weddingId)
        .not('table_number', 'is', null),
    ]);
    setClearingSeats(false);
    showToast(
      reason
        ?? `Moved ${seatedCount} guest${seatedCount === 1 ? '' : 's'} back to Unassigned`,
    );
    return seatedCount;
  }

  async function saveTableSettings() {
    const nextCount = Math.max(1, Math.min(200, draftTableCount));
    const nextCapacity = Math.max(1, Math.min(50, draftTableCapacity));
    const settingsChanged = nextCount !== tableCount || nextCapacity !== tableCapacity;
    const seatedCount = invites.filter((inv) => inv.table_number != null).length;

    setTableCount(nextCount);
    setTableCapacity(nextCapacity);
    setTableSettingsOpen(false);

    if (settingsChanged && seatedCount > 0) {
      await clearSeating(
        `${nextCount} tables · ${nextCapacity} seats each · ${seatedCount} guest${seatedCount === 1 ? '' : 's'} moved to Unassigned`,
      );
      return;
    }

    showToast(`${nextCount} tables · ${nextCapacity} seats each (${nextCount * nextCapacity} total)`);
  }

  function openAutoSeatSettings() {
    setDraftTogetherSets(togetherSets.map((set) => [...set]));
    setDraftPickGroups(new Set());
    setAutoSeatSettingsOpen(true);
  }

  function toggleDraftPickGroup(name: string) {
    setDraftPickGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addTogetherSetFromPick() {
    const picked = [...draftPickGroups].sort((a, b) => a.localeCompare(b));
    if (picked.length < 2) {
      showToast('Pick at least two groups that can sit together');
      return;
    }
    setDraftTogetherSets((prev) => {
      const key = picked.map((g) => g.toLowerCase()).sort().join('|');
      const exists = prev.some(
        (set) => [...set].map((g) => g.toLowerCase()).sort().join('|') === key,
      );
      if (exists) return prev;
      return [...prev, picked];
    });
    setDraftPickGroups(new Set());
  }

  function removeTogetherSet(idx: number) {
    setDraftTogetherSets((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveAutoSeatSettings() {
    setSavingAutoSeatSettings(true);
    const { data: wedding } = await supabase
      .from('weddings')
      .select('settings')
      .eq('id', weddingId)
      .single();
    const current = (wedding?.settings as Record<string, unknown>) ?? {};
    const { error } = await supabase
      .from('weddings')
      .update({
        settings: {
          ...current,
          auto_seat_together_sets: draftTogetherSets,
        },
      })
      .eq('id', weddingId);
    setSavingAutoSeatSettings(false);
    if (error) {
      showToast(`Could not save: ${error.message}`);
      return;
    }
    setTogetherSets(draftTogetherSets.map((set) => [...set]));
    setAutoSeatSettingsOpen(false);
    showToast(
      draftTogetherSets.length === 0
        ? 'Auto-seat settings saved — each group sits alone'
        : `Auto-seat settings saved · ${draftTogetherSets.length} together set${draftTogetherSets.length === 1 ? '' : 's'}`,
    );
  }

  async function handleAutoSeat() {
    if (autoSeating) return;
    const unseated = invites.filter((inv) => inv.table_number == null);
    if (unseated.length === 0) {
      showToast('All guests are already seated — return them to Unassigned to shuffle');
      return;
    }

    setAutoSeating(true);
    const result = autoSeatByGroup(
      invites.map((inv) => ({
        id: inv.id,
        seats: inv.max_guests,
        tableNumber: inv.table_number,
        groupName: inv.group_name ?? null,
        side: inv.side ?? null,
      })),
      tableCount,
      tableCapacity,
      { togetherSets },
    );

    if (result.assignments.size === 0) {
      showToast('No free seats — open Table settings to add tables or seats');
      setAutoSeating(false);
      return;
    }

    const updates = [...result.assignments.entries()];
    setInvites((prev) =>
      prev.map((inv) => {
        const table = result.assignments.get(inv.id);
        return table == null ? inv : { ...inv, table_number: table };
      }),
    );
    await Promise.all(
      updates.map(([id, table]) =>
        supabase.from('invites').update({ table_number: table }).eq('id', id),
      ),
    );

    const splitNote = result.groupsSplit > 0
      ? ` · ${result.groupsSplit} group${result.groupsSplit === 1 ? '' : 's'} split`
      : '';
    const unplacedNote = result.unplacedIds.length > 0
      ? ` · ${result.unplacedIds.length} left unseated`
      : '';
    const brideRange = result.sections.brideTables;
    const groomRange = result.sections.groomTables;
    const sectionNote = brideRange.length && groomRange.length
      ? ` · Bride tables ${brideRange[0]}–${brideRange[brideRange.length - 1]}, Groom ${groomRange[0]}–${groomRange[groomRange.length - 1]}`
      : '';
    showToast(`Seated ${result.seatedSeats} guest${result.seatedSeats === 1 ? '' : 's'}${splitNote}${unplacedNote}${sectionNote}`);
    setAutoSeating(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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

  async function confirmBulkDelete() {
    if (!bulkDeleteOpen) return;
    setBulkDeleting(true);
    const targetIds = bulkDeleteOpen === 'all'
      ? invites.map((i) => i.id)
      : Array.from(selected);
    if (targetIds.length === 0) {
      setBulkDeleting(false);
      setBulkDeleteOpen(null);
      return;
    }
    const { error } = await supabase.from('invites').delete().in('id', targetIds);
    if (!error) {
      setInvites((prev) => prev.filter((inv) => !targetIds.includes(inv.id)));
      setSelected(new Set());
      showToast(`Deleted ${targetIds.length} guest${targetIds.length === 1 ? '' : 's'}`);
    } else {
      showToast(`Delete failed: ${error.message}`);
    }
    setBulkDeleting(false);
    setBulkDeleteOpen(null);
  }

  // Drag handlers — drag a single row, OR if it's part of a multi-select, drag the whole selection
  function onRowDragStart(e: React.DragEvent, inviteId: string) {
    const ids = (selected.has(inviteId) && selected.size > 1)
      ? Array.from(selected)
      : [inviteId];
    setDraggingIds(new Set(ids));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-reserve-ids', JSON.stringify(ids));
    e.dataTransfer.setData('text/plain', ids.join(','));
  }
  function onRowDragEnd() {
    setDraggingIds(new Set());
    setHoverTarget(null);
  }
  function onZoneDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onZoneDrop(e: React.DragEvent, target: number | 'unassigned') {
    e.preventDefault();
    let ids: string[] = [];
    const payload = e.dataTransfer.getData('application/x-reserve-ids');
    if (payload) {
      try { ids = JSON.parse(payload); } catch { /* ignore */ }
    }
    if (ids.length === 0) {
      const csv = e.dataTransfer.getData('text/plain');
      if (csv) ids = csv.split(',').filter(Boolean);
    }
    if (ids.length === 0 && draggingIds.size > 0) {
      ids = Array.from(draggingIds);
    }
    if (ids.length > 0) {
      const next = target === 'unassigned' ? null : target;
      assignTableMany(ids, next);
      setSelected(new Set()); // clear selection after a successful multi-move
    }
    setDraggingIds(new Set());
    setHoverTarget(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const headerStatus = `${totalAttending} attending · ${pendingCount} pending · ${declinedCount} declined`;

  return (
    <div style={{ fontFamily: 'var(--font-montserrat)', maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid rgba(212,207,198,0.5)' }}>
        {([
          { key: 'guests' as TabKey, label: 'Guest List' },
          { key: 'meals' as TabKey, label: 'Meal Options' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 4px',
              marginRight: 28,
              fontFamily: 'var(--font-montserrat)',
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? '#2C2C2C' : '#9E9890',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2C3A2E' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              letterSpacing: 0.2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Meal Options Tab ─────────────────────────────────────────────── */}
      {activeTab === 'meals' && (
        <MealOptionsPanel weddingId={weddingId} initialMealOptions={initialMealOptions} initialMealEnabled={initialMealEnabled} />
      )}

      {/* ── Guests Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'guests' && (<>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
            fontSize: 44, fontWeight: 500, color: '#2C2C2C',
            margin: 0, lineHeight: 1, letterSpacing: '-0.01em',
          }}>
            Guests
          </h1>
          <p style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 13,
            color: '#6B6560', margin: '10px 0 0', letterSpacing: 0.2,
          }}>
            {invites.length === 0 ? 'No guests yet' : headerStatus}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', minWidth: 200,
            background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.7)',
            borderRadius: 10,
          }}>
            <Icon name="search" size={14} color="#9E9890"/>
            <input
              type="text"
              placeholder="Search guests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontFamily: 'var(--font-montserrat)', fontSize: 13,
                color: '#2C2C2C', outline: 'none', padding: 0,
              }}
            />
          </div>

          <button
            onClick={() => csvRef.current?.click()}
            disabled={importing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.7)',
              color: '#2C2C2C', cursor: 'pointer',
              fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500,
            }}
          >
            <Icon name="upload" size={14}/>
            {importing ? 'Importing…' : 'Import CSV'}
          </button>

          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              background: '#2C3A2E', border: 'none',
              color: '#F5F0E8', cursor: 'pointer',
              fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
            }}
          >
            <Icon name="plus" size={14}/>
            Add guest
          </button>

          <input ref={csvRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.[0]) handleCsvImport(e.target.files[0]); e.target.value = ''; }}
          />
        </div>
      </div>

      {/* Secondary action row */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        marginBottom: 18,
      }}>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(212,207,198,0.7)',
            background: '#FFFFFF', color: '#6B6560',
            fontFamily: 'var(--font-montserrat)', fontSize: 12, outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="created">Date added</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="status">Status</option>
        </select>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(212,207,198,0.7)',
            background: '#FFFFFF', color: '#6B6560',
            fontFamily: 'var(--font-montserrat)', fontSize: 12, outline: 'none',
            cursor: 'pointer',
            maxWidth: 180,
          }}
        >
          <option value="all">All groups</option>
          <option value="__none__">No group</option>
          {groupNames.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button onClick={downloadTemplate} style={subtleBtn}>↓ Template</button>
        <a href="/guest-list-200-test.csv" download="guest-list-200-test.csv" style={{ ...subtleBtn, textDecoration: 'none' }}>
          ↓ Test list (200)
        </a>
        <button onClick={() => { if (selected.size === 0) setSelected(new Set(sorted.map(i => i.id))); setSendModalOpen(true); }} style={subtleBtn}>
          <Icon name="send" size={11}/> Send Invites
        </button>
        <button onClick={() => window.open('/api/export/guests?status=attending', '_blank')} style={subtleBtn}>
          <Icon name="download" size={11}/> Caterer List
        </button>
        {invites.length > 0 && (
          <button
            onClick={() => setBulkDeleteOpen('all')}
            style={{ ...subtleBtn, color: '#C4564A' }}
            title="Delete every guest"
          >
            <Icon name="trash" size={11}/> Delete all
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#9E9890', fontFamily: 'var(--font-montserrat)' }}>
          {confirmedCount} confirmed · {pendingCount} pending
        </span>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 10, marginBottom: 14,
          background: 'rgba(44,58,46,0.06)', border: '1px solid rgba(44,58,46,0.15)',
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#2C3A2E' }}>
            ✓ Imported {importResult.added} guest{importResult.added !== 1 ? 's' : ''}
            {importResult.skipped > 0 && ` · ${importResult.skipped} skipped`}
          </span>
          <button onClick={() => setImportResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9890', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Add guest inline */}
      {adding && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: '#FFFFFF', border: '1px solid rgba(44,58,46,0.18)',
          borderRadius: 12, marginBottom: 14, flexWrap: 'wrap',
        }}>
          <input autoFocus type="text" placeholder="Guest name" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGuest()}
            style={{ flex: 1, minWidth: 160, border: 'none', background: 'transparent', fontFamily: 'var(--font-montserrat)', fontSize: 14, color: '#2C2C2C', outline: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setNewAlloc(Math.max(1, newAlloc - 1))} style={stepBtn}>−</button>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: '#2C2C2C', minWidth: 20, textAlign: 'center' }}>{newAlloc}</span>
            <button onClick={() => setNewAlloc(Math.min(10, newAlloc + 1))} style={stepBtn}>+</button>
            <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890' }}>seats</span>
          </div>
          <Button size="sm" loading={saving} onClick={addGuest}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName(''); setNewAlloc(1); }}>Cancel</Button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && !sendModalOpen && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderRadius: 10, marginBottom: 14,
          background: 'rgba(44,58,46,0.06)', border: '1px solid rgba(44,58,46,0.15)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#2C2C2C' }}>
            {selected.size} selected
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" onClick={() => setSendModalOpen(true)}>Send Invites</Button>
            <button
              onClick={() => setBulkDeleteOpen('selected')}
              style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600,
                color: '#C4564A', background: 'transparent',
                border: '1px solid rgba(196,86,74,0.4)', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer',
              }}
            >
              Delete selected
            </button>
            <Button size="sm" variant="secondary" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {invites.length === 0 ? (
        <div style={{
          padding: '64px 32px', textAlign: 'center',
          background: '#FFFFFF', border: '1px dashed rgba(212,207,198,0.7)',
          borderRadius: 14,
        }}>
          <p style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 24, color: '#9E9890', margin: '0 0 8px' }}>
            No guests yet
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#9E9890', margin: 0 }}>
            Add your first guest above or import a CSV.
          </p>
        </div>
      ) : (

      /* Two-column body: Unassigned + Tables */
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '380px 1fr',
        gap: 20,
        alignItems: 'start',
      }}>
        {/* ── UNASSIGNED ────────────────────────────────────────────────── */}
        <div
          onDragOver={onZoneDragOver}
          onDragEnter={() => setHoverTarget('unassigned')}
          onDragLeave={(e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setHoverTarget(null); }}
          onDrop={(e) => onZoneDrop(e, 'unassigned')}
          style={{
            background: hoverTarget === 'unassigned' ? 'rgba(44,58,46,0.06)' : '#FAF7F1',
            border: hoverTarget === 'unassigned' ? '2px dashed #2C3A2E' : '1px solid rgba(212,207,198,0.5)',
            borderRadius: 12,
            padding: '16px 14px',
            transition: 'all 0.2s ease',
            position: isMobile ? 'static' : 'sticky',
            top: 24,
            maxHeight: isMobile ? undefined : 'calc(100vh - 48px)',
            display: 'flex', flexDirection: 'column',
            minHeight: 200,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12, flexShrink: 0,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              color: '#8B7355', textTransform: 'uppercase',
            }}>Unassigned</div>
            <div style={{
              fontSize: 10, color: '#9E9890',
              padding: '2px 9px', background: '#FFFFFF',
              borderRadius: 10, border: '1px solid rgba(212,207,198,0.6)',
              minWidth: 24, textAlign: 'center',
            }}>{unassigned.length}</div>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            overflowY: 'auto', flex: 1,
            margin: '0 -4px', padding: '0 4px',
          }}>
            {unassigned.length === 0 ? (
              <div style={{
                padding: '24px 12px', textAlign: 'center',
                fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
                fontSize: 14, color: '#9E9890',
                border: '1px dashed rgba(212,207,198,0.7)',
                borderRadius: 8,
              }}>All seated ✓</div>
            ) : unassigned.map((inv) => (
              <GuestRowCard
                key={inv.id}
                invite={inv}
                dragging={draggingIds.has(inv.id)}
                editing={inlineEditId === inv.id}
                editValue={inlineEditName}
                selected={selected.has(inv.id)}
                menuOpen={menuOpen === inv.id}
                tableMenuOpen={tableMenuOpen === inv.id}
                tableNumbers={tableNumbers}
                menuRef={menuOpen === inv.id ? menuRef : undefined}
                onToggleSelect={() => toggleSelect(inv.id)}
                onMenuToggle={() => { setMenuOpen(menuOpen === inv.id ? null : inv.id); setTableMenuOpen(null); }}
                onTableMenuToggle={() => setTableMenuOpen(tableMenuOpen === inv.id ? null : inv.id)}
                onAssignTable={(n) => assignTable(inv.id, n)}
                onEdit={() => { setDetailInvite(inv); setMenuOpen(null); }}
                onCopyLink={() => copyLink(inv.token)}
                onDelete={() => { setDeleteTarget(inv); setMenuOpen(null); }}
                onInlineEditStart={() => { setInlineEditId(inv.id); setInlineEditName(inv.guest_name); }}
                onInlineEditChange={setInlineEditName}
                onInlineEditSave={() => saveInlineName(inv.id)}
                onInlineEditCancel={() => setInlineEditId(null)}
                onDragStart={(e) => onRowDragStart(e, inv.id)}
                onDragEnd={onRowDragEnd}
              />
            ))}
          </div>
        </div>

        {/* ── TABLES ────────────────────────────────────────────────────── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12, gap: 8, flexWrap: 'wrap',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              color: '#8B7355', textTransform: 'uppercase',
            }}>Tables</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAutoSeat}
                disabled={autoSeating}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600,
                  color: '#F5F0E8', background: '#2C3A2E',
                  border: 'none',
                  borderRadius: 8, padding: '6px 12px',
                  cursor: autoSeating ? 'wait' : 'pointer',
                  opacity: autoSeating ? 0.7 : 1,
                }}
              >
                {autoSeating ? 'Seating…' : 'Auto-seat by group'}
              </button>
              <button
                type="button"
                onClick={openAutoSeatSettings}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
                  color: '#6B6560', background: 'transparent',
                  border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              >
                <Icon name="settings" size={11}/> Auto-seat settings
              </button>
              <button
                type="button"
                onClick={() => clearSeating()}
                disabled={clearingSeats || assigned.length === 0}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
                  color: assigned.length === 0 ? '#B8B0A4' : '#6B6560',
                  background: 'transparent',
                  border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 8, padding: '5px 10px',
                  cursor: assigned.length === 0 || clearingSeats ? 'not-allowed' : 'pointer',
                }}
              >
                {clearingSeats ? 'Returning…' : 'Return to Unassigned'}
              </button>
              <button
                type="button"
                onClick={openTableSettings}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
                  color: '#6B6560', background: 'transparent',
                  border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              >
                <Icon name="settings" size={11}/> Table settings
              </button>
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890',
            margin: '0 0 12px', lineHeight: 1.45,
          }}>
            {tableCount} tables · {tableCapacity} seats each · {tableCount * tableCapacity} venue seats
            {togetherSets.length > 0 ? ` · ${togetherSets.length} together set${togetherSets.length === 1 ? '' : 's'}` : ''}
            <br />
            {venueSections.brideTables.length > 0 && (
              <>Bride section: tables {venueSections.brideTables[0]}–{venueSections.brideTables[venueSections.brideTables.length - 1]}</>
            )}
            {venueSections.brideTables.length > 0 && venueSections.groomTables.length > 0 ? ' · ' : ''}
            {venueSections.groomTables.length > 0 && (
              <>Groom section: tables {venueSections.groomTables[0]}–{venueSections.groomTables[venueSections.groomTables.length - 1]}</>
            )}
            <br />
            Within each section, groups sit together · Auto-seat settings lets groups share tables · Return to Unassigned to reshuffle
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {tableNumbers.map((tn) => {
              const seated = assigned.filter((inv) => inv.table_number === tn);
              const section = sectionForTable(tn, venueSections);
              const tableSides = [...new Set(
                seated
                  .map((inv) => inv.side)
                  .filter((s): s is GuestSide => s === 'bride' || s === 'groom'),
              )].sort();
              const tableGroups = [...new Set(
                seated
                  .map((inv) => inv.group_name?.trim())
                  .filter((g): g is string => Boolean(g)),
              )].sort((a, b) => a.localeCompare(b));
              const tableTags = [
                ...(section ? [section === 'bride' ? 'Bride section' : 'Groom section'] : []),
                ...tableSides
                  .filter((s) => !section || s !== section)
                  .map((s) => (s === 'bride' ? 'Bride' : 'Groom')),
                ...tableGroups,
              ];
              const isHover = hoverTarget === tn;
              const sectionTint = section === 'bride'
                ? 'rgba(107,79,107,0.04)'
                : section === 'groom'
                  ? 'rgba(58,74,107,0.04)'
                  : '#FAF7F1';
              return (
                <div
                  key={tn}
                  onDragOver={onZoneDragOver}
                  onDragEnter={() => setHoverTarget(tn)}
                  onDragLeave={(e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setHoverTarget(null); }}
                  onDrop={(e) => onZoneDrop(e, tn)}
                  style={{
                    background: isHover ? 'rgba(44,58,46,0.04)' : sectionTint,
                    border: isHover
                      ? '2px dashed #2C3A2E'
                      : section === 'bride'
                        ? '1px solid rgba(107,79,107,0.22)'
                        : section === 'groom'
                          ? '1px solid rgba(58,74,107,0.22)'
                          : '1px solid rgba(212,207,198,0.5)',
                    borderRadius: 12,
                    padding: 14,
                    minHeight: 180,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: tableTags.length > 0 ? 6 : 10, gap: 8,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
                      fontSize: 18, color: '#2C2C2C',
                    }}>Table {tn}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, color: '#9E9890' }}>{seated.length} seated</div>
                      {seated.length === 0 && tn === tableCount && tableCount > 1 && (
                        <button
                          onClick={() => setTableCount((n) => Math.max(1, n - 1))}
                          title="Remove table"
                          style={{
                            background: 'transparent', border: 'none',
                            color: '#9E9890', cursor: 'pointer',
                            padding: 2, display: 'flex',
                          }}
                        >
                          <Icon name="x" size={13}/>
                        </button>
                      )}
                    </div>
                  </div>
                  {tableTags.length > 0 && (
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 4,
                      marginBottom: 10,
                    }}>
                      {tableTags.map((tag) => {
                        const isSide = tag === 'Bride' || tag === 'Groom';
                        return (
                          <span
                            key={tag}
                            style={{
                              fontFamily: 'var(--font-montserrat)', fontSize: 10, fontWeight: 600,
                              color: isSide ? (tag === 'Bride' ? '#6B4F6B' : '#3A4A6B') : '#2C3A2E',
                              background: isSide
                                ? (tag === 'Bride' ? 'rgba(107,79,107,0.10)' : 'rgba(58,74,107,0.10)')
                                : 'rgba(44,58,46,0.08)',
                              border: isSide
                                ? `1px solid ${tag === 'Bride' ? 'rgba(107,79,107,0.22)' : 'rgba(58,74,107,0.22)'}`
                                : '1px solid rgba(44,58,46,0.12)',
                              borderRadius: 6, padding: '2px 8px',
                            }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {seated.map((inv) => (
                      <GuestRowCard
                        key={inv.id}
                        invite={inv}
                        compact
                        dragging={draggingIds.has(inv.id)}
                        editing={inlineEditId === inv.id}
                        editValue={inlineEditName}
                        selected={selected.has(inv.id)}
                        menuOpen={menuOpen === inv.id}
                        tableMenuOpen={tableMenuOpen === inv.id}
                        tableNumbers={tableNumbers}
                        menuRef={menuOpen === inv.id ? menuRef : undefined}
                        onToggleSelect={() => toggleSelect(inv.id)}
                        onMenuToggle={() => { setMenuOpen(menuOpen === inv.id ? null : inv.id); setTableMenuOpen(null); }}
                        onTableMenuToggle={() => setTableMenuOpen(tableMenuOpen === inv.id ? null : inv.id)}
                        onAssignTable={(n) => assignTable(inv.id, n)}
                        onEdit={() => { setDetailInvite(inv); setMenuOpen(null); }}
                        onCopyLink={() => copyLink(inv.token)}
                        onDelete={() => { setDeleteTarget(inv); setMenuOpen(null); }}
                        onInlineEditStart={() => { setInlineEditId(inv.id); setInlineEditName(inv.guest_name); }}
                        onInlineEditChange={setInlineEditName}
                        onInlineEditSave={() => saveInlineName(inv.id)}
                        onInlineEditCancel={() => setInlineEditId(null)}
                        onDragStart={(e) => onRowDragStart(e, inv.id)}
                        onDragEnd={onRowDragEnd}
                      />
                    ))}
                    {seated.length === 0 && (
                      <div style={{
                        padding: '20px 8px', textAlign: 'center',
                        fontFamily: 'var(--font-montserrat)', fontSize: 11,
                        color: '#9E9890', fontStyle: 'italic',
                      }}>
                        Drag a guest here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* ── Detail Panel ─────────────────────────────────────────────────── */}
      {detailInvite && (
        <GuestDetailPanel
          invite={detailInvite}
          existingGroups={groupNames}
          appUrl={appUrl}
          weddingSlug={weddingSlug}
          isMobile={isMobile}
          onSave={(fields) => saveDetail(detailInvite.id, fields)}
          onDelete={() => setDeleteTarget(detailInvite)}
          onCopyLink={() => copyLink(detailInvite.token)}
          onClose={() => setDetailInvite(null)}
        />
      )}

      {/* ── Send Invites Modal ──────────────────────────────────────────── */}
      {sendModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: 20,
        }}>
          <div style={{
            background: '#F5F0E8', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 14,
            padding: 0, maxWidth: 480, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(212,207,198,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: 0 }}>
                Send Invites
              </h3>
              <button onClick={() => setSendModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9E9890' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
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
                      border: `1.5px solid ${sendTemplate === value ? '#2C3A2E' : 'rgba(212,207,198,0.7)'}`,
                      background: sendTemplate === value ? 'rgba(44,58,46,0.08)' : 'transparent',
                      fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                      color: sendTemplate === value ? '#2C3A2E' : '#9E9890',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#9E9890', margin: 0 }}>
                  {selected.size} selected · tap to send
                </p>
                <button
                  onClick={selectPending}
                  style={{
                    background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                    fontSize: 11, color: '#6B6560',
                  }}
                >
                  Select pending only
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {invites.filter(inv => selected.has(inv.id)).map((invite) => (
                  <div key={invite.id} style={{
                    background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: invite.phone ? 10 : 0 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: '#2C2C2C' }}>
                          {invite.guest_name}
                        </span>
                        {invite.phone && (
                          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', marginLeft: 8 }}>
                            {invite.phone}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyLink(invite.token)}
                        style={{
                          background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 6,
                          padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                          fontSize: 11, color: '#6B6560', whiteSpace: 'nowrap', flexShrink: 0,
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
                            background: '#2C3A2E', color: '#F5F0E8', cursor: 'pointer',
                            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          iMessage / SMS
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', margin: 0 }}>
                        No phone number — use &quot;Copy Link&quot; to share manually
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(212,207,198,0.5)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" onClick={() => setSendModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table Settings Modal ─────────────────────────────────────────── */}
      {tableSettingsOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: 20,
          }}
          onClick={() => setTableSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#F5F0E8', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 14,
              padding: 0, maxWidth: 400, width: '100%',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(212,207,198,0.5)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: 0 }}>
                  Table settings
                </h3>
                <span
                  tabIndex={0}
                  aria-label={TABLE_SETTINGS_INFO}
                  style={{ position: 'relative', display: 'inline-flex', color: '#9E9890', cursor: 'help' }}
                  className="table-settings-info"
                >
                  <Icon name="info" size={16} />
                  <span
                    role="tooltip"
                    style={{
                      position: 'absolute', left: '50%', bottom: 'calc(100% + 8px)',
                      transform: 'translateX(-50%)',
                      width: 240, padding: '10px 12px', borderRadius: 8,
                      background: '#2C2C2C', color: '#F5F0E8',
                      fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 500,
                      lineHeight: 1.45, textAlign: 'left',
                      opacity: 0, pointerEvents: 'none',
                      transition: 'opacity 0.15s ease',
                      zIndex: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    }}
                    className="table-settings-tooltip"
                  >
                    {TABLE_SETTINGS_INFO}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTableSettingsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9E9890' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8,
                }}>
                  TABLES AT VENUE
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDraftTableCount((n) => Math.max(1, n - 1))}
                    style={stepBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={draftTableCount}
                    onChange={(e) => setDraftTableCount(Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)))}
                    style={{
                      width: 72, textAlign: 'center',
                      fontFamily: 'var(--font-montserrat)', fontSize: 18, fontWeight: 600,
                      color: '#2C2C2C', background: '#FFFFFF',
                      border: '1px solid rgba(212,207,198,0.7)', borderRadius: 8,
                      padding: '8px 6px', outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDraftTableCount((n) => Math.min(200, n + 1))}
                    style={stepBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8,
                }}>
                  SEATS PER TABLE
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDraftTableCapacity((n) => Math.max(1, n - 1))}
                    style={stepBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={draftTableCapacity}
                    onChange={(e) => setDraftTableCapacity(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
                    style={{
                      width: 72, textAlign: 'center',
                      fontFamily: 'var(--font-montserrat)', fontSize: 18, fontWeight: 600,
                      color: '#2C2C2C', background: '#FFFFFF',
                      border: '1px solid rgba(212,207,198,0.7)', borderRadius: 8,
                      padding: '8px 6px', outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDraftTableCapacity((n) => Math.min(50, n + 1))}
                    style={stepBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#6B6560',
                margin: 0, padding: '12px 14px', borderRadius: 8,
                background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)',
              }}>
                Total venue seats:{' '}
                <strong style={{ color: '#2C3A2E' }}>
                  {draftTableCount * draftTableCapacity}
                </strong>
              </p>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890',
                margin: 0, lineHeight: 1.45,
              }}>
                Changing these settings moves seated guests back to Unassigned so you can Auto-seat again.
                Guests must be Bride or Groom; same group sits together. Drag to fine-tune after.
              </p>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid rgba(212,207,198,0.5)',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => setTableSettingsOpen(false)}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560',
                  background: 'none', border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <Button size="sm" onClick={saveTableSettings}>Save</Button>
            </div>
          </div>
          <style>{`
            .table-settings-info:hover .table-settings-tooltip,
            .table-settings-info:focus-visible .table-settings-tooltip {
              opacity: 1 !important;
            }
          `}</style>
        </div>
      )}

      {/* ── Auto-seat Settings Modal ─────────────────────────────────────── */}
      {autoSeatSettingsOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: 20,
          }}
          onClick={() => setAutoSeatSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#F5F0E8', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 14,
              maxWidth: 480, width: '100%', maxHeight: '85vh',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(212,207,198,0.5)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <h3 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: 0 }}>
                Auto-seat settings
              </h3>
              <button
                type="button"
                onClick={() => setAutoSeatSettingsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9E9890' }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <p style={{
                fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#6B6560',
                margin: 0, lineHeight: 1.5,
              }}>
                The venue is split into a Bride section and a Groom section (like two sides of the room).
                Choose which groups can share tables within the same section — they never cross the aisle.
                Groups not listed below only sit with their own group.
              </p>

              {groupNames.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#9E9890', margin: 0 }}>
                  Add group tags to guests first (Family, Friends, High school…), then come back here.
                </p>
              ) : (
                <>
                  <div>
                    <label style={{
                      display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
                      fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8,
                    }}>
                      PICK GROUPS THAT CAN SIT TOGETHER
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {groupNames.map((g) => {
                        const selected = draftPickGroups.has(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleDraftPickGroup(g)}
                            style={{
                              padding: '6px 12px', borderRadius: 8,
                              border: selected ? '1px solid #2C3A2E' : '1px solid rgba(212,207,198,0.7)',
                              background: selected ? 'rgba(44,58,46,0.10)' : '#FFFFFF',
                              color: selected ? '#2C3A2E' : '#6B6560',
                              fontFamily: 'var(--font-montserrat)', fontSize: 12,
                              fontWeight: selected ? 600 : 500, cursor: 'pointer',
                            }}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={addTogetherSetFromPick}
                      disabled={draftPickGroups.size < 2}
                      style={{
                        fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                        color: draftPickGroups.size < 2 ? '#9E9890' : '#F5F0E8',
                        background: draftPickGroups.size < 2 ? 'rgba(212,207,198,0.5)' : '#2C3A2E',
                        border: 'none', borderRadius: 8, padding: '8px 14px',
                        cursor: draftPickGroups.size < 2 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Allow selected to sit together
                    </button>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11,
                      fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8,
                    }}>
                      TOGETHER SETS
                    </label>
                    {draftTogetherSets.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#9E9890', margin: 0 }}>
                        None yet — each group sits only with itself.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {draftTogetherSets.map((set, idx) => (
                          <div
                            key={`${set.join('|')}-${idx}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)',
                              borderRadius: 8, padding: '10px 12px',
                            }}
                          >
                            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {set.map((g) => (
                                <span
                                  key={g}
                                  style={{
                                    fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600,
                                    color: '#2C3A2E', background: 'rgba(44,58,46,0.08)',
                                    borderRadius: 6, padding: '2px 8px',
                                  }}
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTogetherSet(idx)}
                              title="Remove set"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#9E9890', display: 'flex', padding: 2,
                              }}
                            >
                              <Icon name="x" size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid rgba(212,207,198,0.5)',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => setAutoSeatSettingsOpen(false)}
                style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560',
                  background: 'none', border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <Button size="sm" loading={savingAutoSeatSettings} onClick={saveAutoSeatSettings}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Modal ────────────────────────────────────────────── */}
      {bulkDeleteOpen && (() => {
        const count = bulkDeleteOpen === 'all' ? invites.length : selected.size;
        const isAll = bulkDeleteOpen === 'all';
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: 20,
          }}>
            <div style={{
              background: '#F5F0E8', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 14,
              padding: '28px 24px', maxWidth: 420, width: '100%',
            }}>
              <h3 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: '0 0 10px' }}>
                {isAll ? 'Delete every guest?' : `Delete ${count} guest${count === 1 ? '' : 's'}?`}
              </h3>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560', margin: '0 0 20px', lineHeight: 1.5 }}>
                {isAll
                  ? <>All <strong>{count}</strong> invites and their RSVP responses will be permanently deleted. This cannot be undone.</>
                  : <>The <strong>{count}</strong> selected invite{count === 1 ? '' : 's'} and their RSVPs will be permanently deleted. This cannot be undone.</>}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setBulkDeleteOpen(null)}
                  disabled={bulkDeleting}
                  style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560', background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 8, padding: '8px 16px', cursor: bulkDeleting ? 'not-allowed' : 'pointer' }}
                >Cancel</button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={bulkDeleting}
                  style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'white', background: '#C4564A', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: bulkDeleting ? 'not-allowed' : 'pointer' }}
                >{bulkDeleting ? 'Deleting…' : isAll ? `Yes, delete all ${count}` : `Yes, delete ${count}`}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: 20,
        }}>
          <div style={{
            background: '#F5F0E8', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 14,
            padding: '28px 24px', maxWidth: 380, width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: '0 0 10px' }}>
              Delete invite?
            </h3>
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560', margin: '0 0 20px', lineHeight: 1.5 }}>
              The invite for <strong>{deleteTarget.guest_name}</strong> and all their RSVPs will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560', background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 600, color: 'white', background: '#C4564A', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
              >{deleting ? 'Deleting…' : 'Yes, delete'}</button>
            </div>
          </div>
        </div>
      )}

      </>)}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: isMobile ? 80 : 32, left: '50%', transform: 'translateX(-50%)',
          background: '#2C3A2E', color: '#F5F0E8',
          fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
          padding: '10px 20px', borderRadius: 20, zIndex: 1200,
          boxShadow: '0 8px 24px rgba(44,58,46,0.25)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Guest row card ───────────────────────────────────────────────────────────

function GuestRowCard({
  invite, compact, dragging, editing, editValue, selected, menuOpen, tableMenuOpen,
  tableNumbers, menuRef,
  onToggleSelect, onMenuToggle, onTableMenuToggle, onAssignTable, onEdit, onCopyLink, onDelete,
  onInlineEditStart, onInlineEditChange, onInlineEditSave, onInlineEditCancel,
  onDragStart, onDragEnd,
}: {
  invite: Invite;
  compact?: boolean;
  dragging: boolean;
  editing: boolean;
  editValue: string;
  selected: boolean;
  menuOpen: boolean;
  tableMenuOpen: boolean;
  tableNumbers: number[];
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onToggleSelect: () => void;
  onMenuToggle: () => void;
  onTableMenuToggle: () => void;
  onAssignTable: (tableNumber: number | null) => void;
  onEdit: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  onInlineEditStart: () => void;
  onInlineEditChange: (v: string) => void;
  onInlineEditSave: () => void;
  onInlineEditCancel: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const st = STATUS_STYLE[invite.status] ?? STATUS_STYLE.pending;
  const attendingCount = invite.rsvps.filter((r) => r.attending).length;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: compact ? '8px 10px' : '10px 12px',
        background: '#FFFFFF',
        border: '1px solid rgba(212,207,198,0.6)',
        borderRadius: 8,
        opacity: dragging ? 0.4 : 1,
        cursor: 'grab',
        transition: 'opacity 0.2s ease',
        position: 'relative',
      }}
    >
      <div style={{ color: '#B8B0A4', display: 'flex', flexShrink: 0 }}>
        <Icon name="drag" size={12}/>
      </div>

      {!compact && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 13, height: 13, cursor: 'pointer', flexShrink: 0, accentColor: '#2C3A2E' }}
        />
      )}

      <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />

      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onInlineEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onInlineEditSave();
            if (e.key === 'Escape') onInlineEditCancel();
          }}
          onBlur={onInlineEditSave}
          style={{
            flex: 1, minWidth: 60, border: 'none', background: 'transparent',
            fontFamily: 'var(--font-montserrat)', fontSize: compact ? 12 : 13,
            fontWeight: 500, color: '#2C2C2C', outline: 'none', padding: 0,
            borderBottom: '1px solid rgba(44,58,46,0.3)',
          }}
        />
      ) : (
        <div
          onDoubleClick={onInlineEditStart}
          style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-montserrat)', fontSize: compact ? 12 : 13,
            fontWeight: 500, color: '#2C2C2C',
            lineHeight: 1.3,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}>
            {invite.guest_name}
          </span>
          {!compact && (
            <span style={{
              fontFamily: 'var(--font-montserrat)', fontSize: 10, color: '#9E9890',
            }}>
              {invite.side === 'bride' ? 'Bride' : invite.side === 'groom' ? 'Groom' : 'No side'}
              {invite.group_name?.trim() ? ` · ${invite.group_name.trim()}` : ''}
              {' · '}{attendingCount}/{invite.max_guests} attending
              {invite.email && ' · ✉'}
              {invite.phone && ' · ☎'}
            </span>
          )}
        </div>
      )}

      <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9E9890', padding: 2, display: 'flex',
          }}
        >
          <Icon name="more" size={14}/>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: '100%', zIndex: 30,
            background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.7)',
            borderRadius: 10, boxShadow: '0 12px 32px rgba(44,58,46,0.15)',
            minWidth: 180, marginTop: 6, overflow: 'hidden',
          }}>
            <MenuItem onClick={onEdit}><Icon name="edit" size={12}/> Edit details</MenuItem>
            <MenuItem onClick={onCopyLink}><Icon name="link" size={12}/> Copy invite link</MenuItem>
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onTableMenuToggle(); }}
                style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F0EBE3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Move to table
                </span>
                <span style={{ color: '#9E9890', display: 'flex' }}>
                  <Icon name="chev" size={11}/>
                </span>
              </button>
              {tableMenuOpen && (
                <div style={{
                  position: 'absolute', right: '100%', top: 0,
                  background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.7)',
                  borderRadius: 10, boxShadow: '0 12px 32px rgba(44,58,46,0.15)',
                  minWidth: 140, marginRight: 4, overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
                }}>
                  <MenuItem onClick={() => onAssignTable(null)}>Unassigned</MenuItem>
                  {tableNumbers.map((tn) => (
                    <MenuItem key={tn} onClick={() => onAssignTable(tn)} active={invite.table_number === tn}>
                      Table {tn}
                    </MenuItem>
                  ))}
                </div>
              )}
            </div>
            <div style={{ height: 1, background: 'rgba(212,207,198,0.5)' }}/>
            <MenuItem onClick={onDelete} danger><Icon name="trash" size={12}/> Delete</MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ children, onClick, danger, active }: { children: React.ReactNode; onClick: () => void; danger?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...menuItemStyle,
        color: danger ? '#C4564A' : '#2C2C2C',
        background: active ? 'rgba(44,58,46,0.06)' : 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0EBE3')}
      onMouseLeave={(e) => (e.currentTarget.style.background = active ? 'rgba(44,58,46,0.06)' : 'transparent')}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</span>
    </button>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  width: '100%', textAlign: 'left',
  padding: '9px 14px', border: 'none', background: 'transparent',
  fontFamily: 'var(--font-montserrat)', fontSize: 12,
  cursor: 'pointer', transition: 'background 0.12s ease',
};

const subtleBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 12px', borderRadius: 8,
  background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.7)',
  color: '#6B6560', cursor: 'pointer',
  fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 500,
};

// ── Detail Panel ──────────────────────────────────────────────────────────────

function GuestDetailPanel({ invite, existingGroups, appUrl, weddingSlug, isMobile, onSave, onDelete, onCopyLink, onClose }: {
  invite: Invite;
  existingGroups: string[];
  appUrl: string;
  weddingSlug: string;
  isMobile: boolean;
  onSave: (fields: {
    guest_name: string;
    max_guests: number;
    email: string | null;
    phone: string | null;
    side: GuestSide;
    group_name: string | null;
  }) => Promise<void>;
  onDelete: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(invite.guest_name);
  const [seats, setSeats] = useState(invite.max_guests);
  const [email, setEmail] = useState(invite.email ?? '');
  const [phone, setPhone] = useState(invite.phone ?? '');
  const [side, setSide]   = useState<GuestSide | null>(invite.side ?? null);
  const [group, setGroup] = useState(invite.group_name ?? '');
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const groupSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const g of [...GROUP_PRESETS, ...existingGroups]) {
      const key = g.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(g.trim());
    }
    return out;
  }, [existingGroups]);

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
    if (side !== 'bride' && side !== 'groom') {
      alert('Please choose Bride or Groom side.');
      return;
    }
    setSaving(true);
    await onSave({
      guest_name: name.trim(),
      max_guests: seats,
      email: email || null,
      phone: phone || null,
      side,
      group_name: group.trim() || null,
    });
    setSaving(false);
  }

  const attending = invite.rsvps.filter((r) => r.attending);
  const declining = invite.rsvps.filter((r) => !r.attending);
  const link = `${appUrl}/invite/${weddingSlug}`;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 420,
        background: '#F5F0E8', borderLeft: '1px solid rgba(212,207,198,0.5)',
        zIndex: 1001, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(212,207,198,0.5)' }}>
          <h2 style={{ fontFamily: 'var(--font-yeseva)', fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', margin: 0 }}>
            Edit Guest
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9E9890' }}>×</button>
        </div>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Guest Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 5 }}>
                SEATS
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setSeats(Math.max(1, seats - 1))} style={stepBtn}>−</button>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 16, fontWeight: 600, color: '#2C2C2C', minWidth: 24, textAlign: 'center' }}>{seats}</span>
                <button onClick={() => setSeats(Math.min(10, seats + 1))} style={stepBtn}>+</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8 }}>
                SIDE (required)
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                {([
                  { value: 'bride' as const, label: 'Bride' },
                  { value: 'groom' as const, label: 'Groom' },
                ]).map(({ value, label }) => {
                  const selected = side === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSide(value)}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 8,
                        border: selected
                          ? `1.5px solid ${value === 'bride' ? '#6B4F6B' : '#3A4A6B'}`
                          : '1px solid rgba(212,207,198,0.7)',
                        background: selected
                          ? (value === 'bride' ? 'rgba(107,79,107,0.12)' : 'rgba(58,74,107,0.12)')
                          : '#FFFFFF',
                        color: selected
                          ? (value === 'bride' ? '#6B4F6B' : '#3A4A6B')
                          : '#6B6560',
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', margin: '0 0 14px' }}>
                Every guest must be Bride or Groom side.
              </p>

              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8 }}>
                GROUP (optional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {groupSuggestions.map((g) => {
                  const selected = group.trim().toLowerCase() === g.toLowerCase();
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroup(selected ? '' : g)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: selected ? '1px solid #2C3A2E' : '1px solid rgba(212,207,198,0.7)',
                        background: selected ? 'rgba(44,58,46,0.10)' : '#FFFFFF',
                        color: selected ? '#2C3A2E' : '#6B6560',
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: 12,
                        fontWeight: selected ? 600 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              <Input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Or type a custom group name…"
              />
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', margin: '6px 0 0' }}>
                Optional — same group on a side sits together at the same or neighboring tables.
              </p>
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 5 }}>
              INVITE LINK
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', flex: 1, wordBreak: 'break-all' }}>{link}</span>
              <button onClick={onCopyLink} style={{
                background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 6,
                padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-montserrat)',
                fontSize: 11, color: '#6B6560', whiteSpace: 'nowrap',
              }}>Copy</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 5 }}>
              QR CODE
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)', borderRadius: 8, padding: 12 }}>
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR" style={{ width: 96, height: 96, borderRadius: 4, background: '#FFF' }} />
              ) : (
                <div style={{ width: 96, height: 96, background: '#F0EBE3', borderRadius: 4 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', margin: '0 0 8px' }}>
                  Print on physical invites or share in person.
                </p>
                <button onClick={downloadQr} disabled={!qrUrl} style={{
                  background: 'none', border: '1px solid rgba(212,207,198,0.7)', borderRadius: 6,
                  padding: '6px 12px', cursor: qrUrl ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#6B6560',
                }}>Download PNG</button>
              </div>
            </div>
          </div>

          {invite.rsvps.length > 0 && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: '#6B6560', marginBottom: 8 }}>
                RESPONSES
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...attending, ...declining].map((rsvp) => (
                  <div key={rsvp.id} style={{ background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: rsvp.attending ? '#2C3A2E' : '#9E9890' }}>{rsvp.attending ? '✓' : '✕'}</span>
                      <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, fontWeight: 500, color: '#2C2C2C' }}>{rsvp.person_name}</span>
                    </div>
                    {rsvp.meal_preference && (
                      <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#6B6560', marginLeft: 20, marginTop: 4 }}>
                        Meal: <span style={{ textTransform: 'capitalize' }}>{rsvp.meal_preference}</span>
                      </div>
                    )}
                    {rsvp.dietary_notes && (
                      <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: '#9E9890', fontStyle: 'italic', marginLeft: 20, marginTop: 2 }}>
                        &quot;{rsvp.dietary_notes}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(212,207,198,0.5)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <button onClick={onDelete} style={{
            fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
            color: '#C4564A', background: 'none', border: 'none', cursor: 'pointer',
          }}>Delete</button>
          <Button size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </>
  );
}

// ── Meal Options Panel ────────────────────────────────────────────────────────

function MealOptionsPanel({ weddingId, initialMealOptions, initialMealEnabled }: { weddingId: string; initialMealOptions: string[]; initialMealEnabled: boolean }) {
  const [options, setOptions] = useState<string[]>(initialMealOptions);
  const [enabled, setEnabled] = useState(initialMealEnabled);
  const [newOption, setNewOption] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const hasChanges = JSON.stringify(options) !== JSON.stringify(initialMealOptions) || enabled !== initialMealEnabled;

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions((prev) => [...prev, trimmed]);
    setNewOption('');
  }

  function removeOption(idx: number) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    const { data: wedding } = await supabase
      .from('weddings')
      .select('settings')
      .eq('id', weddingId)
      .single();
    const currentSettings = (wedding?.settings as Record<string, unknown>) ?? {};
    const { error } = await supabase
      .from('weddings')
      .update({
        meal_options: options,
        settings: { ...currentSettings, meal_selection_enabled: enabled },
      })
      .eq('id', weddingId);
    setSaving(false);
    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{
        fontFamily: 'var(--font-yeseva)', fontStyle: 'italic',
        fontSize: 36, color: '#2C2C2C', margin: '0 0 24px', lineHeight: 1,
      }}>
        Meal options
      </h1>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 12,
        background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)', marginBottom: 20,
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 600, color: '#2C2C2C', margin: 0 }}>
            Meal selection
          </p>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#9E9890', margin: '4px 0 0', lineHeight: 1.4 }}>
            {enabled ? 'Guests choose a meal when they RSVP' : 'Disabled — great for buffet-style receptions'}
          </p>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          style={{
            position: 'relative', width: 44, height: 24, borderRadius: 12, border: 'none',
            background: enabled ? '#2C3A2E' : 'rgba(212,207,198,0.7)',
            cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 2, left: enabled ? 22 : 2,
            width: 20, height: 20, borderRadius: 10, background: '#FFF',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </button>
      </div>

      <p style={{
        fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#6B6560',
        margin: '0 0 20px', lineHeight: 1.5, opacity: enabled ? 1 : 0.5,
      }}>
        Define the meal choices guests can pick from when they RSVP.
      </p>

      <div style={{ opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10,
              background: '#FFFFFF', border: '1px solid rgba(212,207,198,0.5)',
            }}>
              <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 14, fontWeight: 500, color: '#2C2C2C', flex: 1 }}>
                {opt}
              </span>
              <button
                onClick={() => removeOption(i)}
                title="Remove option"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-montserrat)', fontSize: 16, color: '#9E9890', padding: '0 4px', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
          ))}
          {options.length === 0 && (
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#9E9890', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '20px 0' }}>
              No meal options yet
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addOption(); }}
            placeholder="Add a meal option…"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1px solid rgba(212,207,198,0.7)', background: '#FFFFFF',
              fontFamily: 'var(--font-montserrat)', fontSize: 13, color: '#2C2C2C',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <Button onClick={addOption} disabled={!newOption.trim()}>Add</Button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        {saved && (
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#2C3A2E' }}>
            Saved
          </span>
        )}
        {hasChanges && !saved && (
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: '#9E9890' }}>
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(212,207,198,0.7)',
  background: '#FFFFFF', color: '#2C2C2C', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  fontFamily: 'var(--font-montserrat)',
};
