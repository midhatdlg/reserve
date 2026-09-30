import { describe, it, expect } from 'vitest';
import {
  affinityFor,
  autoSeatByGroup,
  parseGuestSide,
  planVenueSections,
  sectionForTable,
  type AutoSeatItem,
} from './auto-seat';

function item(partial: Partial<AutoSeatItem> & { id: string }): AutoSeatItem {
  return {
    seats: 1,
    tableNumber: null,
    groupName: null,
    side: null,
    ...partial,
  };
}

function tablesFor(result: ReturnType<typeof autoSeatByGroup>, ids: string[]): number[] {
  return ids.map((id) => result.assignments.get(id)!).sort((a, b) => a - b);
}

function isContiguous(tables: number[]): boolean {
  if (tables.length <= 1) return true;
  const unique = [...new Set(tables)].sort((a, b) => a - b);
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] !== unique[i - 1] + 1) return false;
  }
  return true;
}

describe('parseGuestSide', () => {
  it('parses bride and groom labels', () => {
    expect(parseGuestSide('Bride')).toBe('bride');
    expect(parseGuestSide('bride side')).toBe('bride');
    expect(parseGuestSide('Groom')).toBe('groom');
    expect(parseGuestSide('G')).toBe('groom');
    expect(parseGuestSide('Family')).toBeNull();
  });
});

describe('affinityFor', () => {
  it('classifies social groups', () => {
    expect(affinityFor('Family')).toBe('family');
    expect(affinityFor('Friends')).toBe('friends');
    expect(affinityFor('High school')).toBe('friends');
    expect(affinityFor('Book club')).toBe('other');
  });
});

describe('planVenueSections', () => {
  it('splits the room into contiguous bride then groom sections by demand', () => {
    const items = [
      item({ id: 'b1', side: 'bride', seats: 16 }),
      item({ id: 'g1', side: 'groom', seats: 16 }),
    ];
    const plan = planVenueSections(items, 4, 8);
    expect(plan.brideTables).toEqual([1, 2]);
    expect(plan.groomTables).toEqual([3, 4]);
    expect(sectionForTable(1, plan)).toBe('bride');
    expect(sectionForTable(4, plan)).toBe('groom');
  });
});

describe('autoSeatByGroup', () => {
  it('leaves already-seated guests alone', () => {
    const items = [
      item({ id: 'a', side: 'bride', groupName: 'Family', tableNumber: 1, seats: 2 }),
      item({ id: 'b', side: 'bride', groupName: 'Family', seats: 2 }),
    ];
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.assignments.has('a')).toBe(false);
    expect(result.assignments.get('b')).toBe(1);
  });

  it('keeps same side + group on one table when capacity allows', () => {
    const items = [
      item({ id: 'a', side: 'bride', groupName: 'College', seats: 2 }),
      item({ id: 'b', side: 'bride', groupName: 'College', seats: 2 }),
      item({ id: 'c', side: 'bride', groupName: 'Work', seats: 5 }),
    ];
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.assignments.get('a')).toBe(result.assignments.get('b'));
    expect(result.assignments.get('c')).not.toBe(result.assignments.get('a'));
  });

  it('keeps bride and groom in their own venue sections', () => {
    const items = [
      item({ id: 'g1', side: 'groom', groupName: 'Friends', seats: 4 }),
      item({ id: 'g2', side: 'groom', groupName: 'Friends', seats: 4 }),
      item({ id: 'b1', side: 'bride', groupName: 'Family', seats: 4 }),
      item({ id: 'b2', side: 'bride', groupName: 'Family', seats: 4 }),
    ];
    const result = autoSeatByGroup(items, 4, 8);
    const bride = tablesFor(result, ['b1', 'b2']);
    const groom = tablesFor(result, ['g1', 'g2']);
    expect(Math.max(...bride)).toBeLessThan(Math.min(...groom));
    for (const t of bride) expect(result.sections.brideTables).toContain(t);
    for (const t of groom) expect(result.sections.groomTables).toContain(t);
  });

  it('keeps bride and groom family as separate contiguous blocks', () => {
    const items = [
      item({ id: 'bf1', side: 'bride', groupName: 'Family', seats: 4 }),
      item({ id: 'bf2', side: 'bride', groupName: 'Family', seats: 4 }),
      item({ id: 'gf1', side: 'groom', groupName: 'Family', seats: 4 }),
      item({ id: 'gf2', side: 'groom', groupName: 'Family', seats: 4 }),
    ];
    const result = autoSeatByGroup(items, 4, 8);
    expect(isContiguous(tablesFor(result, ['bf1', 'bf2']))).toBe(true);
    expect(isContiguous(tablesFor(result, ['gf1', 'gf2']))).toBe(true);
    expect(result.assignments.get('bf1')).not.toBe(result.assignments.get('gf1'));
  });

  it('splits a large group across neighboring tables only within its section', () => {
    const items = [
      item({ id: 'a', side: 'bride', groupName: 'Big', seats: 4 }),
      item({ id: 'b', side: 'bride', groupName: 'Big', seats: 4 }),
      item({ id: 'c', side: 'bride', groupName: 'Big', seats: 4 }),
    ];
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.groupsSplit).toBe(1);
    expect(isContiguous(tablesFor(result, ['a', 'b', 'c']))).toBe(true);
  });

  it('returns unplaced when venue is full', () => {
    const items = [
      item({ id: 'a', side: 'bride', groupName: 'A', seats: 8, tableNumber: 1 }),
      item({ id: 'b', side: 'groom', groupName: 'B', seats: 2 }),
    ];
    const result = autoSeatByGroup(items, 1, 8);
    expect(result.assignments.size).toBe(0);
    expect(result.unplacedIds).toEqual(['b']);
  });

  it('lets together-sets share a table within the same side', () => {
    const items = [
      item({ id: 'f1', side: 'bride', groupName: 'Friends', seats: 3 }),
      item({ id: 'h1', side: 'bride', groupName: 'High school', seats: 3 }),
    ];
    const apart = autoSeatByGroup(items, 2, 8);
    expect(apart.assignments.get('f1')).not.toBe(apart.assignments.get('h1'));

    const together = autoSeatByGroup(items, 2, 8, {
      togetherSets: [['Friends', 'High school']],
    });
    expect(together.assignments.get('f1')).toBe(together.assignments.get('h1'));
  });

  it('does not let together-sets cross the bride/groom aisle', () => {
    const items = [
      item({ id: 'bf', side: 'bride', groupName: 'Friends', seats: 3 }),
      item({ id: 'gf', side: 'groom', groupName: 'Friends', seats: 3 }),
    ];
    const result = autoSeatByGroup(items, 4, 8, {
      togetherSets: [['Friends', 'Friends']],
    });
    expect(result.assignments.get('bf')).not.toBe(result.assignments.get('gf'));
    expect(result.sections.brideTables).toContain(result.assignments.get('bf'));
    expect(result.sections.groomTables).toContain(result.assignments.get('gf'));
  });
});
