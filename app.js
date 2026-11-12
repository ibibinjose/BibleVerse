const PALETTES = [
  { bg:"#7c2d12", fg:"#fff7ed" }, { bg:"#134e4a", fg:"#f0fdfa" }, { bg:"#7f1d1d", fg:"#fef2f2" },
  { bg:"#14532d", fg:"#f0fdf4" }, { bg:"#1e3a2f", fg:"#ecfdf5" }, { bg:"#831843", fg:"#fdf2f8" },
  { bg:"#713f12", fg:"#fefce8" }, { bg:"#0f2e2a", fg:"#f0fdfa" }, { bg:"#431407", fg:"#fff7ed" },
  { bg:"#3b1d0f", fg:"#fef3c7" },
];
const RAW = [
  ["Light in the Darkness","The light shines in the darkness, and the darkness has not overcome it.","John 1:5","John","Hope","Darkness is real, but it does not get the final word.",2841,"2 HOURS AGO"],
  ["Peace That Guards","And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.","Philippians 4:7","Philippians","Peace","Peace here is not the absence of trouble — it is a guard on duty.",1932,"4 HOURS AGO"],
  ["Strength for Today","But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.","Isaiah 40:31","Isaiah","Strength","Waiting on God is not wasted time. It is how strength is renewed.",3104,"6 HOURS AGO"],
  ["Loved Without End","Neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.","Romans 8:38–39","Romans","Love","Nothing you have done — and nothing done to you — can cut this cord.",4210,"8 HOURS AGO"],
  ["Do Not Be Afraid","Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.","Joshua 1:9","Joshua","Courage","Courage is not feeling brave. It is moving forward with God beside you.",2677,"12 HOURS AGO"],
  ["The Lord Is My Shepherd","The Lord is my shepherd, I lack nothing.","Psalm 23:1","Psalms","Peace","If the Shepherd leads, lack is not your story.",5120,"16 HOURS AGO"],
  ["New Every Morning","Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.","Lamentations 3:22–23","Lamentations","Hope","Yesterday's mercy ran out. Today's arrived fresh this morning.",1988,"20 HOURS AGO"],
  ["Be Still","Be still, and know that I am God.","Psalm 46:10","Psalms","Peace","Stillness is not giving up. It is remembering who is in control.",3345,"1 DAY AGO"],
  ["Plans to Prosper You","For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.","Jeremiah 29:11","Jeremiah","Hope","Your future is not an accident. It is held by a good Planner.",6021,"1 DAY AGO"],
];
const RAW2 = [
  ["Love Never Fails","Love always protects, always trusts, always hopes, always perseveres. Love never fails.","1 Corinthians 13:7–8","1 Corinthians","Love","Love is not just a feeling in this verse — it is a way of holding on.",3870,"1 DAY AGO"],
  ["Grace Upon Grace","Out of his fullness we have all received grace in place of grace already given.","John 1:16","John","Grace","Grace does not run dry. One wave is replaced by another.",1544,"2 DAYS AGO"],
  ["Joy Comes in the Morning","Weeping may stay for the night, but rejoicing comes in the morning.","Psalm 30:5","Psalms","Joy","The night is a season, not a lifetime.",2290,"2 DAYS AGO"],
  ["Walk by Faith","For we live by faith, not by sight.","2 Corinthians 5:7","2 Corinthians","Faith","You do not need to see the whole road to take the next step.",1765,"2 DAYS AGO"],
  ["Anchor for the Soul","We have this hope as an anchor for the soul, firm and secure.","Hebrews 6:19","Hebrews","Hope","Hope is not wishful thinking here. It is an anchor that holds in a storm.",2013,"3 DAYS AGO"],
  ["God Is With You","So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.","Isaiah 41:10","Isaiah","Courage","You are not being asked to hold yourself up alone.",2988,"3 DAYS AGO"],
  ["Ask, Seek, Knock","Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.","Matthew 7:7","Matthew","Faith","Prayer is pictured as persistence — keep asking, keep seeking, keep knocking.",1432,"3 DAYS AGO"],
  ["Fruit of the Spirit","But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.","Galatians 5:22–23","Galatians","Grace","Fruit grows. It is not forced. Stay rooted and watch what forms.",1876,"4 DAYS AGO"],
  ["In the Beginning","In the beginning God created the heavens and the earth.","Genesis 1:1","Genesis","Faith","Every good story in Scripture starts with a Creator who brings order from nothing.",4520,"4 DAYS AGO"],
];
const AUTHORS = {
  Genesis: ["Moses", "moses"], Joshua: ["Joshua", "joshua"], Psalms: ["David", "david"],
  Isaiah: ["Isaiah", "isaiah"], Jeremiah: ["Jeremiah", "jeremiah"], Lamentations: ["Jeremiah", "jeremiah"],
  Matthew: ["Matthew", "matthew"], John: ["John", "john"], Romans: ["Paul", "paul"],
  "1 Corinthians": ["Paul", "paul"], "2 Corinthians": ["Paul", "paul"], Galatians: ["Paul", "paul"],
  Philippians: ["Paul", "paul"], Hebrews: ["Hebrews", "hebrews"],
};
function authorOf(book){ return AUTHORS[book] || [book, book.toLowerCase().replace(/[^a-z0-9]+/g, "")]; }
export const VERSES = [...RAW, ...RAW2].map((r,i)=>{ const [author, handle] = authorOf(r[3]); return { id:i+1, name:r[0], verse:r[1], ref:r[2], book:r[3], topic:r[4], reflection:r[5], baseLikes:r[6], time:r[7], author, handle, ...PALETTES[i % PALETTES.length] }; });

import { initBible } from "./bible.js";
const $ = s => document.querySelector(s);
const feedEl = $("#feed"), savedFeedEl = $("#savedFeed"), storiesEl = $("#stories"), toastEl = $("#toast"), burstEl = $("#burst");
let activeTopic = "All", reelIndex = 0, order = [...VERSES];
let liked = new Set(), saved = new Set(), comments = {};
try { liked = new Set(JSON.parse(localStorage.getItem("bibleverse-liked")||"[]")); saved = new Set(JSON.parse(localStorage.getItem("bibleverse-saved")||"[]")); comments = JSON.parse(localStorage.getItem("bibleverse-comments")||"{}"); } catch {}
function persist(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{ showToast("Storage unavailable — changes won't be kept"); } }
function persistAll(){ persist("bibleverse-liked",[...liked]); persist("bibleverse-saved",[...saved]); persist("bibleverse-comments",comments); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function showToast(m){ toastEl.textContent=m; toastEl.classList.add("show"); clearTimeout(showToast._t); showToast._t=setTimeout(()=>toastEl.classList.remove("show"),2200); }
function fmt(n){ return n>=1000 ? (n/1000).toFixed(1).replace(".0","")+"k" : String(n); }
function initials(name){ return name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
const ICONS = {
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20.5s-7.5-4.6-9.3-9C1.2 8 3.2 4.9 6.4 4.9c2 0 3.4 1.1 5.6 3.4 2.2-2.3 3.6-3.4 5.6-3.4 3.2 0 5.2 3.1 3.7 6.6-1.8 4.4-9.3 9-9.3 9Z"/></svg>',
  comment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3c5.2 0 9.5 3.8 9.5 8.5S17.2 20 12 20c-1.1 0-2.2-.17-3.2-.5L3 20l.9-3.4C3.3 15.2 2.5 13.4 2.5 11.5 2.5 6.8 6.8 3 12 3Z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke-linejoin="round"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 3h12v18l-6-4.5L6 21V3Z" stroke-linejoin="round"/></svg>',
  verified:'<svg class="verified" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#0095f6"/><path d="M10.7 15.3l-3.2-3.2 1.5-1.5 1.7 1.7 5.7-5.7 1.5 1.5z" fill="#fff"/></svg>',
};

function postHTML(v){
  const isLiked = liked.has(v.id), isSaved = saved.has(v.id), list = comments[v.id]||[];
  const likes = v.baseLikes + (isLiked?1:0);
  return `<article class="post" data-id="${v.id}">
    <div class="post-head">
      <span class="avatar" style="background:${v.bg}">${esc(initials(v.author))}</span>
      <div class="post-user"><b>${esc(v.author)} ${ICONS.verified}</b><small>@${esc(v.handle)} · ${esc(v.ref)} · ${esc(v.topic)}</small></div>
      <button class="follow-btn" data-follow="${v.id}">Follow</button>
      <button class="more-btn" data-more="${v.id}" aria-label="More options">···</button>
    </div>
    <div class="media" data-dbl="${v.id}" style="background:${v.bg};color:${v.fg}" role="img" aria-label="${esc(v.name)} — ${esc(v.ref)}">
      <p class="media-kicker">${esc(v.topic)} · ${esc(v.book)}</p>
      <h2 class="media-name">${esc(v.name)}</h2>
      <p class="media-verse">“${esc(v.verse)}”</p>
      <span class="media-ref">${esc(v.ref)}</span>
      <span class="media-dots"><i class="on"></i><i></i><i></i></span>
    </div>
    <div class="actions">
      <button class="act like-btn ${isLiked?"liked":""}" data-like="${v.id}" aria-label="Like">${ICONS.heart}</button>
      <button class="act" data-comment-focus="${v.id}" aria-label="Comment">${ICONS.comment}</button>
      <button class="act" data-share="${v.id}" aria-label="Share">${ICONS.share}</button>
      <span class="spacer"></span>
      <button class="act save-btn ${isSaved?"saved":""}" data-save="${v.id}" aria-label="Save">${ICONS.bookmark}</button>
    </div>
    <p class="likes">Liked by <b>daily.devotion</b> and <b>${fmt(likes)} others</b></p>
    <p class="caption"><b>@${esc(v.handle)}</b><span class="name-tag">${esc(v.name)} —</span> <span class="reflection-line">${esc(v.reflection)}</span></p>
    ${list.length?`<button class="comments-link" data-view-comments="${v.id}">View all ${list.length} comment${list.length>1?"s":""}</button><div class="comments">${list.slice(-2).map(c=>`<p class="comment-row"><b>you</b>${esc(c)}</p>`).join("")}</div>`:`<button class="comments-link" data-view-comments="${v.id}">Add a comment…</button>`}
    <div class="add-comment"><input data-comment-input="${v.id}" placeholder="Add a comment…" maxlength="140"/><button class="post-btn" data-post-comment="${v.id}" hidden>Post</button></div>
    <p class="time">${esc(v.time)}</p>
  </article>`;
}
function filteredFeed(){ return activeTopic==="All" ? order : order.filter(v=>v.topic===activeTopic); }
function renderFeed(){ const list=filteredFeed(); feedEl.innerHTML=list.map(postHTML).join(""); $("#feedEmpty").hidden=list.length>0; bindPosts(feedEl); }
function renderSaved(){ const list=VERSES.filter(v=>saved.has(v.id)); savedFeedEl.innerHTML=list.map(postHTML).join(""); $("#savedEmpty").style.display=list.length?"none":"block"; bindPosts(savedFeedEl); updateBadges(); }
function renderGrid(el,list){ el.innerHTML=list.map(v=>`<button class="tile" data-open="${v.id}" style="background:${v.bg};color:${v.fg}"><span class="tile-heart">${liked.has(v.id)?"♥":"♡"} ${fmt(v.baseLikes+(liked.has(v.id)?1:0))}</span><b>${esc(v.name)}</b><span class="tile-handle">@${esc(v.handle)}</span><span>${esc(v.ref)}</span></button>`).join(""); el.querySelectorAll("[data-open]").forEach(t=>t.addEventListener("click",()=>openVerse(Number(t.dataset.open)))); }
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
  const q = norm($("#searchInput").value);
  const tokens = q.split(" ").filter(Boolean);
  const pool = VERSES.filter(v => activeTopic === "All" || v.topic === activeTopic);
  const list = pool
    .map(v => ({ v, s: scoreFeedVerse(v, tokens) }))
    .filter(x => x.s >= 0)
    .sort((a, b) => b.s - a.s || b.v.baseLikes - a.v.baseLikes)
    .map(x => x.v);
  renderGrid($("#discoverGrid"), list);
  $("#gridEmpty").hidden = list.length > 0;
  $("#gridEmpty").textContent = tokens.length ? `No verses match “${($("#searchInput").value || "").trim()}”. Try a name, a topic like Peace, or a reference like John 1:5.` : "No verse matches that search.";
}
function renderProfile(){ renderGrid($("#profileGrid"),order); $("#statPosts").textContent=VERSES.length; $("#statLiked").textContent=liked.size; $("#statSaved2").textContent=saved.size; }
function renderReel(){ const v=order[reelIndex%order.length]; $("#reelCard").innerHTML=`<div class="media" data-dbl="${v.id}" style="background:${v.bg};color:${v.fg}"><p class="media-kicker">Verse of the day · ${esc(v.author)} · ${esc(v.topic)}</p><h2 class="media-name">${esc(v.name)}</h2><p class="media-verse">“${esc(v.verse)}”</p><span class="media-ref">${esc(v.ref)}</span></div>`; $("#reelLikeBtn").textContent=liked.has(v.id)?"♥ Liked":"♡ Like"; bindMedia($("#reelCard")); }
function updateBadges(){ $("#savedBadge").textContent=saved.size||""; const b=$("#tabSavedBadge"); b.hidden=saved.size===0; b.textContent=saved.size; $("#statLiked").textContent=liked.size; $("#statSaved2").textContent=saved.size; }

function renderAll(){ renderFeed(); renderSaved(); renderDiscover(); renderProfile(); renderReel(); updateBadges(); }
function toggleLike(id, burst=false){ const was=liked.has(id); was?liked.delete(id):liked.add(id); persistAll(); renderAll(); if(!was&&burst) popBurst(); if(!was) showToast("Liked ♥"); }
function toggleSave(id){ const was=saved.has(id); was?saved.delete(id):saved.add(id); persistAll(); renderAll(); showToast(was?"Removed from Saved":"Saved 🔖 Find it in the ♥ tab"); }
async function shareVerse(id){ const v=VERSES.find(x=>x.id===id); const text=`${v.name} — “${v.verse}” ${v.ref}`; if(navigator.share){ try{ await navigator.share({title:v.name,text}); return; }catch{} } try{ await navigator.clipboard.writeText(text); showToast("Verse copied — paste to share"); }catch{ showToast(text); } }
function appInviteText(){ return "BibleVerse — a Christian companion for daily Scripture. A daily feed of named verses to pray with, plus the full Catholic Bible in modern English (73 books, World English Bible Catholic Edition) — readable fully offline: https://bibleverse.app/"; }
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
function bindPosts(root){
  bindMedia(root);
  root.querySelectorAll("[data-like]").forEach(b=>b.addEventListener("click",()=>toggleLike(Number(b.dataset.like))));
  root.querySelectorAll("[data-save]").forEach(b=>b.addEventListener("click",()=>toggleSave(Number(b.dataset.save))));
  root.querySelectorAll("[data-share]").forEach(b=>b.addEventListener("click",()=>shareVerse(Number(b.dataset.share))));
  root.querySelectorAll("[data-follow]").forEach(b=>b.addEventListener("click",()=>{ const v=VERSES.find(x=>x.id===Number(b.dataset.follow)); b.textContent=b.textContent==="Follow"?"Following":"Follow"; showToast(b.textContent==="Following"?`Following @${v.handle}`:"Unfollowed"); }));
  root.querySelectorAll("[data-more]").forEach(b=>b.addEventListener("click",()=>showToast("Saved verses live in the ♥ tab below")));
  root.querySelectorAll("[data-comment-focus],[data-view-comments]").forEach(b=>b.addEventListener("click",()=>{ const id=b.dataset.commentFocus||b.dataset.viewComments; root.querySelector(`[data-comment-input="${id}"]`)?.focus(); }));
  root.querySelectorAll("[data-comment-input]").forEach(inp=>{
    const btn=root.querySelector(`[data-post-comment="${inp.dataset.commentInput}"]`);
    inp.addEventListener("input",()=>{ btn.hidden=!inp.value.trim(); });
    inp.addEventListener("keydown",e=>{ if(e.key==="Enter") btn.click(); });
  });
  root.querySelectorAll("[data-post-comment]").forEach(b=>b.addEventListener("click",()=>{ const id=Number(b.dataset.postComment); const inp=root.querySelector(`[data-comment-input="${id}"]`); const text=inp.value.trim(); if(!text) return; (comments[id]??=[]).push(text); persistAll(); renderAll(); showToast("Comment posted"); }));
  root.querySelectorAll("[data-open]").forEach(t=>t.addEventListener("click",()=>openVerse(Number(t.dataset.open))));
}
function openVerse(id){ activeTopic="All"; renderStories(); switchView("feed"); requestAnimationFrame(()=>{ document.querySelector(`.post[data-id="${id}"]`)?.scrollIntoView({behavior:"smooth",block:"start"}); }); }
function renderStories(){
  const topics=["All",...new Set(VERSES.map(v=>v.topic))];
  storiesEl.innerHTML=`<button class="story you"><span class="story-ring seen"><span class="story-avatar">You<span class="story-plus">+</span></span></span><span>Your story</span></button>`+
    topics.map(t=>{ const v=VERSES.find(x=>x.topic===t)||VERSES[0]; return `<button class="story ${activeTopic===t?"active":""}" data-story="${esc(t)}"><span class="story-ring ${activeTopic===t?"active":""}"><span class="story-avatar" style="background:${t==="All"?"#000":v.bg}">${t==="All"?"✦":esc(initials(t))}</span></span><span>${esc(t)}</span></button>`; }).join("");
  storiesEl.querySelectorAll("[data-story]").forEach(s=>s.addEventListener("click",()=>{ activeTopic=s.dataset.story; renderStories(); renderFeed(); renderDiscover(); $("#scrollArea").scrollTo({top:0,behavior:"smooth"}); }));
  const chips=$("#topicChips"); chips.innerHTML=topics.map(t=>`<button class="chip ${activeTopic===t?"active":""}" data-chip="${esc(t)}">${esc(t)}</button>`).join("");
  chips.querySelectorAll("[data-chip]").forEach(c=>c.addEventListener("click",()=>{ activeTopic=c.dataset.chip; renderStories(); renderFeed(); renderDiscover(); }));
}

const bible = initBible({ showToast });
function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.hidden = v.id !== "view-"+name);
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  $("#scrollArea").scrollTo({top:0});
  if(name==="reel") renderReel();
  if(name==="bible") bible.ensureLoaded();
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchView(t.dataset.view)));
$("#searchInput").addEventListener("input", renderDiscover);
$("#clearFilterBtn").addEventListener("click",()=>{ activeTopic="All"; renderStories(); renderAll(); });
$("#shuffleBtn").addEventListener("click",()=>{ order=[...order].sort(()=>Math.random()-.5); renderAll(); switchView("feed"); showToast("Feed shuffled ⇄"); });
$("#reelNextBtn").addEventListener("click",()=>{ reelIndex=(reelIndex+1)%order.length; renderReel(); });
$("#reelLikeBtn").addEventListener("click",()=>toggleLike(order[reelIndex%order.length].id, true));
$("#newPostBtn").addEventListener("click",()=>switchView("reel"));
$("#notifBtn").addEventListener("click",()=>switchView("saved"));
$("#shareAppBtn").addEventListener("click",()=>shareApp());
$("#profileShareBtn").addEventListener("click",()=>shareApp());
$("#aboutBtn").addEventListener("click",()=>switchView("about"));
$("#aboutBackBtn").addEventListener("click",()=>switchView("profile"));
$("#privacyBtn").addEventListener("click",()=>switchView("privacy"));
$("#aboutPrivacyBtn").addEventListener("click",()=>switchView("privacy"));
$("#privacyBackBtn").addEventListener("click",()=>switchView("profile"));
$("#aboutShareBtn").addEventListener("click",()=>shareApp());
$("#aboutCopyBtn").addEventListener("click",()=>shareApp(true));
if(window.Capacitor?.isNativePlatform?.())document.body.classList.add("native");
$("#scrollArea").addEventListener("scroll",e=>{ document.querySelector(".appbar").classList.toggle("scrolled", e.target.scrollTop>8); },{passive:true});
function tickClock(){ const d=new Date(); $("#clock").textContent=d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}).replace(/\s?[AP]M/i,""); }
tickClock(); setInterval(tickClock, 20000);
renderStories(); renderAll();
// Web/PWA offline: cache shell + full Bible. Native (Capacitor) apps already
// carry every file in the bundle, so skip the service worker there.
if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
