// Builds the bundled offline Catholic Bible (World English Bible Catholic
// Edition — modern-English, public domain) into data/. Source: eBible.org
// eng-web-c VPL text (https://ebible.org/Scriptures/eng-web-c_vpl.zip).
// Canon: 73 books in Catholic order, including the deuterocanonical books
// (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees) and the longer
// Greek portions of Esther and Daniel. Text is kept byte-for-byte as
// published: the "World English Bible" name is a trademark of eBible.org
// reserved for unchanged copies.
import { readFile, writeFile, mkdir, rm, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const ZIP_URL = "https://eBible.org/Scriptures/eng-web-c_vpl.zip";
const ZIP_PATH = "/tmp/bibleverse-webc-vpl.zip";
const VPL_NAME = "eng-web-c_vpl.txt";
try {
  await access(ZIP_PATH);
} catch {
  await run("curl", ["-sL", "--max-time", "180", "-o", ZIP_PATH, ZIP_URL]);
}
const { stdout } = await run("unzip", ["-p", ZIP_PATH, VPL_NAME], { maxBuffer: 64 * 1024 * 1024 });
const lines = stdout.split("\n").filter((l) => l.trim().length > 0);

// VPL code -> Catholic display name, in Catholic order.
const ORDER = [
  ["GEN", "Genesis"], ["EXO", "Exodus"], ["LEV", "Leviticus"], ["NUM", "Numbers"],
  ["DEU", "Deuteronomy"], ["JOS", "Joshua"], ["JDG", "Judges"], ["RUT", "Ruth"],
  ["1SA", "1 Samuel"], ["2SA", "2 Samuel"], ["1KI", "1 Kings"], ["2KI", "2 Kings"],
  ["1CH", "1 Chronicles"], ["2CH", "2 Chronicles"], ["EZR", "Ezra"], ["NEH", "Nehemiah"],
  ["TOB", "Tobit"], ["JDT", "Judith"], ["ESG", "Esther"], ["JOB", "Job"],
  ["PSA", "Psalms"], ["PRO", "Proverbs"], ["ECC", "Ecclesiastes"], ["SOL", "Song of Songs"],
  ["WIS", "Wisdom"], ["SIR", "Sirach"], ["ISA", "Isaiah"], ["JER", "Jeremiah"],
  ["LAM", "Lamentations"], ["BAR", "Baruch"], ["EZE", "Ezekiel"], ["DNG", "Daniel"],
  ["HOS", "Hosea"], ["JOE", "Joel"], ["AMO", "Amos"], ["OBA", "Obadiah"],
  ["JON", "Jonah"], ["MIC", "Micah"], ["NAH", "Nahum"], ["HAB", "Habakkuk"],
  ["ZEP", "Zephaniah"], ["HAG", "Haggai"], ["ZEC", "Zechariah"], ["MAL", "Malachi"],
  ["1MA", "1 Maccabees"], ["2MA", "2 Maccabees"],
  ["MAT", "Matthew"], ["MAR", "Mark"], ["LUK", "Luke"], ["JOH", "John"],
  ["ACT", "Acts"], ["ROM", "Romans"], ["1CO", "1 Corinthians"], ["2CO", "2 Corinthians"],
  ["GAL", "Galatians"], ["EPH", "Ephesians"], ["PHI", "Philippians"], ["COL", "Colossians"],
  ["1TH", "1 Thessalonians"], ["2TH", "2 Thessalonians"], ["1TI", "1 Timothy"],
  ["2TI", "2 Timothy"], ["TIT", "Titus"], ["PHM", "Philemon"], ["HEB", "Hebrews"],
  ["JAM", "James"], ["1PE", "1 Peter"], ["2PE", "2 Peter"], ["1JO", "1 John"],
  ["2JO", "2 John"], ["3JO", "3 John"], ["JUD", "Jude"], ["REV", "Revelation"],
];
// Expected chapter counts per VPL code (World English Bible Catholic Edition,
// including the Greek Esther/Daniel). If eBible.org revises the text and this
// fails, re-check the counts and update EXPECTED_CHAPTERS + EXPECTED_VERSES.
const EXPECTED_CHAPTERS = {
  GEN: 50, EXO: 40, LEV: 27, NUM: 36, DEU: 34, JOS: 24, JDG: 21, RUT: 4,
  "1SA": 31, "2SA": 24, "1KI": 22, "2KI": 25, "1CH": 29, "2CH": 36, EZR: 10,
  NEH: 13, TOB: 14, JDT: 16, ESG: 10, JOB: 42, PSA: 150, PRO: 31, ECC: 12,
  SOL: 8, WIS: 19, SIR: 51, ISA: 66, JER: 52, LAM: 5, BAR: 6, EZE: 48,
  DNG: 14, HOS: 14, JOE: 3, AMO: 9, OBA: 1, JON: 4, MIC: 7, NAH: 3, HAB: 3,
  ZEP: 3, HAG: 2, ZEC: 14, MAL: 4, "1MA": 16, "2MA": 15, MAT: 28, MAR: 16,
  LUK: 24, JOH: 21, ACT: 28, ROM: 16, "1CO": 16, "2CO": 13, GAL: 6, EPH: 6,
  PHI: 4, COL: 4, "1TH": 5, "2TH": 3, "1TI": 6, "2TI": 4, TIT: 3, PHM: 1,
  HEB: 13, JAM: 5, "1PE": 5, "2PE": 3, "1JO": 5, "2JO": 1, "3JO": 1, JUD: 1,
  REV: 22,
};
const EXPECTED_VERSES = 35379; // non-empty verses: 35408 VPL lines minus 29
// intentionally blank verses (e.g. Luke 17:36, Acts 8:37, verses absent from
// the critical text, plus untranslated Sirach versification slots). Blanks are
// kept as "" so verse numbers stay exact; the reader skips them.
// Familiar alternate names (shown in the book list, used in search).
const ALIAS = {
  Tobit: "Tobias", Sirach: "Ecclesiasticus", "Song of Songs": "Song of Solomon", Revelation: "Apocalypse",
};
const DEUT = new Set(["TOB", "JDT", "WIS", "SIR", "BAR", "1MA", "2MA"]);

// code -> chapters -> verses (1-based arrays, gaps forbidden)
const parsed = new Map();
for (const line of lines) {
  const m = line.match(/^([A-Z0-9]{2,4}) (\d+):(\d+) (.*)$/);
  if (!m) throw new Error(`Unparseable VPL line: ${line.slice(0, 80)}`);
  const [, code, c, v, text] = m;
  if (!parsed.has(code)) parsed.set(code, new Map());
  const chapters = parsed.get(code);
  const ci = Number(c), vi = Number(v);
  if (!chapters.has(ci)) chapters.set(ci, new Map());
  const verses = chapters.get(ci);
  if (verses.has(vi)) throw new Error(`Duplicate verse: ${code} ${c}:${v}`);
  verses.set(vi, text);
}
const byCode = new Map();
for (const [code, chapters] of parsed) {
  const sortedCh = [...chapters.keys()].sort((a, b) => a - b);
  if (sortedCh.length !== chapters.size || sortedCh[0] !== 1 || sortedCh[sortedCh.length - 1] !== sortedCh.length)
    throw new Error(`Non-contiguous chapters in ${code}`);
  const arr = sortedCh.map((ci) => {
    const verses = chapters.get(ci);
    const sortedV = [...verses.keys()].sort((a, b) => a - b);
    if (sortedV[0] !== 1) throw new Error(`Chapter ${code} ${ci} does not start at verse 1`);
    // The WEB Catholic Edition follows Greek/Latin versification in places
    // (Esther, Sirach), so some verse numbers are skipped. Keep real verse
    // numbers by filling gaps with "" — the reader skips empty verses while
    // numbering from the array position.
    const out = [];
    for (let vi = 1; vi <= sortedV[sortedV.length - 1]; vi++)
      out.push(verses.get(vi) ?? "");
    return out;
  });
  byCode.set(code, arr);
}

const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "");
const outDir = new URL("../data/bible/", import.meta.url);
try {
  await rm(outDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
} catch {}
await mkdir(outDir, { recursive: true });
const books = [];
let totalChapters = 0, totalVerses = 0;
for (const [i, [code, name]] of ORDER.entries()) {
  const chapters = byCode.get(code);
  if (!chapters) throw new Error(`Missing book: ${code} (${name})`);
  if (chapters.length !== EXPECTED_CHAPTERS[code])
    throw new Error(`Bad chapter count for ${name}: got ${chapters.length}, expected ${EXPECTED_CHAPTERS[code]}`);
  const verses = chapters.reduce((a, c) => a + c.filter((t) => t.length > 0).length, 0);
  totalChapters += chapters.length; totalVerses += verses;
  const file = slug(name) + ".json";
  await writeFile(new URL(file, outDir), JSON.stringify({ name, chapters }));
  books.push({ name, alias: ALIAS[name] || name, testament: i < 46 ? "OT" : "NT", deuterocanonical: DEUT.has(code), chapters: chapters.length, verses, file });
}
if (books.length !== 73 || totalChapters !== 1328 || totalVerses !== EXPECTED_VERSES)
  throw new Error(`Bad totals: ${books.length} books, ${totalChapters} chapters, ${totalVerses} verses (expected 73 / 1328 / ${EXPECTED_VERSES})`);
await writeFile(new URL("../data/books.json", import.meta.url),
  JSON.stringify({ translation: "World English Bible Catholic Edition (WEBC) — Catholic Bible", short: "WEBC", canon: "Catholic (73 books)", totalChapters, totalVerses, books }));
await writeFile(new URL("../data/SOURCE.md", import.meta.url),
  "# Bundled Bible text\n\nWorld English Bible Catholic Edition (WEBC) — modern English, public domain, in traditional Catholic book order. Source: eBible.org eng-web-c VPL text (https://ebible.org/Scriptures/eng-web-c_vpl.zip). The World English Bible text is dedicated to the public domain by eBible.org; \"World English Bible\" is a trademark of eBible.org for unchanged copies, so the text is bundled byte-for-byte as published. Complete Catholic canon: 73 books, including Tobit, Judith, Wisdom, Sirach (Ecclesiasticus), Baruch, and 1-2 Maccabees, plus the longer Greek portions of Esther and Daniel. The New American Bible hosted on vatican.va (snapshot 2002-11-11; revised as NABRE 2011) is \u00A9 Confraternity of Christian Doctrine / USCCB and cannot be bundled without written permission, so it is linked, not copied.\n");
console.log(`Catholic Bible built: ${books.length} books, ${totalChapters} chapters, ${totalVerses} verses`);
