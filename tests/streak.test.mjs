import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dayKey, recordStreak } from "../streak.js";

function mem() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

describe("streak", () => {
  it("starts at 1 and does not double-count the same day", () => {
    const store = mem();
    const day = new Date(2026, 10, 14, 8);
    assert.equal(recordStreak(store, day).count, 1);
    assert.equal(recordStreak(store, new Date(2026, 10, 14, 22)).count, 1);
  });

  it("grows across consecutive days and resets after a gap", () => {
    const store = mem();
    recordStreak(store, new Date(2026, 10, 12, 9));
    const next = recordStreak(store, new Date(2026, 10, 13, 9));
    assert.equal(next.count, 2);
    assert.equal(next.best, 2);
    const later = recordStreak(store, new Date(2026, 10, 16, 9));
    assert.equal(later.count, 1);
    assert.equal(later.best, 2);
    assert.equal(dayKey(new Date(2026, 0, 2)), "2026-01-02");
  });
});
