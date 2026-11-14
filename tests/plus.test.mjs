import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { purchaseAvailability, readEntitlement, revenueCatKey } from "../plus.js";

const off = {
  plusEnabled: false,
  revenueCatAppleApiKey: "",
  revenueCatGoogleApiKey: "",
  revenueCatWebApiKey: "",
  revenueCatEntitlementId: "plus",
};

describe("plus entitlement", () => {
  it("does not offer a purchase while the flag is off", () => {
    assert.deepEqual(purchaseAvailability(off, "ios"), { ready: false, reason: "flag-off" });
  });

  it("stays offline when the flag is on but no RevenueCat key is set", () => {
    const site = { ...off, plusEnabled: true };
    assert.equal(purchaseAvailability(site, "android").reason, "missing-api-key");
    assert.equal(revenueCatKey(site, "web"), "");
  });

  it("is ready only with the flag and the platform key", () => {
    const site = { ...off, plusEnabled: true, revenueCatAppleApiKey: "appl_public_placeholder" };
    const result = purchaseAvailability(site, "ios");
    assert.equal(result.ready, true);
    assert.equal(result.entitlementId, "plus");
    assert.equal(purchaseAvailability(site, "android").ready, false);
  });

  it("reads a local entitlement without a network call", () => {
    const store = { getItem: () => "1" };
    assert.deepEqual(readEntitlement(store), { active: true, source: "device" });
    assert.equal(readEntitlement({ getItem: () => null }).active, false);
  });
});
