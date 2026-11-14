import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { startablePlans, lockedPlans, togglePlanDay, readPlanProgress } from "../plans.js";
import { parseReminderTime, reminderNotification } from "../reminders.js";
import { writeNote, readNotes } from "../notes.js";

function mem() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

describe("plans", () => {
  it("offers two free plans and keeps the long plan dormant", () => {
    assert.equal(startablePlans(false).length, 2);
    assert.equal(startablePlans(false).some((p) => p.plus), false);
    assert.equal(lockedPlans(false)[0].id, "scripture-90");
    assert.equal(lockedPlans(true).length, 0);
    assert.equal(startablePlans(false)[0].readings.length, 7);
    assert.equal(startablePlans(false)[1].readings.length, 30);
  });

  it("records a day of progress on the device", () => {
    const store = mem();
    assert.deepEqual(togglePlanDay(store, "psalms-comfort", 0), [0]);
    assert.deepEqual(togglePlanDay(store, "psalms-comfort", 0), []);
    togglePlanDay(store, "psalms-comfort", 2);
    assert.deepEqual(readPlanProgress(store, "psalms-comfort"), [2]);
  });
});

describe("reminders", () => {
  it("parses a daily time and builds one repeating notification", () => {
    assert.equal(parseReminderTime("8:00"), null);
    assert.deepEqual(parseReminderTime("08:00"), { hour: 8, minute: 0 });
    const note = reminderNotification(parseReminderTime("21:30"));
    assert.equal(note.id, 1);
    assert.equal(note.schedule.on.hour, 21);
    assert.equal(note.schedule.repeats, true);
  });
});

describe("notes", () => {
  it("stores and clears a private note", () => {
    const store = mem();
    writeNote(store, "verse:1", "  held me today  ");
    assert.equal(readNotes(store)["verse:1"], "held me today");
    writeNote(store, "verse:1", "   ");
    assert.equal(readNotes(store)["verse:1"], undefined);
  });
});
