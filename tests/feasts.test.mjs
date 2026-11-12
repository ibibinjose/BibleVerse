import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FIXED, RANK_DOT, adventSunday, baptismOfLord, christTheKing, easterSunday,
  epiphanySunday, feastsOn, holyFamily, key, massStats, movableFeasts,
  searchFeasts, seasonOf, sundayOnOrBefore, toDate, upcomingFeasts,
} from "../feasts.js";

const D = (y, m, d) => toDate(y, m, d);
const names = (dt) => feastsOn(dt).map((f) => f.name);

describe("feasts", () => {
  it("computes Easter correctly", () => {
    assert.equal(easterSunday(2024).toDateString(), new Date(2024, 2, 31).toDateString());
    assert.equal(easterSunday(2025).toDateString(), new Date(2025, 3, 20).toDateString());
    assert.equal(easterSunday(2026).toDateString(), new Date(2026, 3, 5).toDateString());
  });

  it("places Epiphany on Sunday and Baptism after it", () => {
    // 2024: Sunday Jan 7 -> Baptism Monday Jan 8 (the transfer-year edge case)
    assert.equal(epiphanySunday(2024).getDate(), 7);
    assert.deepEqual([baptismOfLord(2024).getMonth(), baptismOfLord(2024).getDate()], [0, 8]);
    // 2026: Sunday Jan 4 -> Baptism the next Sunday
    assert.equal(epiphanySunday(2026).getDate(), 4);
    assert.deepEqual([baptismOfLord(2026).getMonth(), baptismOfLord(2026).getDate()], [0, 11]);
  });

  it("derives Holy Week, Pentecost, Christ the King and Advent", () => {
    const names2026 = movableFeasts(2026).map((f) => f.name);
    for (const n of ["Ash Wednesday", "Palm Sunday", "Holy Thursday", "Good Friday", "Holy Saturday",
      "Easter Sunday", "Pentecost", "Most Holy Trinity", "Corpus Christi", "Christ the King"]) {
      assert.ok(names2026.includes(n), `missing ${n}`);
    }
    const ash = movableFeasts(2026).find((f) => f.name === "Ash Wednesday");
    assert.deepEqual([ash.m, ash.d], [2, 18]);
    assert.deepEqual([christTheKing(2026).getMonth(), christTheKing(2026).getDate()], [10, 22]);
    assert.deepEqual([adventSunday(2026).getMonth(), adventSunday(2026).getDate()], [10, 29]);
    assert.deepEqual([holyFamily(2026).getMonth(), holyFamily(2026).getDate()], [11, 27]);
  });

  it("labels liturgical seasons across the year", () => {
    const s = (y, m, d) => seasonOf(new Date(y, m - 1, d)).name;
    assert.equal(s(2026, 12, 24), "Advent");
    assert.equal(s(2026, 12, 25), "Christmas");
    assert.equal(s(2027, 1, 10), "Christmas");
    assert.equal(s(2027, 1, 11), "Ordinary Time");
    assert.equal(s(2026, 3, 1), "Lent");
    assert.equal(s(2026, 4, 4), "Triduum");
    assert.equal(s(2026, 4, 5), "Easter");
    assert.equal(s(2026, 5, 24), "Easter");
    assert.equal(s(2026, 5, 25), "Ordinary Time");
    assert.equal(s(2026, 9, 1), "Ordinary Time");
  });

  it("finds fixed feasts, obligation days and multi-saint days", () => {
    assert.ok(names(D(2026, 12, 25)).includes("Christmas"));
    assert.ok(names(D(2026, 8, 15)).includes("Assumption of Mary"));
    assert.ok(names(D(2026, 9, 29)).some((n) => n.includes("Archangels")));
    const xmas = feastsOn(D(2026, 12, 25))[0];
    assert.equal(xmas.rank, "Solemnity");
    assert.equal(xmas.obligation, true);
    const feb8 = names(D(2026, 2, 8));
    assert.ok(feb8.includes("Jerome Emiliani") && feb8.includes("Josephine Bakhita"));
    assert.ok(feastsOn(D(2026, 10, 5)).length === 0);
  });

  it("lists upcoming feasts in order with day counts", () => {
    const up = upcomingFeasts(new Date(2026, 11, 20, 12), 5);
    assert.ok(up.length === 5);
    assert.ok(up.every((g, i, a) => i === 0 || a[i - 1].inDays < g.inDays));
    assert.ok(up[0].inDays >= 1 && up[0].items.length > 0);
  });

  it("searches feasts and saints with next occurrences", () => {
    const patrick = searchFeasts("patrick", new Date(2026, 10, 12));
    assert.ok(patrick.length > 0 && patrick[0].name === "Patrick");
    assert.deepEqual([patrick[0].y, patrick[0].m, patrick[0].d], [2027, 3, 17]);
    const ash = searchFeasts("ash wednesday", new Date(2026, 10, 12));
    assert.ok(ash.length === 1 && ash[0].rank === "Observance");
    assert.deepEqual(searchFeasts("zzzznope", new Date(2026, 10, 12)), []);
    assert.deepEqual(searchFeasts("   ", new Date(2026, 10, 12)), []);
    // diacritic-insensitive: therese matches Thérèse
    assert.ok(searchFeasts("therese", new Date(2026, 10, 12)).some((f) => f.name.includes("Thérèse")));
  });

  it("counts Sunday Masses and streaks", () => {
    const k = (y, m, d) => key(y, m, d);
    // three consecutive Sundays ending Nov 8 2026, checked mid-week
    const log = [k(2026, 10, 25), k(2026, 11, 1), k(2026, 11, 8)];
    const mid = massStats(log, new Date(2026, 10, 12, 12));
    assert.equal(mid.total, 3);
    assert.equal(mid.streak, 3);
    assert.equal(mid.logged, true);
    assert.deepEqual([mid.lastSunday.y, mid.lastSunday.m, mid.lastSunday.d], [2026, 11, 8]);
    // this week not yet logged: streak counts back from the previous Sunday
    const todo = massStats([k(2026, 10, 25), k(2026, 11, 1)], new Date(2026, 10, 12, 12));
    assert.equal(todo.logged, false);
    assert.equal(todo.streak, 2);
    // gap breaks the streak but keeps the count
    const gap = massStats([k(2026, 10, 25), k(2026, 11, 8)], new Date(2026, 10, 12, 12));
    assert.equal(gap.total, 2);
    assert.equal(gap.streak, 1);
    // checked on a Sunday that is logged
    const done = massStats([k(2026, 11, 1), k(2026, 11, 8)], new Date(2026, 10, 8, 12));
    assert.equal(done.logged, true);
    assert.equal(done.streak, 2);
    // empty log and corrupt input
    assert.deepEqual([massStats([], new Date(2026, 10, 12)).total, massStats([], new Date(2026, 10, 12)).streak], [0, 0]);
    assert.equal(massStats(null, new Date(2026, 10, 12)).total, 0);
    assert.equal(sundayOnOrBefore(new Date(2026, 10, 8, 12)).getDate(), 8);
    assert.equal(sundayOnOrBefore(new Date(2026, 10, 11, 12)).getDate(), 8);
  });

  it("covers the full calendar without bad entries", () => {
    assert.ok(FIXED.length > 150, `only ${FIXED.length} fixed feasts`);
    assert.ok(FIXED.every((f) => f.m >= 1 && f.m <= 12 && f.d >= 1 && f.d <= 31 && f.name && f.about && f.rank));
    assert.ok(FIXED.every((f) => RANK_DOT[f.rank]), "every rank has a dot color");
    const solemnities = ["Mary, the Holy Mother of God", "Assumption of Mary", "All Saints", "Immaculate Conception of Mary", "Christmas", "Saint Joseph, Spouse of Mary", "Annunciation of the Lord", "Saints Peter and Paul", "Nativity of Saint John the Baptist"];
    for (const n of solemnities) assert.ok(FIXED.some((f) => f.name === n), `missing ${n}`);
  });
});
