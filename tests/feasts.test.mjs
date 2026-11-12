import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FIXED, RANK_DOT, adventSunday, baptismOfLord, christTheKing, easterSunday,
  epiphanySunday, feastsOn, holyFamily, movableFeasts, seasonOf, toDate,
  upcomingFeasts,
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

  it("covers the full calendar without bad entries", () => {
    assert.ok(FIXED.length > 150, `only ${FIXED.length} fixed feasts`);
    assert.ok(FIXED.every((f) => f.m >= 1 && f.m <= 12 && f.d >= 1 && f.d <= 31 && f.name && f.about && f.rank));
    assert.ok(FIXED.every((f) => RANK_DOT[f.rank]), "every rank has a dot color");
    const solemnities = ["Mary, the Holy Mother of God", "Assumption of Mary", "All Saints", "Immaculate Conception of Mary", "Christmas", "Saint Joseph, Spouse of Mary", "Annunciation of the Lord", "Saints Peter and Paul", "Nativity of Saint John the Baptist"];
    for (const n of solemnities) assert.ok(FIXED.some((f) => f.name === n), `missing ${n}`);
  });
});
