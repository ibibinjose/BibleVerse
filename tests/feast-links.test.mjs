import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { feastSources, pageSlug, rankExplanation, rankLabel } from "../feast-links.js";
import { FIXED } from "../feasts.js";

describe("feast links", () => {
  it("uses the Vatican saint-of-the-day page for a fixed saint", () => {
    const francis = FIXED.find((f) => f.name === "Francis of Assisi");
    const links = feastSources({ ...francis, y: 2026, movable: false });
    assert.equal(links.vatican, "https://www.vaticannews.va/en/saints/10/04.html");
    assert.equal(links.wikipedia, "https://en.wikipedia.org/wiki/Francis_of_Assisi");
    assert.equal(links.grokipedia, "https://grokipedia.com/page/Francis_of_Assisi");
  });

  it("stores a corrected slug when the feast title is not the article title", () => {
    assert.equal(pageSlug("Holy Family of Jesus, Mary and Joseph"), "Holy_Family");
    assert.equal(pageSlug("Easter Sunday"), "Easter");
    const family = feastSources({ name: "Holy Family of Jesus, Mary and Joseph", movable: true, m: 12, d: 27 });
    assert.match(family.wikipedia, /Holy_Family$/);
    assert.match(family.grokipedia, /\/page\/Holy_Family$/);
    assert.match(family.vatican, /search\.html\?q=/);
  });

  it("uses Grokipedia search when no page slug was stored", () => {
    const links = feastSources({ name: "John Leonardi", m: 10, d: 9, movable: false });
    assert.equal(links.grokipedia, "https://grokipedia.com/search?q=John%20Leonardi");
    assert.equal(links.wikipedia, "https://en.wikipedia.org/wiki/John_Leonardi");
  });

  it("uses an official liturgical page where the saint-of-the-day URL is missing", () => {
    const all = FIXED.find((f) => f.name === "All Saints");
    assert.equal(
      feastSources({ ...all, y: 2026, movable: false }).vatican,
      "https://www.vaticannews.va/en/liturgical-holidays/solemnity-of-all-saints.html",
    );
  });

  it("explains every rank, including optional memorials", () => {
    for (const rank of ["Solemnity", "Feast", "Memorial", "Optional", "Sunday", "Observance"]) {
      assert.ok(rankExplanation(rank).length > 20, rank);
    }
    assert.equal(rankLabel("Optional"), "Optional Memorial");
    assert.equal(rankLabel("Solemnity"), "Solemnity");
  });
});
