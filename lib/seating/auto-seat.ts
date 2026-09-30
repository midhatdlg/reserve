export type GuestSide = 'bride' | 'groom';

export type AutoSeatItem = {
  id: string;
  seats: number;
  tableNumber: number | null;
  /** Optional social group (Family, Friends, High school…). */
  groupName: string | null;
  /** Wedding-party side — bride or groom. */
  side: GuestSide | null;
};

export type VenueSectionPlan = {
  /** 1-indexed inclusive table range for Bride section (empty if none). */
  brideTables: number[];
  /** 1-indexed inclusive table range for Groom section (empty if none). */
  groomTables: number[];
};

export type AutoSeatResult = {
  /** New assignments for previously unseated items only. */
  assignments: Map<string, number>;
  seatedCount: number;
  seatedSeats: number;
  groupsSplit: number;
  unplacedIds: string[];
  /** Venue split used for this run. */
  sections: VenueSectionPlan;
};

type Affinity = 'family' | 'friends' | 'other';
type SideZone = GuestSide | 'unset';

type Cluster = {
  key: string;
  side: SideZone;
  affinity: Affinity;
  items: AutoSeatItem[];
  seats: number;
};

const FAMILY_KEYWORDS = [
  'family',
  'parent',
  'relative',
  'cousin',
  'aunt',
  'uncle',
  'sibling',
];

const FRIENDS_KEYWORDS = [
  'friend',
  'high school',
  'highschool',
  'college',
  'school',
  'work',
  'neighbor',
  'colleague',
  'coworker',
  'uni',
  'university',
];

export type AutoSeatOptions = {
  /**
   * Groups listed in the same set may share tables (merged while packing).
   * Scoped by Bride/Groom section — never crosses the aisle.
   */
  togetherSets?: string[][];
};

/**
 * Split the venue into a Bride section and a Groom section (contiguous table blocks).
 * Table counts follow seat demand so each side gets enough room when possible.
 */
export function planVenueSections(
  items: AutoSeatItem[],
  tableCount: number,
  tableCapacity: number,
): VenueSectionPlan {
  const empty: VenueSectionPlan = { brideTables: [], groomTables: [] };
  if (tableCount < 1 || tableCapacity < 1) return empty;

  let brideSeats = 0;
  let groomSeats = 0;
  for (const item of items) {
    if (item.side === 'bride') brideSeats += item.seats;
    else if (item.side === 'groom') groomSeats += item.seats;
  }

  if (brideSeats === 0 && groomSeats === 0) {
    // Default 50/50 so the layout still reads as two sides of the room.
    const brideCount = Math.ceil(tableCount / 2);
    return {
      brideTables: rangeTables(1, brideCount),
      groomTables: rangeTables(brideCount + 1, tableCount),
    };
  }
  if (brideSeats === 0) {
    return { brideTables: [], groomTables: rangeTables(1, tableCount) };
  }
  if (groomSeats === 0) {
    return { brideTables: rangeTables(1, tableCount), groomTables: [] };
  }

  const brideMin = Math.max(1, Math.ceil(brideSeats / tableCapacity));
  const groomMin = Math.max(1, Math.ceil(groomSeats / tableCapacity));
  const totalMin = brideMin + groomMin;

  let brideCount: number;
  let groomCount: number;

  if (totalMin <= tableCount) {
    const surplus = tableCount - totalMin;
    const brideShare = brideSeats / (brideSeats + groomSeats);
    const extraBride = Math.round(surplus * brideShare);
    brideCount = brideMin + extraBride;
    groomCount = tableCount - brideCount;
    // Keep at least the minimum for each side.
    if (groomCount < groomMin) {
      groomCount = groomMin;
      brideCount = tableCount - groomCount;
    }
    if (brideCount < brideMin) {
      brideCount = brideMin;
      groomCount = tableCount - brideCount;
    }
  } else {
    // Not enough tables for ideal mins — split proportionally by seats.
    const brideShare = brideSeats / (brideSeats + groomSeats);
    brideCount = Math.max(1, Math.min(tableCount - 1, Math.round(tableCount * brideShare)));
    groomCount = tableCount - brideCount;
  }

  return {
    brideTables: rangeTables(1, brideCount),
    groomTables: rangeTables(brideCount + 1, tableCount),
  };
}

/**
 * Pack unseated guests into Bride and Groom venue sections.
 * Within each section, groups sit together (neighboring tables if needed);
 * optional togetherSets let selected groups share tables — still never across the aisle.
 */
export function autoSeatByGroup(
  items: AutoSeatItem[],
  tableCount: number,
  tableCapacity: number,
  options: AutoSeatOptions = {},
): AutoSeatResult {
  const assignments = new Map<string, number>();
  const unplacedIds: string[] = [];
  const sections = planVenueSections(items, tableCount, tableCapacity);

  if (tableCount < 1 || tableCapacity < 1) {
    return {
      assignments,
      seatedCount: 0,
      seatedSeats: 0,
      groupsSplit: 0,
      unplacedIds: items.filter((i) => i.tableNumber == null).map((i) => i.id),
      sections,
    };
  }

  const remaining = Array.from({ length: tableCount }, () => tableCapacity);
  for (const item of items) {
    if (item.tableNumber != null && item.tableNumber >= 1 && item.tableNumber <= tableCount) {
      remaining[item.tableNumber - 1] = Math.max(0, remaining[item.tableNumber - 1] - item.seats);
    }
  }

  const togetherLookup = buildTogetherLookup(options.togetherSets ?? []);
  const clusters = new Map<string, Cluster>();
  const leftovers: AutoSeatItem[] = [];

  for (const item of items) {
    if (item.tableNumber != null) continue;

    const side: SideZone = item.side === 'bride' || item.side === 'groom' ? item.side : 'unset';
    const groupLabel = item.groupName?.trim() ?? '';

    if (side === 'unset') {
      leftovers.push(item);
      continue;
    }

    const togetherId = groupLabel ? togetherLookup.get(groupLabel.toLowerCase()) : undefined;
    const key = togetherId != null
      ? `${side}::set:${togetherId}`
      : `${side}::${groupLabel || '__solo'}`;
    const existing = clusters.get(key);
    if (existing) {
      existing.items.push(item);
      existing.seats += item.seats;
    } else {
      clusters.set(key, {
        key,
        side,
        affinity: groupLabel ? affinityFor(groupLabel) : 'other',
        items: [item],
        seats: item.seats,
      });
    }
  }

  let groupsSplit = 0;

  const brideClusters = orderClusters(
    [...clusters.values()].filter((c) => c.side === 'bride'),
  );
  const groomClusters = orderClusters(
    [...clusters.values()].filter((c) => c.side === 'groom'),
  );

  groupsSplit += packClustersInSection(
    brideClusters,
    remaining,
    toZeroBased(sections.brideTables),
    tableCapacity,
    assignments,
    unplacedIds,
  );
  groupsSplit += packClustersInSection(
    groomClusters,
    remaining,
    toZeroBased(sections.groomTables),
    tableCapacity,
    assignments,
    unplacedIds,
  );

  // Untagged guests fill leftover seats anywhere in the venue.
  for (const item of leftovers) {
    let idx = findBestFitIn(remaining, allIndices(tableCount), item.seats);
    if (idx < 0) idx = findMostSpaceIn(remaining, allIndices(tableCount));
    if (idx < 0 || remaining[idx] <= 0) {
      unplacedIds.push(item.id);
      continue;
    }
    assignments.set(item.id, idx + 1);
    remaining[idx] = Math.max(0, remaining[idx] - item.seats);
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
    sections,
  };
}

/** Which section a 1-indexed table belongs to under the current plan. */
export function sectionForTable(
  tableNumber: number,
  sections: VenueSectionPlan,
): GuestSide | null {
  if (sections.brideTables.includes(tableNumber)) return 'bride';
  if (sections.groomTables.includes(tableNumber)) return 'groom';
  return null;
}

/** Exported for tests / UI hints. */
export function affinityFor(groupName: string): Affinity {
  const g = groupName.trim().toLowerCase();
  if (!g) return 'other';
  if (FAMILY_KEYWORDS.some((k) => g.includes(k))) return 'family';
  if (FRIENDS_KEYWORDS.some((k) => g.includes(k))) return 'friends';
  return 'other';
}

/** Map lowercase group label → together-set id (union of overlapping sets). */
export function buildTogetherLookup(togetherSets: string[][]): Map<string, number> {
  const parent = new Map<string, string>();

  function find(x: string): string {
    const p = parent.get(x) ?? x;
    if (p !== x) {
      const root = find(p);
      parent.set(x, root);
      return root;
    }
    return x;
  }

  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const set of togetherSets) {
    const labels = set
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);
    if (labels.length < 2) continue;
    for (const label of labels) {
      if (!parent.has(label)) parent.set(label, label);
    }
    for (let i = 1; i < labels.length; i++) union(labels[0], labels[i]);
  }

  const rootToId = new Map<string, number>();
  const lookup = new Map<string, number>();
  let nextId = 0;
  for (const label of parent.keys()) {
    const root = find(label);
    if (!rootToId.has(root)) rootToId.set(root, nextId++);
    lookup.set(label, rootToId.get(root)!);
  }
  return lookup;
}

export function parseGuestSide(raw: string | null | undefined): GuestSide | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'b' || s.startsWith('bride')) return 'bride';
  if (s === 'g' || s.startsWith('groom')) return 'groom';
  return null;
}

function orderClusters(sideClusters: Cluster[]): Cluster[] {
  const byAffinity: Record<Affinity, Cluster[]> = { family: [], friends: [], other: [] };
  for (const c of sideClusters) byAffinity[c.affinity].push(c);
  for (const list of Object.values(byAffinity)) {
    list.sort((a, b) => {
      if (b.seats !== a.seats) return b.seats - a.seats;
      return a.key.localeCompare(b.key);
    });
  }
  return [...byAffinity.family, ...byAffinity.friends, ...byAffinity.other];
}

function packClustersInSection(
  clusters: Cluster[],
  remaining: number[],
  sectionIdx: number[],
  tableCapacity: number,
  assignments: Map<string, number>,
  unplacedIds: string[],
): number {
  if (sectionIdx.length === 0) {
    for (const cluster of clusters) {
      for (const item of cluster.items) unplacedIds.push(item.id);
    }
    return 0;
  }

  let groupsSplit = 0;
  let cursorPos = 0; // index into sectionIdx

  for (const cluster of clusters) {
    const startPos = findContiguousStartInSection(
      remaining,
      sectionIdx,
      cursorPos,
      cluster.seats,
      tableCapacity,
    );
    if (startPos < 0) {
      for (const item of cluster.items) unplacedIds.push(item.id);
      continue;
    }

    const tablesUsed = packClusterIntoSection(
      cluster,
      remaining,
      sectionIdx,
      startPos,
      assignments,
      unplacedIds,
    );
    if (tablesUsed > 1) groupsSplit += 1;
    cursorPos = advanceSectionCursor(remaining, sectionIdx, startPos, tableCapacity);
  }

  return groupsSplit;
}

function findContiguousStartInSection(
  remaining: number[],
  sectionIdx: number[],
  fromPos: number,
  seats: number,
  tableCapacity: number,
): number {
  if (seats <= 0) return fromPos < sectionIdx.length ? fromPos : -1;

  const search = (origin: number): number => {
    for (let pos = origin; pos < sectionIdx.length; pos++) {
      if (remaining[sectionIdx[pos]] >= seats) return pos;
    }
    for (let start = origin; start < sectionIdx.length; start++) {
      const table = sectionIdx[start];
      if (remaining[table] !== tableCapacity) continue;
      let need = seats;
      let pos = start;
      while (pos < sectionIdx.length && need > 0) {
        if (remaining[sectionIdx[pos]] <= 0) break;
        need -= remaining[sectionIdx[pos]];
        pos += 1;
      }
      if (need <= 0) return start;
    }
    return -1;
  };

  const hit = search(fromPos);
  if (hit >= 0) return hit;
  if (fromPos > 0) return search(0);
  return -1;
}

function advanceSectionCursor(
  remaining: number[],
  sectionIdx: number[],
  fromPos: number,
  tableCapacity: number,
): number {
  let pos = fromPos;
  while (pos < sectionIdx.length && remaining[sectionIdx[pos]] !== tableCapacity) pos += 1;
  return pos;
}

function packClusterIntoSection(
  cluster: Cluster,
  remaining: number[],
  sectionIdx: number[],
  startPos: number,
  assignments: Map<string, number>,
  unplacedIds: string[],
): number {
  const tablesUsed = new Set<number>();
  let pos = startPos;
  const items = [...cluster.items].sort((a, b) => b.seats - a.seats || a.id.localeCompare(b.id));

  for (const item of items) {
    while (pos < sectionIdx.length && remaining[sectionIdx[pos]] <= 0) pos += 1;

    let place = pos;
    while (place < sectionIdx.length && remaining[sectionIdx[place]] < item.seats) {
      if (remaining[sectionIdx[place]] <= 0) break;
      place += 1;
    }

    if (place >= sectionIdx.length || remaining[sectionIdx[place]] < item.seats) {
      unplacedIds.push(item.id);
      continue;
    }

    const tableIdx = sectionIdx[place];
    assignments.set(item.id, tableIdx + 1);
    remaining[tableIdx] = Math.max(0, remaining[tableIdx] - item.seats);
    tablesUsed.add(tableIdx);
    pos = place;
    if (remaining[tableIdx] <= 0) pos += 1;
  }

  return tablesUsed.size;
}

function findBestFitIn(remaining: number[], allowed: number[], seats: number): number {
  let best = -1;
  let bestLeft = Infinity;
  for (const i of allowed) {
    if (remaining[i] >= seats && remaining[i] < bestLeft) {
      best = i;
      bestLeft = remaining[i];
    }
  }
  return best;
}

function findMostSpaceIn(remaining: number[], allowed: number[]): number {
  let best = -1;
  let bestLeft = 0;
  for (const i of allowed) {
    if (remaining[i] > bestLeft) {
      best = i;
      bestLeft = remaining[i];
    }
  }
  return bestLeft > 0 ? best : -1;
}

function rangeTables(from: number, to: number): number[] {
  if (to < from) return [];
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function toZeroBased(tables: number[]): number[] {
  return tables.map((t) => t - 1);
}

function allIndices(tableCount: number): number[] {
  return Array.from({ length: tableCount }, (_, i) => i);
}
