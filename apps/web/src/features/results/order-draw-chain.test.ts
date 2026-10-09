import { describe, expect, it } from 'vitest';
import { orderDrawCycles } from './order-draw-chain';

const row = (giverId: string, receiverId: string, giverName = giverId, receiverName = receiverId) => ({
  giverId,
  giverName,
  receiverId,
  receiverName,
});

describe('orderDrawCycles', () => {
  it('follows each person into the person they drew', () => {
    expect(
      orderDrawCycles([
        row('c', 'a', 'ค', 'ก'),
        row('a', 'b', 'ก', 'ข'),
        row('b', 'c', 'ข', 'ค'),
      ]).map((cycle) => cycle.map((entry) => entry.giverId)),
    ).toEqual([['a', 'b', 'c']]);
  });

  it('keeps separate loops apart when one chain cannot hold everyone', () => {
    expect(
      orderDrawCycles([
        row('d', 'c', 'ง', 'ค'),
        row('b', 'a', 'ข', 'ก'),
        row('c', 'd', 'ค', 'ง'),
        row('a', 'b', 'ก', 'ข'),
      ]).map((cycle) => cycle.map((entry) => `${entry.giverName}->${entry.receiverName}`)),
    ).toEqual([
      ['ก->ข', 'ข->ก'],
      ['ค->ง', 'ง->ค'],
    ]);
  });

  it('does not merge two people who share a display name', () => {
    expect(
      orderDrawCycles([
        row('a', 'b', 'สมชาย', 'มาลี'),
        row('b', 'c', 'มาลี', 'สมชาย'),
        row('c', 'a', 'สมชาย', 'สมชาย'),
      ]).map((cycle) => cycle.map((entry) => entry.giverId)),
    ).toEqual([['b', 'c', 'a']]);
  });
});