'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Invite {
  id: string;
  guest_name: string;
  max_guests: number;
  table_number: number | null;
  table_name: string | null;
  status: string;
}

interface RsvpPerson {
  id: string;
  invite_id: string;
  person_name: string;
  attending: boolean;
  table_number: number | null;
  table_name: string | null;
}

// A unified "seat" that can be dragged — either an individual RSVP person or an un-RSVPd invite group
type SeatItem = {
  kind: 'person';
  id: string;           // rsvp.id
  inviteId: string;
  name: string;
  seats: 1;
  tableNumber: number | null;
} | {
  kind: 'invite';
  id: string;           // invite.id
  inviteId: string;
  name: string;
  seats: number;
  tableNumber: number | null;
};

interface Props {
  weddingId: string;
  initialInvites: Invite[];
  initialRsvps?: RsvpPerson[];
}

export function SeatingChart({ weddingId, initialInvites, initialRsvps = [] }: Props) {
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [rsvps, setRsvps] = useState<RsvpPerson[]>(initialRsvps);
  const [tableCount, setTableCount] = useState(() => {
    const maxFromInvites = Math.max(0, ...initialInvites.map((i) => i.table_number ?? 0));
    const maxFromRsvps = Math.max(0, ...initialRsvps.map((r) => r.table_number ?? 0));
    return Math.max(maxFromInvites, maxFromRsvps, 1);
  });
  const [tableCapacity, setTableCapacity] = useState(8);
  const [tableNames, setTableNames] = useState<Record<number, string>>(() => {
    const names: Record<number, string> = {};
    initialInvites.forEach((i) => {
      if (i.table_number && i.table_name) names[i.table_number] = i.table_name;
    });
    initialRsvps.forEach((r) => {
      if (r.table_number && r.table_name) names[r.table_number] = r.table_name;
    });
    return names;
  });
  const [dragOver, setDragOver] = useState<number | 'unassigned' | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null); // SeatItem.id
  const dragItemId = useRef<string | null>(null);
  const supabase = createClient();

  // Build the unified seat list
  const rsvpsByInvite: Record<string, RsvpPerson[]> = {};
  for (const r of rsvps) {
    (rsvpsByInvite[r.invite_id] ??= []).push(r);
  }

  const seatItems: SeatItem[] = [];
  for (const inv of invites) {
    const invRsvps = rsvpsByInvite[inv.id];
    const attending = invRsvps?.filter((r) => r.attending) ?? [];
    if (attending.length > 0) {
      // Individual person chips
      for (const r of attending) {
        seatItems.push({
          kind: 'person',
          id: r.id,
          inviteId: inv.id,
          name: r.person_name,
          seats: 1,
          tableNumber: r.table_number,
        });
      }
    } else {
      // No RSVPs yet — show as grouped invite chip
      seatItems.push({
        kind: 'invite',
        id: inv.id,
        inviteId: inv.id,
        name: inv.guest_name,
        seats: inv.max_guests,
        tableNumber: inv.table_number,
      });
    }
  }

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
  const unassigned = seatItems.filter((s) => s.tableNumber == null);

  function itemsAtTable(n: number) {
    return seatItems.filter((s) => s.tableNumber === n);
  }

  function seatsAtTable(n: number) {
    return itemsAtTable(n).reduce((sum, s) => sum + s.seats, 0);
  }

  async function assignSeat(itemId: string, tableNum: number | null) {
    const item = seatItems.find((s) => s.id === itemId);
    if (!item) return;

    if (item.kind === 'person') {
      setRsvps((prev) =>
        prev.map((r) => r.id === itemId ? { ...r, table_number: tableNum } : r)
      );
      await supabase.from('rsvps').update({ table_number: tableNum }).eq('id', itemId);
    } else {
      setInvites((prev) =>
        prev.map((inv) => inv.id === itemId ? { ...inv, table_number: tableNum } : inv)
      );
      await supabase.from('invites').update({ table_number: tableNum }).eq('id', itemId);
    }
  }

  async function updateTableName(tableNum: number, name: string) {
    setTableNames((prev) => ({ ...prev, [tableNum]: name }));
    // Update table_name on all items at this table
    const items = itemsAtTable(tableNum);
    await Promise.all(items.map((item) => {
      if (item.kind === 'person') {
        return supabase.from('rsvps').update({ table_name: name || null }).eq('id', item.id);
      }
      return supabase.from('invites').update({ table_name: name || null }).eq('id', item.id);
    }));
  }

  // Drag (desktop)
  function handleDragStart(itemId: string) {
    dragItemId.current = itemId;
  }

  function handleDrop(target: number | 'unassigned') {
    if (!dragItemId.current) return;
    assignSeat(dragItemId.current, target === 'unassigned' ? null : target);
    dragItemId.current = null;
    setDragOver(null);
  }

  // Tap (mobile)
  function handleTap(itemId: string) {
    setSelectedItem((prev) => (prev === itemId ? null : itemId));
  }

  function handleTapTarget(target: number | 'unassigned') {
    if (!selectedItem) return;
    assignSeat(selectedItem, target === 'unassigned' ? null : target);
    setSelectedItem(null);
  }

  const totalSeated = seatItems.filter((s) => s.tableNumber != null).reduce((sum, s) => sum + s.seats, 0);
  const totalSeats = seatItems.reduce((sum, s) => sum + s.seats, 0);
  const seatedPercent = totalSeats > 0 ? Math.round((totalSeated / totalSeats) * 100) : 0;
  const allSeated = totalSeats > 0 && totalSeated === totalSeats;

  const selectedName = selectedItem
    ? seatItems.find((s) => s.id === selectedItem)?.name
    : null;

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {[
          { label: 'Tables', value: tableCount },
          { label: 'Seated', value: totalSeated },
          { label: 'Unseated', value: totalSeats - totalSeated },
          { label: 'Total Guests', value: totalSeats },
        ].map(({ label, value }) => (
          <div key={label} style={{
            flex: 1, minWidth: 90, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 22, fontWeight: 600, color: 'var(--sage)' }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.5px' }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            SEATING PROGRESS
          </span>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: allSeated ? 'var(--sage)' : 'var(--text-secondary)', fontWeight: 600 }}>
            {allSeated ? '✓ All guests seated!' : `${totalSeated} / ${totalSeats} guests`}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{
            height: '100%',
            width: `${seatedPercent}%`,
            background: allSeated ? 'var(--sage)' : 'linear-gradient(90deg, var(--sage), #a8c5a0)',
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>TABLES</span>
          <button onClick={() => setTableCount((n) => Math.max(1, n - 1))} style={stepBtn}>−</button>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{tableCount}</span>
          <button onClick={() => setTableCount((n) => n + 1)} style={stepBtn}>+</button>
        </div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>SEATS PER TABLE</span>
          <button onClick={() => setTableCapacity((n) => Math.max(1, n - 1))} style={stepBtn}>−</button>
          <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 15, fontWeight: 600, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{tableCapacity}</span>
          <button onClick={() => setTableCapacity((n) => n + 1)} style={stepBtn}>+</button>
        </div>
        <div style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--text-tertiary)' }}>
          {tableCount * tableCapacity} total venue seats
        </div>
      </div>

      {/* Tap-to-assign hint */}
      {selectedName && (
        <div style={{
          background: 'var(--sage-dim)', border: '1px solid var(--sage)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)', fontWeight: 600,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Tap a table to assign {selectedName}</span>
          <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16 }}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }} className="seating-grid">

        {/* Unassigned guests */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver('unassigned'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => handleDrop('unassigned')}
          onClick={() => handleTapTarget('unassigned')}
          style={{
            background: dragOver === 'unassigned' ? 'var(--sage-dim)' : 'var(--surface)',
            border: `2px ${dragOver === 'unassigned' ? 'dashed var(--sage)' : 'solid var(--border)'}`,
            borderRadius: 12, padding: '14px', minHeight: 120,
            transition: 'all 0.15s', position: 'sticky', top: 80,
          }}
        >
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Unseated ({unassigned.reduce((s, item) => s + item.seats, 0)})
          </p>
          {unassigned.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 12, color: 'var(--sage)', textAlign: 'center', margin: '16px 0' }}>
              All guests seated!
            </p>
          ) : unassigned.map((item) => (
            <SeatChip key={item.id} item={item} onDragStart={handleDragStart} onTap={handleTap} isSelected={selectedItem === item.id} />
          ))}
        </div>

        {/* Tables grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {tables.map((tableNum) => {
            const items = itemsAtTable(tableNum);
            const seatCount = seatsAtTable(tableNum);
            const available = tableCapacity - seatCount;
            const isFull = seatCount >= tableCapacity;
            const isNearFull = !isFull && available <= 2;
            const isOver = dragOver === tableNum;
            const capacityColor = isFull ? '#C62828' : isNearFull ? '#B8860B' : 'var(--sage)';

            return (
              <div
                key={tableNum}
                onDragOver={(e) => { e.preventDefault(); setDragOver(tableNum); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(tableNum)}
                onClick={() => handleTapTarget(tableNum)}
                style={{
                  background: isOver ? 'var(--sage-dim)' : 'var(--surface)',
                  border: `2px ${isOver ? 'dashed var(--sage)' : selectedItem ? 'dashed var(--border)' : 'solid var(--border)'}`,
                  borderRadius: 12, padding: '14px', minHeight: 120,
                  transition: 'all 0.15s',
                  cursor: selectedItem ? 'pointer' : 'default',
                }}
              >
                {/* Table header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--sage-dim)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-montserrat)', fontSize: 11, fontWeight: 600, color: 'var(--sage)',
                  }}>
                    {tableNum}
                  </div>
                  <input
                    type="text"
                    value={tableNames[tableNum] ?? ''}
                    onChange={(e) => setTableNames((prev) => ({ ...prev, [tableNum]: e.target.value }))}
                    onBlur={(e) => updateTableName(tableNum, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Table ${tableNum}`}
                    style={{
                      flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'var(--font-montserrat)', fontSize: 12, fontWeight: 600,
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {/* Capacity bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: capacityColor, fontWeight: 600 }}>
                      {seatCount}/{tableCapacity} seats
                    </span>
                    <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: isFull ? '#C62828' : 'var(--text-tertiary)' }}>
                      {isFull ? 'Full' : `${available} left`}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface-alt)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (seatCount / tableCapacity) * 100)}%`,
                      background: capacityColor,
                      borderRadius: 99,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* Guests at this table */}
                {items.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', margin: '12px 0', fontStyle: 'italic' }}>
                    {selectedItem ? 'Tap to seat here' : 'Drop guests here'}
                  </p>
                ) : items.map((item) => (
                  <SeatChip key={item.id} item={item} onDragStart={handleDragStart} onTap={handleTap} isSelected={selectedItem === item.id} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeatChip({ item, onDragStart, onTap, isSelected }: {
  item: SeatItem;
  onDragStart: (id: string) => void;
  onTap: (id: string) => void;
  isSelected: boolean;
}) {
  const isPerson = item.kind === 'person';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onClick={(e) => { e.stopPropagation(); onTap(item.id); }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 10px', marginBottom: 6, borderRadius: 8,
        background: isSelected ? 'var(--sage-dim)' : 'var(--bg)',
        border: `1px solid ${isSelected ? 'var(--sage)' : 'var(--border)'}`,
        cursor: 'grab', userSelect: 'none',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {isPerson && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: 'var(--sage)', opacity: 0.6,
          }} />
        )}
        <span style={{
          fontFamily: 'var(--font-montserrat)', fontSize: 12,
          color: isSelected ? 'var(--sage)' : 'var(--text)',
          fontWeight: isSelected ? 600 : 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.name}
        </span>
      </div>
      <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 6, flexShrink: 0 }}>
        {isPerson ? '' : `×${item.seats}`}
      </span>
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
  background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 16, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  fontFamily: 'var(--font-montserrat)',
};
