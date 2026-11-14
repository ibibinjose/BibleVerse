import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { postHTML } from "../feed-card.js";

const verse = {
  id: 3,
  name: "Power, Love, Self-Control",
  verse: "For God didn't give us a spirit of fear.",
  ref: "2 Timothy 1:7",
  book: "2 Timothy",
  topic: "Courage",
  reflection: "Ask for a steady spirit.",
  author: "Paul",
  handle: "paul",
  bg: "#1e3a2f",
  fg: "#f7f3ea",
};

describe("feed card", () => {
  it("renders a verse card without invented counts, follows, or badges", () => {
    const html = postHTML(verse, { liked: true, saved: false, prerender: true });
    assert.match(html, /class="post"/);
    assert.match(html, /data-prerender/);
    assert.match(html, /data-like="3"/);
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /Share verse card/);
    assert.match(html, /Power, Love, Self-Control/);
    assert.doesNotMatch(html, /Follow/);
    assert.doesNotMatch(html, /class="verified"/);
    assert.doesNotMatch(html, /class="likes"/);
    assert.doesNotMatch(html, /\d+(\.\d+)?k/);
  });
});
