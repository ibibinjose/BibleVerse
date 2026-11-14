// Instagram-style verse card. No invented counts, follows, or badges.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20.5s-7.5-4.6-9.3-9C1.2 8 3.2 4.9 6.4 4.9c2 0 3.4 1.1 5.6 3.4 2.2-2.3 3.6-3.4 5.6-3.4 3.2 0 5.2 3.1 3.7 6.6-1.8 4.4-9.3 9-9.3 9Z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3c5.2 0 9.5 3.8 9.5 8.5S17.2 20 12 20c-1.1 0-2.2-.17-3.2-.5L3 20l.9-3.4C3.3 15.2 2.5 13.4 2.5 11.5 2.5 6.8 6.8 3 12 3Z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke-linejoin="round"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 3h12v18l-6-4.5L6 21V3Z" stroke-linejoin="round"/></svg>',
};

export function initials(name) {
  return String(name || "").split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

export function postHTML(v, opts = {}) {
  const isLiked = opts.liked === true;
  const isSaved = opts.saved === true;
  const list = Array.isArray(opts.comments) ? opts.comments : [];
  const prerender = opts.prerender ? " data-prerender" : "";
  return `<article class="post" data-id="${Number(v.id)}"${prerender}>
    <div class="post-head">
      <span class="avatar" style="background:${esc(v.bg)}">${esc(initials(v.author))}</span>
      <div class="post-user"><b>${esc(v.author)}</b><small>@${esc(v.handle)} · ${esc(v.ref)} · ${esc(v.topic)}</small></div>
      <button class="more-btn" data-more="${Number(v.id)}" aria-label="Copy verse text">Copy</button>
    </div>
    <div class="media" data-dbl="${Number(v.id)}" style="background:${esc(v.bg)};color:${esc(v.fg)}" role="img" aria-label="${esc(v.name)} — ${esc(v.ref)}">
      <p class="media-kicker">${esc(v.topic)} · ${esc(v.book)}</p>
      <h2 class="media-name">${esc(v.name)}</h2>
      <p class="media-verse">“${esc(v.verse)}”</p>
      <span class="media-ref">${esc(v.ref)}</span>
      <span class="media-dots"><i class="on"></i><i></i><i></i></span>
    </div>
    <div class="actions">
      <button class="act like-btn ${isLiked ? "liked" : ""}" data-like="${Number(v.id)}" aria-label="Like" aria-pressed="${isLiked ? "true" : "false"}">${ICONS.heart}</button>
      <button class="act" data-comment-focus="${Number(v.id)}" aria-label="Comment">${ICONS.comment}</button>
      <button class="act" data-share="${Number(v.id)}" aria-label="Share verse card">${ICONS.share}</button>
      <span class="spacer"></span>
      <button class="act save-btn ${isSaved ? "saved" : ""}" data-save="${Number(v.id)}" aria-label="Favourite" aria-pressed="${isSaved ? "true" : "false"}">${ICONS.bookmark}</button>
    </div>
    <p class="caption"><b>@${esc(v.handle)}</b><span class="name-tag">${esc(v.name)} —</span> <span class="reflection-line">${esc(v.reflection)}</span></p>
    ${list.length ? `<button class="comments-link" data-view-comments="${Number(v.id)}">View all ${list.length} comment${list.length > 1 ? "s" : ""}</button><div class="comments">${list.slice(-2).map((c) => `<p class="comment-row"><b>you</b>${esc(c)}</p>`).join("")}</div>` : `<button class="comments-link" data-view-comments="${Number(v.id)}">Add a comment…</button>`}
    <div class="add-comment"><input data-comment-input="${Number(v.id)}" placeholder="Add a comment…" maxlength="140"/><button class="post-btn" data-post-comment="${Number(v.id)}" hidden>Post</button></div>
  </article>`;
}
