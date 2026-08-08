import { describe, it, expect } from 'vitest';
import { autoSeatByGroup, type AutoSeatItem } from './auto-seat';

function item(partial: Partial<AutoSeatItem> & { id: string }): AutoSeatItem {
  return {
    seats: 1,
    tableNumber: null,
    groupName: null,
    ...partial,
  };
}

describe('autoSeatByGroup', () => {
  it('leaves already-seated guests alone', () => {
    const items = [
      item({ id: 'a', groupName: 'Family', tableNumber: 1, seats: 2 }),
      item({ id: 'b', groupName: 'Family', seats: 2 }),
    ];
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.assignments.has('a')).toBe(false);
    expect(result.assignments.get('b')).toBe(1);
  });

  it('keeps a named group on one table when capacity allows', () => {
    const items = [
      item({ id: 'a', groupName: 'College', seats: 2 }),
      item({ id: 'b', groupName: 'College', seats: 2 }),
      item({ id: 'c', groupName: 'Work', seats: 5 }),
    ];
    // College (4) is placed first on table 1; Work (5) no longer fits there → table 2
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.assignments.get('a')).toBe(result.assignments.get('b'));
    expect(result.assignments.get('c')).not.toBe(result.assignments.get('a'));
    expect(result.groupsSplit).toBe(0);
  });

  it('splits a group that cannot fit on one table', () => {
    const items = [
      item({ id: 'a', groupName: 'Big', seats: 4 }),
      item({ id: 'b', groupName: 'Big', seats: 4 }),
      item({ id: 'c', groupName: 'Big', seats: 4 }),
    ];
    const result = autoSeatByGroup(items, 2, 8);
    expect(result.seatedCount).toBe(3);
    expect(result.groupsSplit).toBe(1);
    const tables = new Set([...result.assignments.values()]);
    expect(tables.size).toBe(2);
  });

  it('packs ungrouped guests independently', () => {
    const items = [
      item({ id: 'a', seats: 2 }),
      item({ id: 'b', seats: 2 }),
    ];
    const result = autoSeatByGroup(items, 1, 8);
    expect(result.assignments.get('a')).toBe(1);
    expect(result.assignments.get('b')).toBe(1);
    expect(result.groupsSplit).toBe(0);
  });

  it('returns unplaced when venue is full', () => {
    const items = [
      item({ id: 'a', groupName: 'A', seats: 8, tableNumber: 1 }),
      item({ id: 'b', groupName: 'B', seats: 2 }),
    ];
    const result = autoSeatByGroup(items, 1, 8);
    expect(result.assignments.size).toBe(0);
    expect(result.unplacedIds).toEqual(['b']);
  });
});
