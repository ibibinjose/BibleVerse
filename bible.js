import { shareVerseCard } from "./verse-card.js";

// Full offline Bible reader (World English Bible Catholic Edition bundled in data/). No network needed after load:
// in the native apps the files ship inside the bundle; on the web the service worker caches them.
const $ = (s) => document.querySelector(s);
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

let meta = null;               // { translation, short, books: [{name,testament,chapters,verses,file}] }
const cache = new Map();       // file -> {name, chapters:[[...]]}
let testament = "ALL";
let current = { book: 0, chapter: 1 };   // chapter is 1-based
let selected = null;           // {book, chapter, verse, text}
let fontScale = 1;
let allVersesPromise = null;
let toast = (m) => console.log(m);
const HIGHLIGHT_KEY = "bibleverse-highlights";
function highlightId(book, chapter, verse) { return `${book}:${chapter}:${verse}`; }
function readHighlights() {
  try {
    const v = JSON.parse(localStorage.getItem(HIGHLIGHT_KEY) || "[]");
    return new Set(Array.isArray(v) ? v : []);
  } catch { return new Set(); }
}
function writeHighlights(set) {
  try { localStorage.setItem(HIGHLIGHT_KEY, JSON.stringify([...set])); } catch {}
}

try {
  const r = JSON.parse(localStorage.getItem("bibleverse-reading-catholic") || "null");
  if (r && Number.isInteger(r.book) && Number.isInteger(r.chapter)) current = r;
  fontScale = Number(localStorage.getItem("bibleverse-fontscale")) || 1;
} catch {}

async function loadBook(i) {
  const b = meta.books[i];
  if (!cache.has(b.file)) {
    const res = await fetch(`data/bible/${b.file}`);
    if (!res.ok) throw new Error(`Could not load ${b.name}`);
    cache.set(b.file, await res.json());
  }
  return cache.get(b.file);
}

function savePosition() {
  try { localStorage.setItem("bibleverse-reading-catholic", JSON.stringify(current)); } catch {}
  const b = meta?.books[current.book];
  if (b) { $("#continueRef").textContent = `${b.name} ${current.chapter}`; $("#continueBtn").hidden = false; }
}

function renderBooks() {
  const list = meta.books.map((b, i) => ({ ...b, i })).filter((b) => testament === "ALL" || b.testament === testament);
  $("#bookList").innerHTML = list.map((b) => `
    <button class="book-row" data-book="${b.i}">
      <span class="book-num">${String(b.i + 1).padStart(2, "0")}</span>
      <span class="book-main"><b>${esc(b.name)}</b><small>${b.alias !== b.name ? esc(b.alias) + " · " : ""}${b.testament === "OT" ? "Old Testament" : "New Testament"}${b.deuterocanonical ? " · Deuterocanonical" : ""} · ${b.verses.toLocaleString()} verses</small></span>
      <span class="book-ch">${b.chapters} ch ›</span>
    </button>`).join("");
  $("#bookList").querySelectorAll("[data-book]").forEach((el) =>
    el.addEventListener("click", () => openChapter(Number(el.dataset.book), 1, true)));
}

async function openChapter(bookIdx, chapter, scrollTop = false) {
  current = { book: bookIdx, chapter };
  selected = null;
  $("#selectedBar").hidden = true;
  const data = await loadBook(bookIdx);
  const b = meta.books[bookIdx];
  const verses = data.chapters[chapter - 1] || [];
  $("#reader").hidden = false;
  $("#bookPicker").hidden = true;
  $("#bibleResults").innerHTML = "";
  $("#readerBook").textContent = b.name;
  $("#readerMeta").textContent = `Chapter ${chapter} of ${b.chapters} · ${meta.short}`;
  $("#chapterChips").innerHTML = data.chapters.map((_, i) =>
    `<button class="chapter-chip ${i + 1 === chapter ? "active" : ""}" data-ch="${i + 1}">${i + 1}</button>`).join("");
  $("#chapterChips").querySelectorAll("[data-ch]").forEach((el) =>
    el.addEventListener("click", () => openChapter(bookIdx, Number(el.dataset.ch))));
  $("#verses").style.fontSize = `${17 * fontScale}px`;
  // Some chapters skip verse numbers (Greek Esther/Sirach versification) or
  // leave verses blank (absent from the critical text): skip them in display
  // while keeping real verse numbers from the array position.
  const shown = verses.map((t, i) => ({ t, n: i + 1 })).filter((x) => x.t.trim().length > 0);
  const marks = readHighlights();
  $("#verses").innerHTML = shown.map(({ t, n }) => `
    <p class="verse-line${marks.has(highlightId(bookIdx, chapter, n)) ? " highlighted" : ""}" data-verse="${n}" tabindex="0"><sup>${n}</sup>${esc(t)}</p>`).join("");
  $("#verses").querySelectorAll("[data-verse]").forEach((el) => {
    const pick = () => selectVerse(bookIdx, chapter, Number(el.dataset.verse), verses[Number(el.dataset.verse) - 1], el);
    el.addEventListener("click", pick);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  $("#prevChapterBtn").disabled = bookIdx === 0 && chapter === 1;
  $("#nextChapterBtn").disabled = bookIdx === meta.books.length - 1 && chapter === b.chapters;
  savePosition();
  if (scrollTop) $("#scrollArea")?.scrollTo({ top: 0 });
}

function selectVerse(bookIdx, chapter, verseNo, text, el) {
  $("#verses").querySelectorAll(".verse-line.selected").forEach((x) => x.classList.remove("selected"));
  el.classList.add("selected");
  selected = { book: bookIdx, chapter, verse: verseNo, text };
  const b = meta.books[bookIdx];
  $("#selectedRef").textContent = `${b.name} ${chapter}:${verseNo} · ${meta.short}`;
  $("#selectedBar").hidden = false;
}

function stepChapter(dir) {
  const b = meta.books[current.book];
  let { book, chapter } = current;
  chapter += dir;
  if (chapter > b.chapters) { if (book < meta.books.length - 1) { book += 1; chapter = 1; } else return; }
  if (chapter < 1) { if (book > 0) { book -= 1; chapter = meta.books[book].chapters; } else return; }
  openChapter(book, chapter, true);
}

async function loadAllVerses() {
  if (!allVersesPromise) {
    allVersesPromise = (async () => {
      const all = [];
      for (let i = 0; i < meta.books.length; i++) {
        const data = await loadBook(i);
        data.chapters.forEach((ch, ci) => ch.forEach((text, vi) => {
        if (!text.trim()) return; // skipped/blank verse numbers stay out of search
        all.push({ book: i, chapter: ci + 1, verse: vi + 1, text, hay: (text + " " + meta.books[i].name + " " + meta.books[i].alias).toLowerCase() });
      }));
      }
      return all;
    })();
  }
  return allVersesPromise;
}

function normQ(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9: ]+/g," ").replace(/\s+/g," ").trim(); }
// Parses "John 1:5", "Psalm 23", "1 Cor 13" from the head of a query.
// Returns {bookIdx, chapter, verse} with -1 for unknown parts, or null.
function parseRef(q){
  const m = q.match(/^(\d?\s*[a-z]+)\s*(\d+)?(?::\s*(\d+))?/);
  if(!m) return null;
  const bookKey = m[1].replace(/\s+/g,"");
  const bookIdx = meta.books.findIndex((b) => normQ(b.name).replace(/\s+/g,"") === bookKey || normQ(b.alias).replace(/\s+/g,"") === bookKey || normQ(b.name).replace(/\s+/g,"").startsWith(bookKey) || normQ(b.alias).replace(/\s+/g,"").startsWith(bookKey));
  if(bookIdx < 0) return null;
  if(!m[2]) return { bookIdx, chapter: -1, verse: -1, bookOnly: true };
  return { bookIdx, chapter: Number(m[2]), verse: m[3] ? Number(m[3]) : -1, bookOnly: false };
}

let searchTimer;
async function collectHits(rawQ, limit) {
  const q = normQ(rawQ);
  if (!meta || !q || q.length < 2) return [];
  const all = await loadAllVerses();
  const tokens = q.split(" ").filter(Boolean);
  const ref = parseRef(q);
  const scored = [];
  for(const v of all){
    // Reference-first: exact chapter:verse and chapter matches rank highest.
    if(ref && !ref.bookOnly && v.book === ref.bookIdx){
      if(ref.verse > 0 && v.chapter === ref.chapter && v.verse === ref.verse){ scored.push({ v, s: 1000 }); continue; }
      if(ref.verse < 0 && v.chapter === ref.chapter){ scored.push({ v, s: 500 - Math.min(v.verse, 200) * 0.01 }); continue; }
      if(ref.chapter < 0){ scored.push({ v, s: 100 - Math.min((v.chapter - 1) * 10 + v.verse, 500) * 0.01 }); continue; }
    }
    if(ref && ref.bookOnly && v.book === ref.bookIdx){ scored.push({ v, s: 100 - Math.min((v.chapter - 1) * 10 + v.verse, 500) * 0.01 }); continue; }
    let s = 0, ok = true;
    for(const t of tokens){
      if(v.hay.includes(t)) s += t.length >= 5 ? 3 : 1;
      else { ok = false; break; }
    }
    if(ok) scored.push({ v, s });
  }
  scored.sort((a, b) => b.s - a.s || a.v.book - b.v.book || a.v.chapter - b.v.chapter || a.v.verse - b.v.verse);
  return scored.slice(0, limit).map(x => x.v);
}
async function runBibleSearch(rawQ) {
  const metaEl = $("#bibleSearchMeta"), resultsEl = $("#bibleResults");
  const q = normQ(rawQ);
  if (!q || q.length < 2) { metaEl.hidden = true; resultsEl.innerHTML = ""; return; }
  metaEl.hidden = false; metaEl.textContent = `Searching all ${meta.totalVerses.toLocaleString()} verses…`;
  const hits = await collectHits(rawQ, 60);
  if (normQ($("#bibleSearch").value) !== q) return;
  const displayQ = ($("#bibleSearch").value || "").trim() || q;
  metaEl.textContent = hits.length ? `${hits.length}${hits.length === 60 ? "+" : ""} result${hits.length > 1 ? "s" : ""} for “${displayQ}” — tap to read` : `No verses found for “${displayQ}”. Try fewer words, another spelling, or a reference like John 1:1.`;
  resultsEl.innerHTML = hits.map((h) => `
    <button class="result-row" data-goto="${h.book}:${h.chapter}:${h.verse}">
      <b>${esc(meta.books[h.book].name)} ${h.chapter}:${h.verse}</b>
      <span>${esc(h.text.length > 150 ? h.text.slice(0, 150) + "…" : h.text)}</span>
    </button>`).join("");
  resultsEl.querySelectorAll("[data-goto]").forEach((el) => el.addEventListener("click", async () => {
    const [b, c, v] = el.dataset.goto.split(":").map(Number);
    await openChapter(b, c, true);
    const line = $("#verses").querySelector(`[data-verse="${v}"]`);
    if (line) { line.scrollIntoView({ block: "center" }); selectVerse(b, c, v, line.textContent.replace(/^\d+/, ""), line); }
  }));
}

export function initBible({ showToast } = {}) {
  if (showToast) toast = showToast;
  let loaded = false;
  async function ensureLoaded() {
    if (loaded) return;
    loaded = true;
    try {
      const res = await fetch("data/books.json");
      if (!res.ok) throw new Error("books.json missing");
      meta = await res.json();
      $("#bibleCount").textContent = `${meta.books.length} books · ${meta.totalChapters.toLocaleString()} chapters · ${meta.totalVerses.toLocaleString()} verses — stored in this app`;
      renderBooks();
      savePosition();
      $("#bibleOfflinePill").textContent = navigator.onLine ? "● Offline ready" : "● You're offline — Bible still works";
    } catch {
      $("#bookList").innerHTML = `<p class="grid-empty">Bible data could not be loaded. In the native apps it is bundled — try reopening the app.</p>`;
      $("#bibleOfflinePill").textContent = "● Bible data missing";
    }
  }

  document.querySelectorAll("[data-testament]").forEach((btn) => btn.addEventListener("click", () => {
    testament = btn.dataset.testament;
    document.querySelectorAll("[data-testament]").forEach((x) => x.classList.toggle("active", x === btn));
    if (meta) renderBooks();
  }));
  $("#readerBackBtn").addEventListener("click", showPicker);
  $("#booksBtn").addEventListener("click", showPicker);
  function showPicker() { $("#reader").hidden = true; $("#bookPicker").hidden = false; $("#scrollArea")?.scrollTo({ top: 0 }); }
  $("#prevChapterBtn").addEventListener("click", () => stepChapter(-1));
  $("#nextChapterBtn").addEventListener("click", () => stepChapter(1));
  $("#continueBtn").addEventListener("click", async () => { await ensureLoaded(); openChapter(current.book, current.chapter, true); });
  $("#fontUpBtn").addEventListener("click", () => setFont(0.1));
  $("#fontDownBtn").addEventListener("click", () => setFont(-0.1));
  function setFont(d) { fontScale = Math.min(1.5, Math.max(0.8, +(fontScale + d).toFixed(2))); try { localStorage.setItem("bibleverse-fontscale", String(fontScale)); } catch {} $("#verses").style.fontSize = `${17 * fontScale}px`; }
  $("#bibleSearch").addEventListener("input", (e) => { clearTimeout(searchTimer); const q = normQ(e.target.value); searchTimer = setTimeout(async () => { await ensureLoaded(); runBibleSearch(q); }, 250); });
  async function verseAction(share) {
    if (!selected) return;
    const b = meta.books[selected.book];
    const text = `${b.name} ${selected.chapter}:${selected.verse} — ${selected.text.trim()} (${meta.short})`;
    if (share && navigator.share) { try { await navigator.share({ title: `${b.name} ${selected.chapter}:${selected.verse}`, text }); return; } catch {} }
    try { await navigator.clipboard.writeText(text); toast(share ? "Verse copied — paste to share" : "Verse copied"); } catch { toast(text); }
  }
  $("#selectedCopyBtn").addEventListener("click", () => verseAction(false));
  $("#selectedShareBtn").addEventListener("click", () => verseAction(true));
  $("#selectedHighlightBtn").addEventListener("click", () => {
    if (!selected) return;
    const marks = readHighlights();
    const id = highlightId(selected.book, selected.chapter, selected.verse);
    if (marks.has(id)) marks.delete(id); else marks.add(id);
    writeHighlights(marks);
    document.querySelector(`#verses [data-verse="${selected.verse}"]`)?.classList.toggle("highlighted", marks.has(id));
    toast(marks.has(id) ? "Highlighted on this device" : "Highlight removed");
  });
  $("#selectedCardBtn").addEventListener("click", async () => {
    if (!selected) return;
    const b = meta.books[selected.book];
    try {
      const how = await shareVerseCard({
        title: b.name,
        verse: selected.text.trim(),
        ref: `${b.name} ${selected.chapter}:${selected.verse}`,
        bg: "#1e3a2f",
        fg: "#f7f3ea",
      });
      toast(how === "shared" ? "Verse card ready to send" : "Verse card saved to your downloads");
    } catch { toast("Could not make a verse card"); }
  });
  window.addEventListener("online", () => { $("#bibleOfflinePill").textContent = "● Offline ready"; });
  window.addEventListener("offline", () => { $("#bibleOfflinePill").textContent = "● You're offline — Bible still works"; });

  async function findVerses(rawQ) {
    await ensureLoaded();
    const hits = await collectHits(rawQ, 5);
    if (!meta) return [];
    return hits.map((h) => ({
      book: h.book,
      chapter: h.chapter,
      verse: h.verse,
      ref: `${meta.books[h.book].name} ${h.chapter}:${h.verse}`,
      text: h.text.length > 140 ? h.text.slice(0, 140) + "…" : h.text,
    }));
  }
  return { ensureLoaded, findVerses, openChapter: async (b, c) => { await ensureLoaded(); return openChapter(b, c, true); } };
}
