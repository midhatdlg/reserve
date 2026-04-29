'use client';

import Link from 'next/link';

interface Invite {
  id: string;
  guest_name: string;
  max_guests: number;
  status: string;
  table_number: number | null;
}

interface Props {
  invites: Invite[];
  totalInvited: number;
}

export function SeatingWidget({ invites }: Props) {
  // Count unique tables that have been assigned
  const assignedTables = new Set<number>();
  invites.forEach((i) => {
    if (i.table_number) assignedTables.add(i.table_number);
  });

  // Estimate total tables needed (assume ~8-10 per table, minimum of assigned)
  const confirmedGuests = invites.filter((i) => i.status === 'responded').reduce((sum, i) => sum + i.max_guests, 0);
  const estimatedTables = Math.max(assignedTables.size, Math.ceil(confirmedGuests / 8), 1);
  const totalTables = Math.max(estimatedTables, 20); // show at least 20 for the grid
  const displayCount = Math.min(totalTables, 20);
  const seatedCount = assignedTables.size;
  const remaining = displayCount - seatedCount;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <p style={{
        fontFamily: 'var(--font-montserrat)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '1.5px',
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        margin: '0 0 4px',
      }}>
        Seating
      </p>
      <p style={{
        fontFamily: 'var(--font-caslon)',
        fontSize: 18,
        fontStyle: 'italic',
        fontWeight: 400,
        color: 'var(--text)',
        margin: '0 0 16px',
      }}>
        {seatedCount} of {displayCount} tables seated
      </p>

      {/* Table grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        marginBottom: 16,
      }}>
        {Array.from({ length: displayCount }, (_, i) => {
          const tableNum = i + 1;
          const isSeated = assignedTables.has(tableNum);
          return (
            <div
              key={tableNum}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-caslon)',
                fontSize: 13,
                fontStyle: 'italic',
                background: isSeated ? 'var(--sage)' : 'transparent',
                color: isSeated ? '#F2F0EC' : 'var(--text-tertiary)',
                border: isSeated ? 'none' : '1px solid var(--border)',
              }}
            >
              {tableNum}
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <Link
        href="/dashboard/seating"
        style={{
          fontFamily: 'var(--font-caslon)',
          fontSize: 14,
          fontStyle: 'italic',
          color: 'var(--accent)',
          textDecoration: 'none',
        }}
      >
        {remaining > 0 ? `${remaining} tables remaining · finish seating →` : 'View seating chart →'}
      </Link>
    </div>
  );
}
