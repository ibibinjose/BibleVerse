// Daily open streak. Stored only on the device. A missed calendar day resets the count.

export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function read(store) {
  try {
    const raw = JSON.parse(store.getItem("bibleverse-streak") || "{}");
    return {
      last: typeof raw.last === "string" ? raw.last : "",
      count: Number.isFinite(raw.count) ? raw.count : 0,
      best: Number.isFinite(raw.best) ? raw.best : 0,
    };
  } catch {
    return { last: "", count: 0, best: 0 };
  }
}

export function recordStreak(store, now = new Date()) {
  const today = dayKey(now);
  const prev = read(store);
  if (prev.last === today) return prev;
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const count = prev.last === yesterday ? prev.count + 1 : 1;
  const next = { last: today, count, best: Math.max(prev.best, count) };
  store.setItem("bibleverse-streak", JSON.stringify(next));
  return next;
}
