// Focused check for the bundled offline Catholic Bible (WEBC).
// Run: node scripts/verify-bible.mjs   (exit 0 = canon intact)
import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const meta = JSON.parse(await readFile(new URL("data/books.json", root), "utf8"));

assert.equal(meta.short, "WEBC");
assert.equal(meta.canon, "Catholic (73 books)");
assert.equal(meta.books.length, 73, "must be 73 books");
assert.equal(meta.totalChapters, 1328);
assert.equal(meta.totalVerses, 35379);
assert.equal(meta.books.reduce((a, b) => a + b.chapters, 0), meta.totalChapters);
assert.equal(meta.books.reduce((a, b) => a + b.verses, 0), meta.totalVerses);

const names = meta.books.map((b) => b.name);
for (const n of ["Tobit", "Judith", "Wisdom", "Sirach", "Baruch", "1 Maccabees", "2 Maccabees"])
  assert.ok(names.includes(n), `missing deuterocanonical book: ${n}`);
for (const b of meta.books) {
  const shouldBeDeut = ["Tobit", "Judith", "Wisdom", "Sirach", "Baruch", "1 Maccabees", "2 Maccabees"].includes(b.name);
  assert.equal(b.deuterocanonical, shouldBeDeut, `deuterocanonical flag wrong for ${b.name}`);
}
assert.ok(!names.includes("Josue") && !names.includes("1 Esdras") && !names.includes("Apocalypse"),
  "archaic Douay-Rheims names must be gone");

const byName = new Map();
for (const b of meta.books) {
  const data = JSON.parse(await readFile(new URL(`data/bible/${b.file}`, root), "utf8"));
  assert.equal(data.name, b.name);
  assert.equal(data.chapters.length, b.chapters, `chapter count wrong for ${b.name}`);
  assert.equal(data.chapters.reduce((a, c) => a + c.filter((t) => t.length > 0).length, 0), b.verses,
    `verse count wrong for ${b.name}`);
  byName.set(b.name, data);
}
// Spot-checks: modern text, Catholic canon shape, exact versification.
const gen1 = byName.get("Genesis").chapters[0];
assert.ok(gen1[0].startsWith("In the beginning, God created"), "Genesis 1:1 text changed");
assert.equal(byName.get("Esther").chapters.length, 10, "Esther must hold the Greek additions (10 ch)");
assert.equal(byName.get("Daniel").chapters.length, 14, "Daniel must hold the Greek additions (14 ch)");
assert.equal(byName.get("Sirach").chapters.length, 51);
assert.equal(byName.get("Psalms").chapters.length, 150);
const luk17 = byName.get("Luke").chapters[16];
assert.ok(luk17[34].length > 0 && luk17[35] === "" && luk17[36].length > 0, "Luke 17:36 numbering must be preserved as skipped");
const joh3 = byName.get("John").chapters[2];
assert.ok(joh3[15].includes("only born Son"), "John 3:16 text changed");
assert.equal(byName.get("Sirach").chapters[25].length, 29, "Sirach 26 keeps 29 slots with gaps");
assert.ok(byName.get("Revelation").chapters[21].length > 0);
// No stale Douay-Rheims files may remain.
for (const stale of ["josue.json", "1esdras.json", "canticleofcanticles.json", "apocalypse.json", "1machabees.json"]) {
  let exists = true;
  try { await access(new URL(`data/bible/${stale}`, root)); } catch { exists = false; }
  assert.equal(exists, false, `stale DRA file remains: ${stale}`);
}
const source = await readFile(new URL("data/SOURCE.md", root), "utf8");
assert.ok(source.includes("World English Bible Catholic Edition") && source.includes("public domain"));
console.log(`Bible OK: 73 books, ${meta.totalChapters} chapters, ${meta.totalVerses.toLocaleString()} verses (WEBC)`);
