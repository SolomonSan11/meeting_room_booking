import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertValidRange, rangesOverlap } from './time.js';

describe('assertValidRange', () => {
  it('rejects garbage dates', () => {
    const r = assertValidRange('bad', '2025-01-01T12:00:00.000Z');
    assert.equal(r.ok, false);
  });

  it('rejects start >= end', () => {
    const t = '2025-06-01T10:00:00.000Z';
    const r = assertValidRange(t, t);
    assert.equal(r.ok, false);
  });

  it('accepts a normal range', () => {
    const r = assertValidRange(
      '2025-06-01T10:00:00.000Z',
      '2025-06-01T11:00:00.000Z'
    );
    assert.equal(r.ok, true);
  });
});

describe('rangesOverlap', () => {
  const ms = (start, end) => ({
    s: Date.parse(start),
    e: Date.parse(end),
  });

  it('same slot', () => {
    const a = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:00:00.000Z');
    const b = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:00:00.000Z');
    assert.equal(rangesOverlap(a.s, a.e, b.s, b.e), true);
  });

  it('partial overlap', () => {
    const a = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:30:00.000Z');
    const b = ms('2025-06-01T11:00:00.000Z', '2025-06-01T12:00:00.000Z');
    assert.equal(rangesOverlap(a.s, a.e, b.s, b.e), true);
  });

  it('one inside the other', () => {
    const outer = ms('2025-06-01T09:00:00.000Z', '2025-06-01T13:00:00.000Z');
    const inner = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:00:00.000Z');
    assert.equal(rangesOverlap(outer.s, outer.e, inner.s, inner.e), true);
  });

  it('back to back is ok', () => {
    const a = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:00:00.000Z');
    const b = ms('2025-06-01T11:00:00.000Z', '2025-06-01T12:00:00.000Z');
    assert.equal(rangesOverlap(a.s, a.e, b.s, b.e), false);
  });

  it('overlapping middle', () => {
    const a = ms('2025-06-01T10:00:00.000Z', '2025-06-01T11:00:00.000Z');
    const b = ms('2025-06-01T10:30:00.000Z', '2025-06-01T11:30:00.000Z');
    assert.equal(rangesOverlap(a.s, a.e, b.s, b.e), true);
  });
});
