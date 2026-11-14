// Checks every feast's Wikipedia and Grokipedia URL.
// Wikipedia: flag disambiguation pages (pageprops.disambiguation or a
// disambiguation category) and titles that do not refer to the feast.
// Grokipedia: prefer a /page/ URL that returns 200 over search.
//
//   node scripts/audit-feast-links.mjs           # report, exit 1 if any current link is wrong
//   node scripts/audit-feast-links.mjs --write   # store corrected slugs in feast-links.js
import { readFile, writeFile } from "node:fs/promises";
import { FIXED, movableFeasts } from "../feasts.js";
import { PAGE_SLUG, feastSources, pageSlug } from "../feast-links.js";

const WRITE = process.argv.includes("--write");
const UA = "BibleVerseFeastLinkAudit/1.0 (offline calendar; polite link check)";

const STOP = new Set([
  "saint", "saints", "st", "sts", "the", "of", "and", "a", "an", "our", "lady",
  "most", "holy", "lord", "jesus", "mary", "joseph", "blessed", "virgin", "pope",
]);

export function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP.has(word) && word.length > 1);
}

export function titleMatches(feastName, pageTitle) {
  const feast = tokens(feastName);
  const page = tokens(pageTitle);
  if (!feast.length || !page.length) return false;
  const pageSet = new Set(page);
  const shared = feast.filter((word) => pageSet.has(word));
  if (shared.length === feast.length) return true;
  if (shared.length === page.length) return true;
  const union = new Set([...feast, ...page]).size;
  return shared.length / union >= 0.5 && shared.length >= 1;
}

export function isDisambiguation(page) {
  if (!page || page.missing !== undefined) return false;
  if (page.pageprops && Object.prototype.hasOwnProperty.call(page.pageprops, "disambiguation")) return true;
  const cats = page.categories || [];
  return cats.some((cat) => /disambiguation/i.test(cat.title || ""));
}

function feastNames() {
  const names = new Set(FIXED.map((feast) => feast.name));
  for (const feast of movableFeasts(2026)) names.add(feast.name);
  return [...names];
}

function slugToTitle(slug) {
  return slug.replaceAll("_", " ");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wikiQuery(params) {
  const url = "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
    format: "json",
    formatversion: "2",
    utf8: "1",
    ...params,
  });
  let last = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
    if (res.status === 429) {
      const wait = (Number(res.headers.get("retry-after")) || 2) * 1000 + attempt * 400;
      await sleep(wait);
      last = "429";
      continue;
    }
    if (!res.ok) throw new Error(`Wikipedia ${res.status} ${url}`);
    await sleep(120);
    return res.json();
  }
  throw new Error(`Wikipedia rate limited (${last}) ${url}`);
}

async function lookupTitles(titles) {
  const byTitle = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const data = await wikiQuery({
      action: "query",
      redirects: "1",
      prop: "pageprops|info|categories",
      inprop: "displaytitle|url",
      ppprop: "disambiguation",
      cllimit: "50",
      clshow: "!hidden",
      titles: chunk.join("|"),
    });
    const redirects = new Map();
    for (const row of data.query?.redirects || []) redirects.set(row.from, row.to);
    const normalized = new Map();
    for (const row of data.query?.normalized || []) normalized.set(row.from, row.to);
    for (const page of data.query?.pages || []) {
      byTitle.set(page.title, page);
    }
    for (const title of chunk) {
      const via = redirects.get(normalized.get(title) || title) || normalized.get(title) || title;
      const page = byTitle.get(via) || data.query?.pages?.find((item) => item.title === via);
      if (page) byTitle.set(title, page);
    }
  }
  return byTitle;
}

async function searchTitles(query) {
  const data = await wikiQuery({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: "6",
  });
  return (data.query?.search || []).map((row) => row.title);
}

function mapPool(limit) {
  let active = 0;
  const queue = [];
  const pump = () => {
    while (active < limit && queue.length) {
      const job = queue.shift();
      active += 1;
      job.fn().then(job.ok, job.fail).finally(() => {
        active -= 1;
        pump();
      });
    }
  };
  return (fn) => new Promise((ok, fail) => {
    queue.push({ fn, ok, fail });
    pump();
  });
}

async function grokExists(slug) {
  const url = "https://grokipedia.com/page/" + encodeURI(slug).replaceAll("'", "%27");
  let res;
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA } });
    if (res.status !== 429 && res.status !== 503) break;
    await sleep((attempt + 1) * 800);
  }
  if (!res.ok) return null;
  if (!new URL(res.url).pathname.startsWith("/page/")) return null;
  const html = await res.text();
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  if (/not found|page does not exist|404/i.test(title)) return null;
  if (html.length < 800 && /not found|404/i.test(html)) return null;
  return { url, title: title.replace(/\s+/g, " ").trim() };
}

function replaceBlock(source, name, body) {
  const start = `const ${name} = `;
  const at = source.indexOf(start);
  if (at < 0) throw new Error(`missing ${name}`);
  const end = source.indexOf(";\n", at);
  if (end < 0) throw new Error(`unterminated ${name}`);
  return source.slice(0, at) + body + ";" + source.slice(end + 1);
}

function objectLiteral(entries) {
  const lines = Object.entries(entries)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, slug]) => `  ${JSON.stringify(name)}: ${JSON.stringify(slug)},`);
  return `{\n${lines.join("\n")}\n}`;
}

async function main() {
  const names = feastNames();
  const current = new Map(names.map((name) => {
    const feast = { name, m: 1, d: 1, movable: false };
    return [name, { slug: pageSlug(name), links: feastSources(feast) }];
  }));
  const titles = [...new Set([...current.values()].map((row) => slugToTitle(row.slug)))];
  const pages = await lookupTitles(titles);

  const wikiFixes = {};
  const problems = [];
  const bad = [];
  for (const name of names) {
    const slug = current.get(name).slug;
    const page = pages.get(slugToTitle(slug));
    const wrong = !page || page.missing !== undefined || isDisambiguation(page) || !titleMatches(name, page.title);
    if (!wrong) continue;
    const reason = !page || page.missing !== undefined
      ? "missing"
      : isDisambiguation(page)
        ? "disambiguation"
        : `title “${page.title}”`;
    bad.push({ name, reason, slug });
  }
  const guesses = bad.flatMap((row) => [`Saint ${row.name}`, `Saints ${row.name}`, `${row.name} (saint)`]);
  const guessed = bad.length ? await lookupTitles([...new Set(guesses)]) : new Map();
  function takeGuess(name) {
    for (const title of [`Saint ${name}`, `Saints ${name}`, `${name} (saint)`]) {
      const candidate = guessed.get(title);
      if (!candidate || candidate.missing !== undefined || isDisambiguation(candidate)) continue;
      if (!titleMatches(name, candidate.title)) continue;
      return candidate;
    }
    return null;
  }
  for (const row of bad) {
    let chosen = takeGuess(row.name);
    if (!chosen) {
      const hits = await searchTitles(`Saint ${row.name}`);
      const found = hits.length ? await lookupTitles(hits) : new Map();
      for (const title of hits) {
        const candidate = found.get(title);
        if (!candidate || candidate.missing !== undefined || isDisambiguation(candidate)) continue;
        if (!titleMatches(row.name, candidate.title)) continue;
        chosen = candidate;
        break;
      }
    }
    if (!chosen) {
      problems.push({ ...row, fix: null });
      continue;
    }
    const fixedSlug = chosen.title.replaceAll(" ", "_");
    if (fixedSlug !== row.slug) wikiFixes[row.name] = fixedSlug;
    problems.push({ ...row, fix: fixedSlug, title: chosen.title });
  }

  const grokSlug = {};
  const grokSearch = [];
  const run = mapPool(4);
  await Promise.all(names.map((name) => run(async () => {
    const wiki = wikiFixes[name] || current.get(name).slug;
    const candidates = [...new Set([wiki, pageSlug(name), `Saint_${pageSlug(name)}`])];
    for (const slug of candidates) {
      const hit = await grokExists(slug);
      if (!hit) continue;
      if (slug !== pageSlug(name)) grokSlug[name] = slug;
      return;
    }
    grokSearch.push(name);
  })));
  grokSearch.sort();

  const changedWiki = problems.filter((row) => row.fix && row.fix !== row.slug);
  console.log(JSON.stringify({
    feasts: names.length,
    wikipediaProblems: problems.length,
    wikipediaFixes: changedWiki.length,
    unresolved: problems.filter((row) => !row.fix).map((row) => row.name),
    grokipediaPagesStored: Object.keys(grokSlug).length,
    grokipediaSearch: grokSearch.length,
    fixes: changedWiki,
  }, null, 2));

  if (WRITE) {
    const path = new URL("../feast-links.js", import.meta.url);
    let source = await readFile(path, "utf8");
    const merged = { ...PAGE_SLUG, ...wikiFixes };
    for (const [name, slug] of Object.entries(merged)) {
      if (pageSlugWouldBe(name, slug)) delete merged[name];
    }
    source = replaceBlock(source, "PAGE_SLUG", `const PAGE_SLUG = ${objectLiteral(merged)};`);
    source = replaceBlock(source, "GROK_SLUG", `const GROK_SLUG = ${objectLiteral(grokSlug)};`);
    source = replaceBlock(
      source,
      "GROK_SEARCH",
      `const GROK_SEARCH = new Set(${JSON.stringify(grokSearch)});`,
    );
    await writeFile(path, source);
    console.log(`wrote feast-links.js (${changedWiki.length} wikipedia fixes)`);
  }

  if (problems.some((row) => !row.fix)) process.exitCode = 2;
}

function pageSlugWouldBe(name, slug) {
  return name.replaceAll(" ", "_") === slug;
}

if (process.argv[1] && process.argv[1].endsWith("audit-feast-links.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
