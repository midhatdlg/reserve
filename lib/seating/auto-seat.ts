export type AutoSeatItem = {
  id: string;
  seats: number;
  tableNumber: number | null;
  /** Null/blank = ungrouped; each ungrouped item packs alone. */
  groupName: string | null;
};

export type AutoSeatResult = {
  /** New assignments for previously unseated items only. */
  assignments: Map<string, number>;
  seatedCount: number;
  seatedSeats: number;
  groupsSplit: number;
  unplacedIds: string[];
};

/**
 * Pack unseated items onto tables by group, largest groups first.
 * Already-seated items are left alone. Oversized groups split across tables.
 */
export function autoSeatByGroup(
  items: AutoSeatItem[],
  tableCount: number,
  tableCapacity: number,
): AutoSeatResult {
  const assignments = new Map<string, number>();
  const unplacedIds: string[] = [];

  if (tableCount < 1 || tableCapacity < 1) {
    return {
      assignments,
      seatedCount: 0,
      seatedSeats: 0,
      groupsSplit: 0,
      unplacedIds: items.filter((i) => i.tableNumber == null).map((i) => i.id),
    };
  }

  const remaining = Array.from({ length: tableCount }, () => tableCapacity);
  for (const item of items) {
    if (item.tableNumber != null && item.tableNumber >= 1 && item.tableNumber <= tableCount) {
      remaining[item.tableNumber - 1] = Math.max(0, remaining[item.tableNumber - 1] - item.seats);
    }
  }

  type Cluster = { key: string; named: boolean; items: AutoSeatItem[]; seats: number };
  const clusters = new Map<string, Cluster>();
  let singleton = 0;

  for (const item of items) {
    if (item.tableNumber != null) continue;

    const label = item.groupName?.trim() ?? '';
    if (!label) {
      const key = `__solo_${singleton++}`;
      clusters.set(key, { key, named: false, items: [item], seats: item.seats });
      continue;
    }
    const existing = clusters.get(label);
    if (existing) {
      existing.items.push(item);
      existing.seats += item.seats;
    } else {
      clusters.set(label, { key: label, named: true, items: [item], seats: item.seats });
    }
  }

  const ordered = [...clusters.values()].sort((a, b) => {
    if (b.seats !== a.seats) return b.seats - a.seats;
    return a.key.localeCompare(b.key);
  });

  let groupsSplit = 0;

  for (const cluster of ordered) {
    const wholeIdx = findBestFit(remaining, cluster.seats);
    if (wholeIdx >= 0) {
      for (const item of cluster.items) {
        assignments.set(item.id, wholeIdx + 1);
      }
      remaining[wholeIdx] = Math.max(0, remaining[wholeIdx] - cluster.seats);
      continue;
    }

    const tablesUsed = new Set<number>();
    for (const item of cluster.items) {
      let idx = findBestFit(remaining, item.seats);
      if (idx < 0) idx = findMostSpace(remaining);
      if (idx < 0) {
        unplacedIds.push(item.id);
        continue;
      }
      assignments.set(item.id, idx + 1);
      remaining[idx] = Math.max(0, remaining[idx] - item.seats);
      tablesUsed.add(idx);
    }

    if (cluster.named && tablesUsed.size > 1) groupsSplit += 1;
  }

  let seatedSeats = 0;
  for (const id of assignments.keys()) {
    const item = items.find((i) => i.id === id);
    if (item) seatedSeats += item.seats;
  }

  return {
    assignments,
    seatedCount: assignments.size,
    seatedSeats,
    groupsSplit,
    unplacedIds,
  };
}

/** Tightest table that still fits `seats`. */
function findBestFit(remaining: number[], seats: number): number {
  let best = -1;
  let bestLeft = Infinity;
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i] >= seats && remaining[i] < bestLeft) {
      best = i;
      bestLeft = remaining[i];
    }
  }
  return best;
}

function findMostSpace(remaining: number[]): number {
  let best = -1;
  let bestLeft = 0;
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i] > bestLeft) {
      best = i;
      bestLeft = remaining[i];
    }
  }
  return bestLeft > 0 ? best : -1;
}
