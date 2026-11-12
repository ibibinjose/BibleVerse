import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPullRefresh } from "../pull-refresh.js";

function stubEl() {
  const classes = new Set();
  return {
    style: {},
    textContent: "",
    classList: {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      toggle: (c, f) => { (f ?? !classes.has(c)) ? classes.add(c) : classes.delete(c); },
      contains: (c) => classes.has(c),
    },
  };
}

function rig({ canPull = () => true, onRefresh = () => {}, scrollTop = 0, doneDelay = 10 } = {}) {
  const handlers = {};
  const scroller = {
    scrollTop,
    addEventListener: (t, f) => { (handlers[t] ??= []).push(f); },
  };
  const box = stubEl(), pill = stubEl(), icon = stubEl(), label = stubEl();
  let refreshes = 0;
  const ctl = createPullRefresh({
    scroller, box, pill, icon, label, doneDelay, canPull,
    onRefresh: () => { refreshes++; onRefresh(); },
  });
  const touch = (type, y) => handlers[type].forEach((f) => f({ touches: [{ clientY: y }], preventDefault() {} }));
  return { ctl, box, pill, icon, label, touch, refreshes: () => refreshes };
}

const pullPast = (r, from = 100, to = 300) => { r.touch("touchstart", from); r.touch("touchmove", to); r.touch("touchend", to); };
const pullShort = (r, from = 100, to = 140) => { r.touch("touchstart", from); r.touch("touchmove", to); r.touch("touchend", to); };

describe("pull to refresh", () => {
  it("fires onRefresh after a full pull past the threshold", () => {
    const r = rig();
    r.touch("touchstart", 100);
    assert.equal(r.refreshes(), 0);
    r.touch("touchmove", 300); // dy 200 -> pull 100 >= 70
    assert.equal(r.label.textContent, "Release to refresh");
    assert.ok(r.box.classList.contains("armed"));
    r.touch("touchend", 300);
    assert.equal(r.refreshes(), 1);
    assert.equal(r.label.textContent, "Fresh verses ✦");
  });

  it("does nothing on a short pull", () => {
    const r = rig();
    pullShort(r);
    assert.equal(r.refreshes(), 0);
    assert.equal(r.pill.style.opacity, "0");
  });

  it("does nothing when the feed is scrolled or another view is open", () => {
    const scrolled = rig({ scrollTop: 50 });
    pullPast(scrolled);
    assert.equal(scrolled.refreshes(), 0);
    const gated = rig({ canPull: () => false });
    pullPast(gated);
    assert.equal(gated.refreshes(), 0);
  });

  it("ignores upward drags and multi-touch", () => {
    const r = rig();
    r.touch("touchstart", 300);
    r.touch("touchmove", 100);
    r.touch("touchend", 100);
    assert.equal(r.refreshes(), 0);
  });

  it("still resets when onRefresh throws", () => {
    const r = rig({ onRefresh: () => { throw new Error("boom"); } });
    pullPast(r);
    assert.equal(r.refreshes(), 1);
    assert.equal(r.label.textContent, "Fresh verses ✦");
  });
});
