import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFeedOrder, dayOfYear, dayKey, hashStr, seededShuffle } from "../feed-rotation.js";

const verses = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `V${i + 1}` }));

function memStore(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    dump: () => Object.fromEntries(m),
  };
}
const ids = (list) => list.map((v) => v.id);
const dayA = new Date(2026, 10, 12, 12);
const dayB = new Date(2026, 10, 13, 12);

describe("feed rotation", () => {
  it("is deterministic within a day and differs across days", () => {
    const first = ids(buildFeedOrder(verses, memStore(), dayA).order);
    const again = ids(buildFeedOrder(verses, memStore(), dayA).order);
    const other = ids(buildFeedOrder(verses, memStore(), dayB).order);
    assert.deepEqual(first, again);
    assert.equal(first.length, verses.length);
    assert.deepEqual([...first].sort((a, b) => a - b), verses.map((v) => v.id));
    assert.notDeepEqual(first, other);
  });

  it("rotates one step per visit so the top post never repeats", () => {
    const store = memStore();
    const tops = [];
    for (let i = 0; i < 3; i++) tops.push(buildFeedOrder(verses, store, dayA).order[0].id);
    assert.notEqual(tops[0], tops[1]);
    assert.notEqual(tops[1], tops[2]);
  });

  it("floats unseen verses first and restarts the cycle once all are seen", () => {
    const seen = verses.slice(0, 10).map((v) => v.id);
    const store = memStore({ "bibleverse-seen": JSON.stringify(seen) });
    const order = buildFeedOrder(verses, store, dayA).order;
    assert.deepEqual(ids(order.slice(0, 2)).sort((a, b) => a - b), [11, 12]);

    const full = memStore({ "bibleverse-seen": JSON.stringify(verses.map((v) => v.id)) });
    const reset = buildFeedOrder(verses, full, dayA);
    assert.equal(reset.order.length, verses.length);
    assert.equal(reset.visit, 1);
  });

  it("marks shown verses seen so newly added posts surface first", () => {
    const store = memStore();
    buildFeedOrder(verses, store, dayA);
    const recorded = JSON.parse(store.dump()["bibleverse-seen"]);
    assert.deepEqual([...recorded].sort((a, b) => a - b), verses.map((v) => v.id));
  });

  it("survives missing or corrupt storage", () => {
    const broken = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
    const { order } = buildFeedOrder(verses, broken, dayA);
    assert.equal(order.length, verses.length);
  });

  it("helpers behave: stable hash, real shuffle, calendar keys", () => {
    assert.equal(hashStr("bibleverse-2026-11-12"), hashStr("bibleverse-2026-11-12"));
    const shuffled = seededShuffle(verses, 42);
    assert.deepEqual(ids(shuffled).sort((a, b) => a - b), verses.map((v) => v.id));
    assert.notDeepEqual(ids(shuffled), ids(verses));
    assert.equal(dayKey(new Date(2026, 0, 5)), "2026-01-05");
    assert.ok(Number.isInteger(dayOfYear(new Date(2026, 5, 15))) && dayOfYear(new Date(2026, 5, 15)) > 0);
  });
});
