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
const RAW3 = [
  ["The Lord Is My Light","The LORD is my light and my salvation. Whom shall I fear? The LORD is the strength of my life. Of whom shall I be afraid?","Psalm 27:1","Psalms","Courage","Fear asks who is against you. Faith answers who is with you.",4802,"5 DAYS AGO"],
  ["Near to the Brokenhearted","The LORD is near to those who have a broken heart, and saves those who have a crushed spirit.","Psalm 34:18","Psalms","Hope","When your heart breaks, God does not step back — he steps closer.",3654,"5 DAYS AGO"],
  ["My Refuge and Fortress","I will say of the LORD, “He is my refuge and my fortress; my God, in whom I trust.”","Psalm 91:2","Psalms","Peace","Trust is saying it out loud: God is my safe place.",2917,"6 DAYS AGO"],
  ["My Help Comes from the Lord","I will lift up my eyes to the hills. Where does my help come from? My help comes from the LORD, who made heaven and earth.","Psalm 121:1–2","Psalms","Hope","Look up. Your help has a Maker.",4430,"6 DAYS AGO"],
  ["Trust Without Leaning","Trust in the LORD with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.","Proverbs 3:5–6","Proverbs","Faith","You do not have to understand the path to trust the Guide.",5218,"1 WEEK AGO"],
  ["Perfect Peace","You will keep whoever’s mind is steadfast in perfect peace, because he trusts in you.","Isaiah 26:3","Isaiah","Peace","Peace grows where the mind stays — fixed on God, not on the storm.",3875,"1 WEEK AGO"],
  ["Through the Waters","When you pass through the waters, I will be with you, and through the rivers, they will not overflow you. When you walk through the fire, you will not be burned, and flame will not scorch you.","Isaiah 43:2","Isaiah","Strength","The promise is not the absence of deep water. It is company in it.",4102,"1 WEEK AGO"],
  ["Walk Humbly","He has shown you, O man, what is good. What does the LORD require of you, but to act justly, to love mercy, and to walk humbly with your God?","Micah 6:8","Micah","Faith","A whole life with God in one sentence: do justice, love mercy, walk humbly.",2764,"1 WEEK AGO"],
  ["Rejoicing Over You","The LORD, your God, is among you, a mighty one who will save. He will rejoice over you with joy. He will calm you in his love. He will rejoice over you with singing.","Zephaniah 3:17","Zephaniah","Joy","Read that slowly: God himself sings over you with joy.",3389,"2 WEEKS AGO"],
  ["Seek First","But seek first God’s Kingdom and his righteousness; and all these things will be given to you as well.","Matthew 6:33","Matthew","Faith","Put first things first, and the rest finds its place.",4022,"2 WEEKS AGO"],
  ["Come and Rest","Come to me, all you who labor and are heavily burdened, and I will give you rest.","Matthew 11:28","Matthew","Peace","Jesus does not tell the weary to try harder. He tells them to come.",5340,"2 WEEKS AGO"],
  ["God So Loved the World","For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.","John 3:16","John","Love","The most famous verse in the world is a love letter in one sentence.",5987,"2 WEEKS AGO"],
  ["Light of the World","Again, therefore, Jesus spoke to them, saying, “I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.”","John 8:12","John","Hope","Follow the Light and the darkness cannot keep you.",3150,"2 WEEKS AGO"],
  ["Peace I Leave With You","Peace I leave with you. My peace I give to you; not as the world gives, I give to you. Don’t let your heart be troubled, neither let it be fearful.","John 14:27","John","Peace","Jesus left peace behind like an inheritance — and it is yours.",4288,"2 WEEKS AGO"],
  ["While We Were Sinners","But God commends his own love toward us, in that while we were yet sinners, Christ died for us.","Romans 5:8","Romans","Love","God did not wait for you to be worthy. That is the whole point.",4761,"2 WEEKS AGO"],
  ["God of Hope","Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope in the power of the Holy Spirit.","Romans 15:13","Romans","Joy","Hope here overflows — it abounds, by the Spirit’s power.",2613,"2 WEEKS AGO"],
  ["Rejoicing in Hope","Rejoicing in hope, enduring in troubles, continuing steadfastly in prayer.","Romans 12:12","Romans","Hope","Three habits for hard days: rejoice, endure, pray.",1945,"3 WEEKS AGO"],
  ["Grace Is Sufficient","He has said to me, “My grace is sufficient for you, for my power is made perfect in weakness.” Most gladly therefore I will rather glory in my weaknesses, that the power of Christ may rest on me.","2 Corinthians 12:9","2 Corinthians","Grace","Your weakness is not the end of the story. It is where his power rests.",3590,"3 WEEKS AGO"],
  ["Saved by Grace","For by grace you have been saved through faith, and that not of yourselves; it is the gift of God.","Ephesians 2:8","Ephesians","Grace","Salvation is a gift, not a wage. Receive it.",4873,"3 WEEKS AGO"],
  ["Through Christ Who Strengthens","I can do all things through Christ who strengthens me.","Philippians 4:13","Philippians","Strength","Not every dream — every duty. Christ supplies the strength.",5536,"3 WEEKS AGO"],
  ["Work Heartily","And whatever you do, work heartily, as for the Lord and not for men.","Colossians 3:23","Colossians","Faith","Ordinary work becomes worship when it is done for the Lord.",1872,"3 WEEKS AGO"],
  ["Rejoice, Pray, Give Thanks","Always rejoice. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.","1 Thessalonians 5:16–18","1 Thessalonians","Joy","God’s will in three short steps: rejoice, pray, give thanks.",2418,"3 WEEKS AGO"],
  ["Power, Love, Self-Control","For God didn’t give us a spirit of fear, but of power, love, and self-control.","2 Timothy 1:7","2 Timothy","Courage","Fear is not from God. Power, love, and a steady mind are.",3944,"3 WEEKS AGO"],
  ["Assurance of Hope","Now faith is assurance of things hoped for, proof of things not seen.","Hebrews 11:1","Hebrews","Faith","Faith is not guessing. It is confidence in what you cannot yet see.",2871,"3 WEEKS AGO"],
  ["Cast Your Worries","Casting all your worries on him, because he cares for you.","1 Peter 5:7","1 Peter","Peace","Every worry has an address: cast it on him. He cares.",4526,"3 WEEKS AGO"],
  ["Every Tear Wiped Away","He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain any more. The first things have passed away.","Revelation 21:4","Revelation","Hope","The end of the story is God himself drying every tear.",5105,"3 WEEKS AGO"],
  ["The Lord Will Fight for You","The LORD will fight for you, and you shall be still.","Exodus 14:14","Exodus","Strength","Some battles are won by standing still and letting God fight.",4690,"3 WEEKS AGO"],
  ["Never Forsaken","Be strong and courageous. Don’t be afraid or scared of them, for the LORD your God himself is who goes with you. He will not fail you nor forsake you.","Deuteronomy 31:6","Deuteronomy","Courage","He goes with you. He will not fail you. He will not forsake you.",3812,"3 WEEKS AGO"],
  ["Joy Is Your Strength","Then he said to them, “Go your way. Eat the fat, drink the sweet, and send portions to him for whom nothing is prepared, for today is holy to our Lord. Don’t be grieved, for the joy of the LORD is your strength.”","Nehemiah 8:10","Nehemiah","Joy","Strength for the grieving day: the joy of the Lord.",2258,"3 WEEKS AGO"],
  ["Feet Like the Deer","GOD, the Lord, is my strength. He makes my feet like deer’s feet, and enables me to go in high places.","Habakkuk 3:19","Habakkuk","Strength","Even on the steepest climb, he gives you the feet for it.",2094,"3 WEEKS AGO"],
  ["Ask for Wisdom","But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him.","James 1:5","James","Faith","God gives wisdom generously — and never scolds you for asking.",1736,"3 WEEKS AGO"],
  ["Loved First","We love him, because he first loved us.","1 John 4:19","1 John","Love","Every love you give is an echo. His came first.",4367,"3 WEEKS AGO"],
];
const AUTHORS = {
  Genesis: ["Moses", "moses"], Exodus: ["Moses", "moses"], Deuteronomy: ["Moses", "moses"],
  Joshua: ["Joshua", "joshua"], Nehemiah: ["Nehemiah", "nehemiah"], Psalms: ["David", "david"],
  Proverbs: ["Solomon", "solomon"], Isaiah: ["Isaiah", "isaiah"], Jeremiah: ["Jeremiah", "jeremiah"],
  Lamentations: ["Jeremiah", "jeremiah"], Micah: ["Micah", "micah"], Habakkuk: ["Habakkuk", "habakkuk"],
  Zephaniah: ["Zephaniah", "zephaniah"],
  Matthew: ["Matthew", "matthew"], John: ["John", "john"], Romans: ["Paul", "paul"],
  "1 Corinthians": ["Paul", "paul"], "2 Corinthians": ["Paul", "paul"], Galatians: ["Paul", "paul"],
  Ephesians: ["Paul", "paul"], Philippians: ["Paul", "paul"], Colossians: ["Paul", "paul"],
  "1 Thessalonians": ["Paul", "paul"], "2 Timothy": ["Paul", "paul"], Hebrews: ["Hebrews", "hebrews"],
  James: ["James", "james"], "1 Peter": ["Peter", "peter"], "1 John": ["John", "john"],
  Revelation: ["John", "john"],
};
function authorOf(book){ return AUTHORS[book] || [book, book.toLowerCase().replace(/[^a-z0-9]+/g, "")]; }
export const VERSES = [...RAW, ...RAW2, ...RAW3].map((r,i)=>{ const [author, handle] = authorOf(r[3]); return { id:i+1, name:r[0], verse:r[1], ref:r[2], book:r[3], topic:r[4], reflection:r[5], baseLikes:r[6], time:r[7], author, handle, ...PALETTES[i % PALETTES.length] }; });

import { initBible } from "./bible.js";
import { buildFeedOrder, dayOfYear } from "./feed-rotation.js";
import { createPullRefresh } from "./pull-refresh.js";
import { feastsOn, upcomingFeasts, seasonOf, toDate, RANK_DOT } from "./feasts.js";
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
function renderReel(){ const v=reelPool[reelIndex%reelPool.length]; $("#reelCard").innerHTML=`<div class="media" data-dbl="${v.id}" style="background:${v.bg};color:${v.fg}"><p class="media-kicker">Verse of the day · ${esc(v.author)} · ${esc(v.topic)}</p><h2 class="media-name">${esc(v.name)}</h2><p class="media-verse">“${esc(v.verse)}”</p><span class="media-ref">${esc(v.ref)}</span></div>`; $("#reelLikeBtn").textContent=liked.has(v.id)?"♥ Liked":"♡ Like"; bindMedia($("#reelCard")); }
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
// ---------- Feasts & Saints ----------
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MON_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const SEASON_LINE = { Advent: "Prepare the way of the Lord.", Christmas: "Christ is born! Glorify him.", Lent: "Pray, fast, and give.", Triduum: "Behold the wood of the Cross.", Easter: "Christ is risen! Alleluia.", "Ordinary Time": "Grow in grace, day by day." };
let calY = null, calM = null, calSel = null;
function feastRows(list){
  if(!list.length) return "";
  return `<div class="feast-list">` + list.map(f=>`<div class="feast-row"><span class="rank ${esc(f.rank)}">${esc(f.rank)}</span><div><b>${esc(f.name)}</b><small>${esc(f.about || "")}</small>${f.obligation?`<span class="obl">✦ Holy Day of Obligation</span>`:""}</div></div>`).join("") + `</div>`;
}
function renderFeasts(){
  const now = new Date();
  if(calY === null){ calY = now.getFullYear(); calM = now.getMonth() + 1; calSel = { y: calY, m: calM, d: now.getDate() }; }
  const season = seasonOf(now), todayList = feastsOn(now);
  $("#feastToday").innerHTML = `<div class="season-card" style="--season:${season.color}"><small>${esc(season.name)} · Today</small><b>${todayList.length ? esc(todayList.map(f=>f.name).join(" · ")) : "An Ordinary weekday"}</b><span>${todayList.length && todayList[0].about ? esc(todayList[0].about) : esc(SEASON_LINE[season.name] || "")}</span></div>`;
  $("#tabFeastDot").hidden = !todayList.some(f=>f.obligation);
  $("#calTitle").textContent = `${MONTHS[calM-1]} ${calY}`;
  const first = new Date(calY, calM-1, 1).getDay(), dim = new Date(calY, calM, 0).getDate();
  const tY = now.getFullYear(), tM = now.getMonth()+1, tD = now.getDate();
  let cells = ["S","M","T","W","T","F","S"].map(d=>`<span class="cal-dow">${d}</span>`).join("");
  for(let i=0;i<first;i++) cells += `<span class="cal-day blank"></span>`;
  for(let d=1; d<=dim; d++){
    const items = feastsOn(toDate(calY, calM, d));
    const cls = ["cal-day"];
    if(calY===tY && calM===tM && d===tD) cls.push("today");
    if(calSel && calSel.y===calY && calSel.m===calM && calSel.d===d) cls.push("sel");
    cells += `<button class="${cls.join(" ")}" data-cal="${d}">${d}${items.length?`<span class="dot" style="background:${RANK_DOT[items[0].rank]||"#9ca3af"}"></span>`:""}</button>`;
  }
  const grid = $("#calGrid");
  grid.innerHTML = cells;
  grid.querySelectorAll("[data-cal]").forEach(b=>b.addEventListener("click",()=>{ calSel = { y: calY, m: calM, d: Number(b.dataset.cal) }; renderFeasts(); }));
  const selList = feastsOn(toDate(calSel.y, calSel.m, calSel.d));
  const selSeason = seasonOf(toDate(calSel.y, calSel.m, calSel.d));
  $("#feastDetail").innerHTML = `<h3 class="view-subtitle">${MONTHS[calSel.m-1]} ${calSel.d} · ${esc(selSeason.name)}</h3>` +
    (selList.length ? feastRows(selList) : `<p class="view-sub">No feast this day — an Ordinary (ferial) day.</p>`);
  $("#feastUpcoming").innerHTML = upcomingFeasts(now, 10).map(g=>{
    const when = g.inDays === 1 ? "Tomorrow" : `in ${g.inDays} days`;
    return `<button class="up-row" data-up="${g.y}-${g.m}-${g.d}"><span class="up-date"><b>${g.d}</b><span>${MON_ABBR[g.m-1]}</span></span><span class="up-main">${esc(g.items.map(f=>f.name).join(" · "))}<small>${esc(g.items[0].rank)}${g.items.some(f=>f.obligation)?" · ✦ Holy Day of Obligation":""}</small></span><span class="up-when${g.inDays<=7?" soon":""}">${when}</span></button>`;
  }).join("");
  $("#feastUpcoming").querySelectorAll("[data-up]").forEach(b=>b.addEventListener("click",()=>{
    const [y,m,d] = b.dataset.up.split("-").map(Number);
    calY = y; calM = m; calSel = { y, m, d }; renderFeasts();
    $("#scrollArea").scrollTo({ top: 0, behavior: "smooth" });
  }));
}
function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.hidden = v.id !== "view-"+name);
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  $("#scrollArea").scrollTo({top:0});
  if(name==="reel") renderReel();
  if(name==="bible") bible.ensureLoaded();
  if(name==="feasts") renderFeasts();
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchView(t.dataset.view)));
$("#searchInput").addEventListener("input", renderDiscover);
$("#clearFilterBtn").addEventListener("click",()=>{ activeTopic="All"; renderStories(); renderAll(); });
$("#calPrevBtn").addEventListener("click",()=>{ calM--; if(calM<1){ calM=12; calY--; } renderFeasts(); });
$("#calNextBtn").addEventListener("click",()=>{ calM++; if(calM>12){ calM=1; calY++; } renderFeasts(); });
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
renderStories(); renderAll(); renderFeasts();
// Web/PWA offline: cache shell + full Bible. Native (Capacitor) apps already
// carry every file in the bundle, so skip the service worker there.
if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
