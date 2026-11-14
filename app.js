import { VERSES } from "./verses.js";
import { buildFeedOrder, dayOfYear } from "./feed-rotation.js";
import { createPullRefresh } from "./pull-refresh.js";
import { recordStreak } from "./streak.js";
import { todayCardHTML } from "./hero.js";
import { postHTML } from "./feed-card.js";
import { parseReminderTime, reminderNotification } from "./reminders.js";
import { readNotes, writeNote } from "./notes.js";
// bible.js, feasts.js, plans.js, verse-card.js, and plus.js load on demand
// so the home screen does not parse them or the Bible JSON.
const $ = s => document.querySelector(s);
const feedEl = $("#feed"), savedFeedEl = $("#savedFeed"), storiesEl = $("#stories"), toastEl = $("#toast"), burstEl = $("#burst");
let activeTopic = "All", reelIndex = 0, order = [...VERSES], reelPool = [...VERSES];
// Fresh feed, stable day: date-seeded shuffle, unseen verses first, one-step
// rotation per visit — the top of the feed is never the same twice in a row.
try {
  const rot = buildFeedOrder(VERSES, localStorage);
  order = rot.order;
  reelPool = rot.base;
  reelIndex = reelPool.length ? dayOfYear() % reelPool.length : 0;
} catch { order = [...VERSES]; reelPool = [...VERSES]; reelIndex = 0; }
let liked = new Set(), saved = new Set(), comments = {};
try { liked = new Set(JSON.parse(localStorage.getItem("bibleverse-liked")||"[]")); saved = new Set(JSON.parse(localStorage.getItem("bibleverse-saved")||"[]")); comments = JSON.parse(localStorage.getItem("bibleverse-comments")||"{}"); } catch {}
function persist(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{ showToast("Storage unavailable — changes won't be kept"); } }
function persistAll(){ persist("bibleverse-liked",[...liked]); persist("bibleverse-saved",[...saved]); persist("bibleverse-comments",comments); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function showToast(m){ toastEl.textContent=m; toastEl.classList.add("show"); clearTimeout(showToast._t); showToast._t=setTimeout(()=>toastEl.classList.remove("show"),2200); }
function noteFor(id){ return readNotes(localStorage)["verse:"+id] || ""; }
let biblePromise = null;
function loadBible(){
  if(!biblePromise) biblePromise = import("./bible.js").then((mod) => mod.initBible({ showToast }));
  return biblePromise;
}
let feastMod = null;
function ensureFeasts(){
  if(!feastMod){
    feastMod = Promise.all([import("./feasts.js"), import("./feast-links.js")]).then(([cal, links]) => {
      feastMod = { ...cal, ...links };
      return feastMod;
    });
  }
  return Promise.resolve(feastMod);
}
function rankLabel(rank){ return feastMod.rankLabel(rank); }
function rankExplanation(rank){ return feastMod.rankExplanation(rank); }
function feastSources(feast){ return feastMod.feastSources(feast); }
function seasonOf(input){ return feastMod.seasonOf(input); }
function toDate(y, m, d){ return feastMod.toDate(y, m, d); }
function feastsOn(dt){ return feastMod.feastsOn(dt); }
function upcomingFeasts(dt, days){ return feastMod.upcomingFeasts(dt, days); }
function searchFeasts(q, today){ return feastMod.searchFeasts(q, today); }
function massStats(log, today){ return feastMod.massStats(log, today); }
function feastKey(y, m, d){ return feastMod.key(y, m, d); }
function rankDot(rank){ return feastMod.RANK_DOT[rank] || "#9ca3af"; }
function cardOpts(v){ return { liked: liked.has(v.id), saved: saved.has(v.id), comments: comments[v.id] || [] }; }
function filteredFeed(){ return activeTopic === "All" ? order : order.filter(v => v.topic === activeTopic); }
function renderFeed(){
  if(!feedEl) return;
  const list = filteredFeed();
  const keep = feedEl.querySelector("[data-prerender]");
  const sameTop = keep && list[0] && Number(keep.dataset.id) === list[0].id && activeTopic === "All";
  if(sameTop && !(comments[list[0].id] || []).length){
    const likeBtn = keep.querySelector("[data-like]");
    if(likeBtn){ likeBtn.classList.toggle("liked", liked.has(list[0].id)); likeBtn.setAttribute("aria-pressed", liked.has(list[0].id) ? "true" : "false"); }
    const saveBtn = keep.querySelector("[data-save]");
    if(saveBtn){ saveBtn.classList.toggle("saved", saved.has(list[0].id)); saveBtn.setAttribute("aria-pressed", saved.has(list[0].id) ? "true" : "false"); }
    feedEl.querySelectorAll(".post:not([data-prerender])").forEach(node => node.remove());
    feedEl.insertAdjacentHTML("beforeend", list.slice(1).map(v => postHTML(v, cardOpts(v))).join(""));
  } else {
    feedEl.innerHTML = list.map(v => postHTML(v, cardOpts(v))).join("");
  }
  const empty = $("#feedEmpty");
  if(empty) empty.hidden = list.length > 0;
  bindPosts(feedEl);
}
function renderSaved(){
  const list = VERSES.filter(v => saved.has(v.id));
  savedFeedEl.innerHTML = list.map(v => postHTML(v, cardOpts(v))).join("");
  $("#savedEmpty").style.display = list.length ? "none" : "block";
  bindPosts(savedFeedEl);
  updateBadges();
}
function renderGrid(el, list){
  if(!el) return;
  el.innerHTML = list.map(v => `<button class="tile" data-open="${v.id}" style="background:${v.bg};color:${v.fg}"><b>${esc(v.name)}</b><span>${esc(v.ref)}</span></button>`).join("");
  el.querySelectorAll("[data-open]").forEach(t => t.addEventListener("click", () => openVerse(Number(t.dataset.open))));
}
function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9: ]+/g," ").replace(/\s+/g," ").trim(); }
function scoreFeedVerse(v, tokens){
  if(!tokens.length) return 1;
  const name = norm(v.name), ref = norm(v.ref), book = norm(v.book), topic = norm(v.topic), author = norm(v.author+" "+v.handle), text = norm(v.verse+" "+v.reflection);
  let score = 0;
  for(const t of tokens){
    if(!t) continue;
    if(name.includes(t)) score += 5;
    else if(ref.replace(/[: ]/g,"").includes(t.replace(/[: ]/g,"")) || ref.includes(t)) score += 5;
    else if(book && (book === t || book.startsWith(t))) score += 4;
    else if(topic.includes(t) || author.includes(t)) score += 3;
    else if(text.includes(t)) score += 1;
    else return -1;
  }
  // Exact reference matches float to the top.
  if(tokens.length === 1 && norm(v.ref).replace(/\s+/g,"") === tokens[0].replace(/\s+/g,"")) score += 10;
  return score;
}
function renderDiscover(){
  const host = $("#todayHost");
  const verse = order[0];
  if(host && verse){
    host.innerHTML = todayCardHTML(verse, { note: noteFor(verse.id), saved: saved.has(verse.id), kicker: "Today's verse" });
    bindToday(host);
  }
  const pool = VERSES.filter(v => activeTopic === "All" || v.topic === activeTopic);
  renderGrid($("#discoverGrid"), pool);
  const empty = $("#gridEmpty");
  if(empty) empty.hidden = pool.length > 0;
}
let planDays = 0;
function renderProfile(){
  renderGrid($("#profileGrid"), order.slice(0, 9));
  const days = planDays;
  const likedStat = $("#statLiked");
  if(likedStat) likedStat.textContent = String(days);
  const savedStat = $("#statSaved2");
  if(savedStat) savedStat.textContent = String(saved.size);
}
function renderReel(){ const v=reelPool[reelIndex%reelPool.length]; $("#reelCard").innerHTML=`<div class="media" data-dbl="${v.id}" style="background:${v.bg};color:${v.fg}"><p class="media-kicker">Verse of the day · ${esc(v.author)} · ${esc(v.topic)}</p><h2 class="media-name">${esc(v.name)}</h2><p class="media-verse">“${esc(v.verse)}”</p><span class="media-ref">${esc(v.ref)}</span></div>`; $("#reelLikeBtn").textContent=liked.has(v.id)?"♥ Liked":"♡ Like"; bindMedia($("#reelCard")); }
function updateBadges(){ const n = saved.size; const badge = $("#savedBadge"); if(badge){ badge.textContent = n ? String(n) : ""; badge.hidden = n === 0; } const b=$("#tabSavedBadge"); if(b){ b.hidden = n === 0; b.textContent = n ? String(n) : ""; } const savedStat = $("#statSaved2"); if(savedStat) savedStat.textContent = n; }

function renderAll(){ renderFeed(); renderSaved(); renderDiscover(); renderProfile(); renderReel(); updateBadges(); }
function toggleLike(id, burst=false){ const was=liked.has(id); was?liked.delete(id):liked.add(id); persistAll(); renderAll(); if(!was&&burst) popBurst(); if(!was) showToast("Liked ♥"); }
function toggleSave(id){ const was=saved.has(id); was?saved.delete(id):saved.add(id); persistAll(); renderAll(); showToast(was?"Removed from Favourites":"Saved to Favourites"); }
async function shareVerse(id){
  const v=VERSES.find(x=>x.id===id);
  try {
    const { shareVerseCard } = await import("./verse-card.js");
    const how = await shareVerseCard({ title: v.name, verse: v.verse, ref: v.ref, bg: v.bg, fg: v.fg });
    showToast(how === "shared" ? "Verse card ready to send" : "Verse card saved to your downloads");
  } catch {
    const text=`${v.name} — “${v.verse}” ${v.ref}`;
    try { await navigator.clipboard.writeText(text); showToast("Verse copied — paste to share"); } catch { showToast(text); }
  }
}
function copyVerse(id){ const v=VERSES.find(x=>x.id===id); const text=`${v.name} — “${v.verse}” ${v.ref}`; navigator.clipboard?.writeText(text).then(()=>showToast("Verse copied"), ()=>showToast(text)); }
function appInviteText(){ return "BibleVerse — a Christian companion for daily Scripture. A daily feed of named verses to pray with, plus the full Catholic Bible in modern English (73 books, World English Bible Catholic Edition) — readable fully offline: __SITE_URL__/"; }
async function shareApp(copyOnly=false){
  const text = appInviteText();
  const url = /^https?:/.test(location.href) ? location.href : undefined;
  if(!copyOnly && navigator.share){
    try{ await navigator.share(url ? {title:"BibleVerse",text,url} : {title:"BibleVerse",text}); return; }catch{}
  }
  try{ await navigator.clipboard.writeText(url ? `${text} ${url}` : text); showToast(copyOnly ? "Invite text copied" : "Invite copied — paste to share the app"); }
  catch{ showToast(text); }
}
function popBurst(){ burstEl.classList.remove("pop"); void burstEl.offsetWidth; burstEl.classList.add("pop"); }
function bindMedia(root){ root.querySelectorAll("[data-dbl]").forEach(el=>{ let last=0; el.setAttribute("tabindex","0"); el.addEventListener("click",()=>{ const now=Date.now(); if(now-last<320){ toggleLike(Number(el.dataset.dbl), true); } last=now; }); el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleLike(Number(el.dataset.dbl), true); } }); }); }
function bindToday(root){
  root.querySelectorAll("[data-save]").forEach(b => { b.onclick = () => toggleSave(Number(b.dataset.save)); });
  root.querySelectorAll("[data-share]").forEach(b => { b.onclick = () => shareVerse(Number(b.dataset.share)); });
  root.querySelectorAll("[data-note]").forEach(area => {
    area.oninput = () => writeNote(localStorage, "verse:" + area.dataset.note, area.value);
  });
}
function initials(name){ return String(name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
function bindPosts(root){
  if(!root) return;
  bindMedia(root);
  root.querySelectorAll("[data-like]").forEach(b => { b.onclick = () => toggleLike(Number(b.dataset.like)); });
  root.querySelectorAll("[data-save]").forEach(b => { b.onclick = () => toggleSave(Number(b.dataset.save)); });
  root.querySelectorAll("[data-share]").forEach(b => { b.onclick = () => shareVerse(Number(b.dataset.share)); });
  root.querySelectorAll("[data-more]").forEach(b => { b.onclick = () => copyVerse(Number(b.dataset.more)); });
  root.querySelectorAll("[data-comment-focus],[data-view-comments]").forEach(b => b.onclick = () => {
    const id = b.dataset.commentFocus || b.dataset.viewComments;
    root.querySelector(`[data-comment-input="${id}"]`)?.focus();
  });
  root.querySelectorAll("[data-comment-input]").forEach(inp => {
    const btn = root.querySelector(`[data-post-comment="${inp.dataset.commentInput}"]`);
    inp.oninput = () => { if(btn) btn.hidden = !inp.value.trim(); };
    inp.onkeydown = (e) => { if(e.key === "Enter") btn?.click(); };
  });
  root.querySelectorAll("[data-post-comment]").forEach(b => { b.onclick = () => {
    const id = Number(b.dataset.postComment);
    const inp = root.querySelector(`[data-comment-input="${id}"]`);
    const text = inp?.value.trim();
    if(!text) return;
    (comments[id] ??= []).push(text);
    persistAll();
    renderAll();
    showToast("Comment posted");
  }; });
}
function openVerse(id){
  activeTopic = "All";
  const search = $("#homeSearch");
  if(search) search.value = "";
  const results = $("#homeResults");
  if(results){ results.hidden = true; results.innerHTML = ""; }
  showFeed(true);
  renderStories();
  switchView("feed");
  requestAnimationFrame(() => { document.querySelector(`.post[data-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }); });
}
function renderStories(){
  const topics = ["All", ...new Set(VERSES.map(v => v.topic))];
  if(storiesEl){
    storiesEl.innerHTML = topics.map(t => {
      const v = VERSES.find(x => x.topic === t) || VERSES[0];
      return `<button class="story ${activeTopic === t ? "active" : ""}" data-story="${esc(t)}"><span class="story-ring ${activeTopic === t ? "active" : ""}"><span class="story-avatar" style="background:${t === "All" ? "#000" : v.bg}">${t === "All" ? "✦" : esc(initials(t))}</span></span><span>${esc(t)}</span></button>`;
    }).join("");
    storiesEl.querySelectorAll("[data-story]").forEach(s => s.addEventListener("click", () => {
      activeTopic = s.dataset.story;
      renderStories();
      renderFeed();
      renderDiscover();
      $("#scrollArea").scrollTo({ top: 0, behavior: "smooth" });
    }));
  }
  const chips = $("#topicChips");
  if(!chips) return;
  chips.innerHTML = topics.map(t => `<button class="chip ${activeTopic === t ? "active" : ""}" data-chip="${esc(t)}">${esc(t)}</button>`).join("");
  chips.querySelectorAll("[data-chip]").forEach(c => c.addEventListener("click", () => {
    activeTopic = c.dataset.chip;
    renderStories();
    renderFeed();
    renderDiscover();
  }));
}
function showFeed(on){
  const stories = document.getElementById("stories");
  const feed = document.getElementById("feed");
  const end = document.querySelector(".feed-end");
  if(stories) stories.hidden = !on;
  if(feed) feed.hidden = !on;
  if(end) end.hidden = !on;
  if(!on){ const empty = document.getElementById("feedEmpty"); if(empty) empty.hidden = true; }
}

// ---------- Feasts & Saints ----------
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const SEASON_LINE = { Advent: "Prepare the way of the Lord.", Christmas: "Christ is born! Glorify him.", Lent: "Pray, fast, and give.", Triduum: "Behold the wood of the Cross.", Easter: "Christ is risen! Alleluia.", "Ordinary Time": "Grow in grace, day by day." };
let calY = null, calM = null, calSel = null;
let homeTimer = 0;
async function renderHomeSearch(){
  const input = $("#homeSearch");
  const box = $("#homeResults");
  if(!input || !box) return;
  const q = input.value.trim();
  if(q.length < 2){ box.hidden = true; box.innerHTML = ""; showFeed(true); return; }
  await ensureFeasts();
  const bible = await loadBible();
  showFeed(false);
  box.hidden = false;
  const tokens = norm(q).split(" ").filter(Boolean);
  const named = VERSES.map(v => ({ v, s: scoreFeedVerse(v, tokens) })).filter(x => x.s >= 0).sort((a,b) => b.s - a.s).slice(0, 6).map(x => x.v);
  const feasts = searchFeasts(q).slice(0, 5);
  let bibleHits = [];
  try { bibleHits = await bible.findVerses(q); } catch {}
  if(input.value.trim() !== q) return;
  const row = (html) => html || `<p class="view-sub">Nothing matched.</p>`;
  box.innerHTML = `<h3 class="result-label">Named verses</h3>${row(named.map(v => `<button type="button" class="result-row" data-open-verse="${v.id}"><b>${esc(v.name)}</b><span>${esc(v.ref)}</span></button>`).join(""))}
    <h3 class="result-label">Bible</h3>${row(bibleHits.map(h => `<button type="button" class="result-row" data-open-bible="${h.book}:${h.chapter}:${h.verse}"><b>${esc(h.ref)}</b><span>${esc(h.text)}</span></button>`).join(""))}
    <h3 class="result-label">Feasts</h3>${row(feasts.map(f => `<button type="button" class="result-row" data-open-feast="${stashFeast(f)}"><b>${esc(f.name)}</b><span>${esc(rankLabel(f.rank))}</span></button>`).join(""))}`;
  box.querySelectorAll("[data-open-verse]").forEach(b => { b.onclick = () => openVerse(Number(b.dataset.openVerse)); });
  box.querySelectorAll("[data-open-bible]").forEach(b => { b.onclick = async () => {
    const [book, chapter, verse] = b.dataset.openBible.split(":").map(Number);
    switchView("bible");
    await bible.openChapter(book, chapter);
    const line = document.querySelector(`#verses [data-verse="${verse}"]`);
    if(line){ line.scrollIntoView({ block: "center" }); line.click(); }
  }; });
  box.querySelectorAll("[data-open-feast]").forEach(b => { b.onclick = () => {
    const feast = feastById.get(b.dataset.openFeast);
    if (feast) openFeastSheet(feast);
  }; });
}
async function renderPlans(){
  const host = $("#plans");
  if(!host) return;
  const { startablePlans, lockedPlans, readPlanProgress, togglePlanDay } = await import("./plans.js");
  const plusOn = window.BIBLEVERSE_SITE?.plusEnabled === true;
  planDays = readPlanProgress(localStorage, "psalms-comfort").length + readPlanProgress(localStorage, "gospels-30").length;
  const cards = startablePlans(plusOn).map(plan => {
    const done = readPlanProgress(localStorage, plan.id);
    const next = plan.readings.findIndex((_, i) => !done.includes(i));
    const index = next === -1 ? Math.max(plan.readings.length - 1, 0) : next;
    const reading = plan.readings[index];
    if(!reading) return "";
    return `<article class="plan-card"><p class="reflect-kicker">${esc(plan.length)}</p><h3>${esc(plan.title)}</h3><p class="view-sub">${done.length} of ${plan.readings.length} days marked on this device</p><p><b>${esc(reading.ref)}</b> — ${esc(reading.prompt)}</p><div class="reflect-actions"><button type="button" class="ig-btn" data-plan-ref="${esc(reading.ref)}">Read</button><button type="button" class="ig-btn ghost" data-plan-done="${esc(plan.id)}" data-plan-day="${index}">${done.includes(index) ? "Marked" : "Mark read"}</button></div></article>`;
  }).join("");
  const locked = lockedPlans(plusOn).map(plan => `<article class="plan-card plan-locked"><p class="reflect-kicker">Plus</p><h3>${esc(plan.title)}</h3><p class="view-sub">${esc(plan.length)}. This longer plan stays off until Plus is turned on.</p></article>`).join("");
  host.innerHTML = `<h2 class="view-title">Reading plans</h2>${cards}${locked}`;
  host.querySelectorAll("[data-plan-ref]").forEach(b => { b.onclick = () => { switchView("feed"); $("#homeSearch").value = b.dataset.planRef; renderHomeSearch(); }; });
  host.querySelectorAll("[data-plan-done]").forEach(b => { b.onclick = () => { togglePlanDay(localStorage, b.dataset.planDone, Number(b.dataset.planDay)); renderPlans(); renderProfile(); }; });
}
async function saveReminder(){
  const value = $("#reminderTime").value;
  const parsed = parseReminderTime(value);
  if(!parsed){ showToast("Choose a valid time"); return; }
  localStorage.setItem("bibleverse-reminder", value);
  const native = window.Capacitor?.isNativePlatform?.();
  if(!native){
    $("#reminderHelp").textContent = `Saved ${value} on this device. The daily alert is delivered by the installed iPhone and Android app, not by the browser.`;
    showToast("Time saved. Alerts need the installed app.");
    return;
  }
  const plugin = window.Capacitor.Plugins?.LocalNotifications;
  if(!plugin?.schedule){ showToast("Notifications are not in this build yet."); return; }
  const perm = await plugin.requestPermissions();
  if(perm.display !== "granted"){ showToast("Turn on notifications in system settings."); return; }
  await plugin.cancel({ notifications: [{ id: 1 }] });
  await plugin.schedule({ notifications: [reminderNotification(parsed)] });
  showToast("Daily reminder set for " + value);
}
const feastById = new Map();
function stashFeast(f){
  const id = String(feastById.size + 1);
  feastById.set(id, f);
  return id;
}
function feastRows(list){
  if(!list.length) return "";
  return `<div class="feast-list">` + list.map(f => `<button type="button" class="feast-row" data-feast-open="${stashFeast(f)}"><span class="rank ${esc(f.rank)}">${esc(rankLabel(f.rank))}</span><div><b>${esc(f.name)}</b><small>${esc(f.about || "")}</small>${f.obligation?`<span class="obl">✦ Holy Day of Obligation</span>`:""}</div></button>`).join("") + `</div>`;
}
async function openFeastSheet(feast){
  if(!feast) return;
  await ensureFeasts();
  const sheet = $("#feastSheet");
  const season = seasonOf(toDate(feast.y, feast.m, feast.d));
  const when = `${WEEKDAYS[toDate(feast.y, feast.m, feast.d).getDay()]}, ${MONTHS[feast.m - 1]} ${feast.d}, ${feast.y}`;
  $("#feastSheetRank").className = `rank ${feast.rank || ""}`;
  $("#feastSheetRank").textContent = rankLabel(feast.rank);
  $("#feastSheetRankNote").textContent = rankExplanation(feast.rank);
  $("#feastSheetTitle").textContent = feast.name;
  $("#feastSheetWhen").textContent = when;
  $("#feastSheetSeason").textContent = season.name;
  $("#feastSheetAbout").textContent = feast.about || "A day on the General Roman Calendar.";
  $("#feastSheetObligation").hidden = !feast.obligation;
  const links = feastSources(feast);
  for (const [id, href] of [["feastLinkVatican", links.vatican], ["feastLinkWiki", links.wikipedia], ["feastLinkGrok", links.grokipedia]]) {
    const a = document.getElementById(id);
    a.href = href;
    a.hidden = false;
  }
  $("#feastSheetLinks").hidden = false;
  sheet.showModal();
}
async function openRankSheet(rank){
  await ensureFeasts();
  const sheet = $("#feastSheet");
  $("#feastSheetRank").className = `rank ${rank}`;
  $("#feastSheetRank").textContent = rankLabel(rank);
  $("#feastSheetRankNote").textContent = rankExplanation(rank);
  $("#feastSheetTitle").textContent = rankLabel(rank);
  $("#feastSheetWhen").textContent = "";
  $("#feastSheetSeason").textContent = "";
  $("#feastSheetAbout").textContent = "This is the rank shown on the calendar, not a particular saint.";
  $("#feastSheetObligation").hidden = true;
  $("#feastSheetLinks").hidden = true;
  sheet.showModal();
}
async function renderFeasts(){
  await ensureFeasts();
  const now = new Date();
  if(calY === null){ calY = now.getFullYear(); calM = now.getMonth() + 1; calSel = { y: calY, m: calM, d: now.getDate() }; }
  const season = seasonOf(now), todayList = feastsOn(now);
  const todayOpen = todayList[0] ? ` data-feast-open="${stashFeast({ ...todayList[0], y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() })}"` : "";
  $("#feastToday").innerHTML = `<button type="button" class="season-card" style="--season:${season.color}"${todayOpen}><small>${esc(season.name)} · Today</small><b>${todayList.length ? esc(todayList.map(f=>f.name).join(" · ")) : "An Ordinary weekday"}</b><span>${todayList.length && todayList[0].about ? esc(todayList[0].about) : esc(SEASON_LINE[season.name] || "")}</span></button>`;
  $("#tabFeastDot").hidden = !todayList.some(f=>f.obligation);
  renderMass(now);
  $("#calTitle").textContent = `${MONTHS[calM-1]} ${calY}`;
  const first = new Date(calY, calM-1, 1).getDay(), dim = new Date(calY, calM, 0).getDate();
  const tY = now.getFullYear(), tM = now.getMonth()+1, tD = now.getDate();
  let cells = ["S","M","T","W","T","F","S"].map(d=>`<span class="cal-dow">${d}</span>`).join("");
  for(let i=0;i<first;i++) cells += `<span class="cal-day blank"></span>`;
  for(let d=1; d<=dim; d++){
    const items = feastsOn(toDate(calY, calM, d));
    const cls = ["cal-day"];
    if(new Date(calY, calM-1, d).getDay()===0) cls.push("sun");
    if(calY===tY && calM===tM && d===tD) cls.push("today");
    if(calSel && calSel.y===calY && calSel.m===calM && calSel.d===d) cls.push("sel");
    const dots = items.slice(0,3).map(f=>`<i style="background:${rankDot(f.rank)}"></i>`).join("");
    cells += `<button class="${cls.join(" ")}" data-cal="${d}" aria-label="${MONTHS[calM-1]} ${d}${items.length?": "+esc(items.map(f=>f.name).join(", ")):""}">${d}${dots?`<span class="dots">${dots}</span>`:""}</button>`;
  }
  const grid = $("#calGrid");
  grid.innerHTML = cells;
  grid.querySelectorAll("[data-cal]").forEach(b=>b.addEventListener("click",()=>{ calSel = { y: calY, m: calM, d: Number(b.dataset.cal) }; renderFeasts(); }));
  const selList = feastsOn(toDate(calSel.y, calSel.m, calSel.d));
  const selSeason = seasonOf(toDate(calSel.y, calSel.m, calSel.d));
  $("#feastDetail").innerHTML = `<h3 class="view-subtitle">${WEEKDAYS[toDate(calSel.y, calSel.m, calSel.d).getDay()]}, ${MONTHS[calSel.m-1]} ${calSel.d} · ${esc(selSeason.name)}</h3>` +
    (selList.length ? feastRows(selList) : `<p class="view-sub">No feast this day — an Ordinary (ferial) day.</p>`);
  $("#feastUpcoming").innerHTML = upcomingFeasts(now, 10).map(g=>{
    const when = g.inDays === 1 ? "Tomorrow" : `in ${g.inDays} days`;
    const primary = { ...g.items[0], y: g.y, m: g.m, d: g.d };
    return `<button type="button" class="up-row" data-feast-open="${stashFeast(primary)}"><span class="up-date"><b>${g.d}</b><span>${MON_ABBR[g.m-1]}</span></span><span class="up-main">${esc(g.items.map(f=>f.name).join(" · "))}<small>${esc(rankLabel(g.items[0].rank))}${g.items.some(f=>f.obligation)?" · ✦ Holy Day of Obligation":""}</small></span><span class="up-when${g.inDays<=7?" soon":""}">${when}</span></button>`;
  }).join("");
}
function massLog(){
  try { const v = JSON.parse(localStorage.getItem("bibleverse-mass")||"[]"); return Array.isArray(v) ? v : []; }
  catch { return []; }
}
function renderMass(now){
  const stats = massStats(massLog(), now);
  const sun = stats.lastSunday;
  const sunDate = toDate(sun.y, sun.m, sun.d);
  const sunLabel = `${WEEKDAYS[sunDate.getDay()]}, ${MONTHS[sun.m-1]} ${sun.d}`;
  const daysUntil = (7 - now.getDay()) % 7;
  const nextLabel = daysUntil === 0 ? (stats.logged ? "See you next Sunday" : "Today") : `in ${daysUntil} day${daysUntil>1?"s":""}`;
  const sub = stats.total === 0
    ? `Sundays kept holy · Last: ${sunLabel} · Next: ${nextLabel}`
    : `${stats.total} Sunday${stats.total>1?"s":""} kept · ${stats.streak}-week streak · Next: ${nextLabel}`;
  $("#massCard").innerHTML = `<div class="mass-card${stats.logged?" logged":""}"><span class="mass-count">${stats.total}</span><span class="mass-main"><b>Sunday Mass</b><span>${esc(sub)}</span></span>${stats.logged?`<span class="mass-done">✓</span>`:`<button class="ig-btn" id="massLogBtn">I went</button>`}</div>`;
  $("#massLogBtn")?.addEventListener("click",()=>{
    const log = massLog();
    const k = feastKey(sun.y, sun.m, sun.d);
    if(!log.includes(k)) log.push(k);
    persist("bibleverse-mass", log);
    renderMass(new Date());
    showToast("Sunday Mass logged ✓");
  });
}
async function renderFeastSearch(){
  await ensureFeasts();
  const q = $("#feastSearch").value || "";
  const box = $("#feastSearchResults");
  if(!q.trim()){ box.innerHTML = ""; return; }
  const hits = searchFeasts(q, new Date());
  if(!hits.length){ box.innerHTML = `<p class="view-sub">No feasts or saints match “${esc(q.trim())}”. Try fewer words.</p>`; return; }
  const now = new Date();
  box.innerHTML = hits.map(h=>{
    const dd = Math.round((toDate(h.y,h.m,h.d) - now) / 864e5);
    const when = dd <= 0 ? "Today" : (dd === 1 ? "Tomorrow" : `in ${dd} days`);
    return `<button type="button" class="up-row" data-feast-open="${stashFeast(h)}"><span class="up-date"><b>${h.d}</b><span>${MON_ABBR[h.m-1]}${h.y!==now.getFullYear()?" "+String(h.y).slice(2):""}</span></span><span class="up-main">${esc(h.name)}<small>${esc(rankLabel(h.rank))}${h.obligation?" · ✦ Holy Day of Obligation":""}</small></span><span class="up-when${dd<=7?" soon":""}">${when}</span></button>`;
  }).join("");
}
const VIEWS = new Set(["feed","discover","reel","bible","saved","feasts","profile","about","privacy","support","plus"]);
const navStack = [];
function viewFromLocation(){
  const name = (location.hash || "").replace(/^#/, "");
  return VIEWS.has(name) ? name : "feed";
}
function hashFor(name){
  return name === "feed" ? location.pathname + location.search : location.pathname + location.search + "#" + name;
}
function switchView(name, opts = {}){
  if(!VIEWS.has(name)) name = "feed";
  document.querySelectorAll(".view").forEach(v=>v.hidden = v.id !== "view-"+name);
  const shown = document.getElementById("view-"+name);
  if(shown && !opts.quiet){ shown.classList.remove("is-entering"); void shown.offsetWidth; shown.classList.add("is-entering"); }
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  $("#scrollArea").scrollTo({top:0});
  if(name==="reel") renderReel();
  if(name==="bible") loadBible().then((bible) => bible.ensureLoaded());
  if(name==="feasts") renderFeasts();
  if(opts.fromHistory) return;
  if(opts.replace){
    if(!navStack.length) navStack.push(name);
    else navStack[navStack.length - 1] = name;
    history.replaceState({ view: name }, "", hashFor(name));
    return;
  }
  if(navStack[navStack.length - 1] === name) return;
  navStack.push(name);
  history.pushState({ view: name }, "", hashFor(name));
}
function goBack(fallback){
  if(navStack.length > 1) history.back();
  else switchView(fallback, { replace: true });
}
window.addEventListener("popstate", () => {
  const name = viewFromLocation();
  while(navStack.length > 1 && navStack[navStack.length - 1] !== name) navStack.pop();
  if(navStack[navStack.length - 1] !== name) navStack.push(name);
  switchView(name, { fromHistory: true });
});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchView(t.dataset.view)));
$("#searchInput")?.addEventListener("input", renderDiscover);
$("#feastSearch").addEventListener("input", renderFeastSearch);
$("#view-feasts").addEventListener("click", (event) => {
  const feastBtn = event.target.closest("[data-feast-open]");
  if (feastBtn) { openFeastSheet(feastById.get(feastBtn.dataset.feastOpen)); return; }
  const rankBtn = event.target.closest("[data-rank-info]");
  if (rankBtn) openRankSheet(rankBtn.dataset.rankInfo);
});
$("#clearFilterBtn")?.addEventListener("click",()=>{ activeTopic="All"; renderStories(); renderAll(); });
$("#calPrevBtn").addEventListener("click",()=>{ calM--; if(calM<1){ calM=12; calY--; } renderFeasts(); });
$("#calNextBtn").addEventListener("click",()=>{ calM++; if(calM>12){ calM=1; calY++; } renderFeasts(); });
$("#calTodayBtn").addEventListener("click",()=>{ const n=new Date(); calY=n.getFullYear(); calM=n.getMonth()+1; calSel={ y: calY, m: calM, d: n.getDate() }; renderFeasts(); $("#scrollArea").scrollTo({ top: 0, behavior: "smooth" }); });
function shuffleOrder(){ for(let i=order.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; } }
$("#shuffleBtn").addEventListener("click",()=>{ shuffleOrder(); renderAll(); switchView("feed"); showToast("Feed shuffled ⇄"); });
createPullRefresh({
  scroller: $("#scrollArea"), box: $("#pullRefresh"), pill: $("#pullPill"), icon: $("#pullIcon"), label: $("#pullText"),
  canPull: () => !$("#view-feed").hidden,
  onRefresh: () => { shuffleOrder(); renderAll(); },
});
$("#reelNextBtn").addEventListener("click",()=>{ reelIndex=(reelIndex+1)%reelPool.length; renderReel(); });
$("#reelLikeBtn").addEventListener("click",()=>toggleLike(reelPool[reelIndex%reelPool.length].id, true));
$("#newPostBtn").addEventListener("click",()=>switchView("reel"));
$("#notifBtn").addEventListener("click",()=>switchView("saved"));
$("#shareAppBtn").addEventListener("click",()=>shareApp());
$("#wordmarkBtn").addEventListener("click",()=>switchView("profile"));
$("#profileShareBtn").addEventListener("click",()=>shareApp());
$("#aboutBtn").addEventListener("click",()=>switchView("about"));
$("#aboutBackBtn").addEventListener("click",()=>goBack("profile"));
$("#privacyBtn").addEventListener("click",()=>switchView("privacy"));
$("#aboutPrivacyBtn").addEventListener("click",()=>switchView("privacy"));
$("#privacyBackBtn").addEventListener("click",()=>goBack("profile"));
$("#supportBtn").addEventListener("click",()=>switchView("support"));
$("#supportBackBtn").addEventListener("click",()=>goBack("profile"));
$("#plusBtn").addEventListener("click",()=>{ renderPlus(); switchView("plus"); });
$("#plusBackBtn").addEventListener("click",()=>goBack("profile"));
$("#plusBuyBtn").addEventListener("click",()=>showToast("Purchases are not turned on"));
$("#plusRestoreBtn").addEventListener("click", async () => {
  const { readEntitlement } = await import("./plus.js");
  showToast(readEntitlement(localStorage).active ? "Plus is already on this device" : "No purchases to restore");
});
$("#themeBtn").addEventListener("click", cycleTheme);
$("#streakCard").addEventListener("click",()=>switchView("reel"));
$("#homeSearch")?.addEventListener("input", () => { clearTimeout(homeTimer); homeTimer = setTimeout(renderHomeSearch, 200); });
$("#reminderSave")?.addEventListener("click", () => saveReminder());
const remembered = localStorage.getItem("bibleverse-reminder");
if(remembered && $("#reminderTime")) $("#reminderTime").value = remembered;
const scheduleIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
scheduleIdle(() => { renderPlans(); });
$("#aboutShareBtn").addEventListener("click",()=>shareApp());
$("#aboutCopyBtn").addEventListener("click",()=>shareApp(true));
function openExternal(url){
  const browser = window.Capacitor?.Plugins?.Browser;
  if(browser?.open){ browser.open({ url }).catch(()=>{}); return; }
  window.open(url, "_blank", "noopener,noreferrer");
}
function wireNativeShell(){
  const cap = window.Capacitor;
  if(!cap?.isNativePlatform?.()) return;
  document.body.classList.add("native");
  cap.Plugins?.SystemBars?.setStyle?.({ style: "LIGHT" })?.catch?.(()=>{});
  const app = cap.Plugins?.App;
  app?.addListener?.("backButton", () => {
    if(navStack.length > 1) history.back();
    else app.exitApp();
  });
  document.addEventListener("click", (event) => {
    const a = event.target.closest?.("a[href]");
    if(!a) return;
    const href = a.getAttribute("href") || "";
    if(!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if(url.protocol !== "http:" && url.protocol !== "https:") return;
    if(url.origin === location.origin) return;
    event.preventDefault();
    openExternal(url.href);
  });
}
wireNativeShell();
$("#scrollArea").addEventListener("scroll",e=>{ document.querySelector(".appbar").classList.toggle("scrolled", e.target.scrollTop>8); },{passive:true});
function tickClock(){ const d=new Date(); $("#clock").textContent=d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}).replace(/\s?[AP]M/i,""); }
tickClock(); setInterval(tickClock, 20000);
const THEME_CYCLE = ["system", "light", "dark"];
function resolvedTheme(choice){
  if(choice === "light" || choice === "dark") return choice;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(choice){
  document.documentElement.dataset.theme = resolvedTheme(choice);
  const label = choice === "dark" ? "Dark" : choice === "light" ? "Light" : "System";
  const node = $("#themeValue");
  if(node) node.textContent = label;
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = resolvedTheme(choice) === "dark" ? "#141311" : "#ffffff";
}
function cycleTheme(){
  const current = localStorage.getItem("bibleverse-theme") || "system";
  const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
  localStorage.setItem("bibleverse-theme", next);
  applyTheme(next);
}
function renderStreak(){
  const streak = recordStreak(localStorage);
  const chip = $("#streakCard");
  if(chip) chip.textContent = streak.count === 1 ? "Day 1" : `Day ${streak.count}`;
  $("#profileStreak").textContent = streak.count === 1 ? "1 day streak" : `${streak.count} day streak · best ${streak.best}`;
  const stat = $("#streakStat");
  if(stat) stat.textContent = String(streak.count);
}
async function renderPlus(){
  const { siteConfig, purchaseAvailability, readEntitlement } = await import("./plus.js");
  const site = siteConfig();
  const platform = window.Capacitor?.getPlatform?.() || "web";
  const offer = purchaseAvailability(site, platform);
  const owned = readEntitlement(localStorage).active;
  const status = $("#plusStatus");
  const buy = $("#plusBuyBtn");
  if(owned){
    status.textContent = "Plus is on for this device.";
    buy.textContent = "Plus is on";
    buy.disabled = true;
    return;
  }
  if(!offer.ready){
    status.textContent = "Purchases are not turned on. Nothing will be charged.";
    buy.textContent = "Purchases are not turned on";
    buy.disabled = true;
    return;
  }
  status.textContent = "Store purchases can be connected for entitlement “" + offer.entitlementId + "”.";
  buy.textContent = "Continue with the store";
  buy.disabled = true;
}
window.BibleVerseCards = { shareVerseCard: async (opts) => (await import("./verse-card.js")).shareVerseCard(opts) };
applyTheme(localStorage.getItem("bibleverse-theme") || "system");
renderStreak();
const startView = viewFromLocation();
navStack.push(startView);
history.replaceState({ view: startView }, "", hashFor(startView));
if(startView !== "feed") switchView(startView, { fromHistory: true });
renderStories();
renderFeed();
updateBadges();
const paintRest = () => { renderSaved(); renderDiscover(); renderProfile(); renderReel(); };
if (startView === "feed" && typeof requestAnimationFrame === "function") requestAnimationFrame(paintRest);
else paintRest();
// Web/PWA offline: cache shell + full Bible. Native (Capacitor) apps already
// carry every file in the bundle, so skip the service worker there.
if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
