// Feed rotation for the Daily Feed: nobody sees the same order twice.
//
// - Each calendar day shuffles all verses with a date seed, so the feed and
//   "Verse of the day" change daily and stay stable within the day.
// - Verses the device has not been shown yet float to the front, so newly
//   added posts surface first; once every verse has been shown, a fresh
//   cycle begins.
// - Each visit rotates the order one step, so reopening the app never shows
//   the exact same top of the feed twice in a row.
//
// Pure + storage-injected so it runs in the browser and under node --test.
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle(arr, seed) {
  let a = (seed >>> 0) || 1;
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    a ^= a << 13; a >>>= 0;
    a ^= a >> 17;
    a ^= a << 5; a >>>= 0;
    const j = a % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dayOfYear(d = new Date()) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
}

export function buildFeedOrder(verses, storage, today = new Date()) {
  const key = dayKey(today);
  const base = seededShuffle([...verses], hashStr("bibleverse-" + key));

  let seen;
  try {
    seen = new Set(JSON.parse(storage.getItem("bibleverse-seen") || "[]"));
  } catch {
    seen = new Set();
  }
  if (!base.some((v) => !seen.has(v.id))) seen = new Set(); // full cycle shown: start fresh
  const pool = [...base.filter((v) => !seen.has(v.id)), ...base.filter((v) => seen.has(v.id))];

  let visit = 1;
  try {
    const lastDay = storage.getItem("bibleverse-feed-day");
    const lastVisit = Number(storage.getItem("bibleverse-feed-visit") || "0") || 0;
    visit = lastDay === key ? lastVisit + 1 : 1;
    storage.setItem("bibleverse-feed-day", key);
    storage.setItem("bibleverse-feed-visit", String(visit));
  } catch {
    visit = 1;
  }

  const rot = pool.length ? (visit - 1) % pool.length : 0;
  const order = [...pool.slice(rot), ...pool.slice(0, rot)];

  const nextSeen = new Set([...seen, ...pool.map((v) => v.id)]);
  try {
    storage.setItem("bibleverse-seen", JSON.stringify([...nextSeen]));
  } catch {}

  return { order, base, visit, day: key };
}
