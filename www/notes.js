export function readNotes(store) {
  try {
    const value = JSON.parse(store.getItem("bibleverse-notes") || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function writeNote(store, key, text) {
  const all = readNotes(store);
  const clean = String(text || "").trim().slice(0, 500);
  if (clean) all[key] = clean;
  else delete all[key];
  store.setItem("bibleverse-notes", JSON.stringify(all));
  return all;
}
