import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isDisambiguation, titleMatches } from "../scripts/audit-feast-links.mjs";
import { feastSources, pageSlug } from "../feast-links.js";

describe("feast link audit rules", () => {
  it("flags a Wikipedia disambiguation page", () => {
    assert.equal(isDisambiguation({ pageprops: { disambiguation: "" }, title: "Cecilia" }), true);
    assert.equal(isDisambiguation({ title: "Saint Cecilia", categories: [{ title: "Category:Christian saints" }] }), false);
    assert.equal(isDisambiguation({ title: "Cecilia", categories: [{ title: "Category:All article disambiguation pages" }] }), true);
  });

  it("accepts a saint title for a short feast name", () => {
    assert.equal(titleMatches("Cecilia", "Saint Cecilia"), true);
    assert.equal(titleMatches("Cecilia", "Cecilia"), true);
    assert.equal(titleMatches("Holy Family of Jesus, Mary and Joseph", "Holy Family"), true);
  });

  it("points Cecilia at the saint article, not the name page", () => {
    assert.equal(pageSlug("Cecilia"), "Saint_Cecilia");
    const links = feastSources({ name: "Cecilia", m: 11, d: 22, movable: false });
    assert.equal(links.wikipedia, "https://en.wikipedia.org/wiki/Saint_Cecilia");
  });
});
