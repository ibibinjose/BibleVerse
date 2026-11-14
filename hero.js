export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function todayCardHTML(v, opts = {}) {
  const { note = "", saved = false, kicker = "Today's verse", source = "" } = opts;
  const sourceAttr = source ? ` data-source="${esc(source)}"` : "";
  return `<article class="reflect" data-today data-id="${Number(v.id)}"${sourceAttr}>
    <p class="reflect-kicker">${esc(kicker)} · ${esc(v.topic)}</p>
    <h2 class="reflect-name">${esc(v.name)}</h2>
    <p class="reflect-verse">“${esc(v.verse)}”</p>
    <p class="reflect-ref">${esc(v.ref)}</p>
    <p class="reflect-prompt">${esc(v.reflection)}</p>
    <label class="note-label">Your note, kept on this device
      <textarea class="verse-note" data-note="${Number(v.id)}" maxlength="500" placeholder="Write a reflection. It never leaves this device.">${esc(note)}</textarea>
    </label>
    <div class="reflect-actions">
      <button type="button" class="ig-btn${saved ? "" : " ghost"}" data-save="${Number(v.id)}">${saved ? "Favourited" : "Favourite"}</button>
      <button type="button" class="ig-btn ghost" data-share="${Number(v.id)}">Share card</button>
    </div>
  </article>`;
}
