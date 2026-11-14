// BibleVerse Plus entitlement. Payments stay off until site.json turns the flag on
// and a RevenueCat public SDK key is present. No charge happens in this module.

export const EMPTY_SITE = {
  plusEnabled: false,
  revenueCatAppleApiKey: "",
  revenueCatGoogleApiKey: "",
  revenueCatWebApiKey: "",
  revenueCatEntitlementId: "plus",
};

export function siteConfig(globalObj = typeof window !== "undefined" ? window : {}) {
  const site = globalObj.BIBLEVERSE_SITE || {};
  return {
    ...EMPTY_SITE,
    ...site,
    plusEnabled: site.plusEnabled === true,
    revenueCatEntitlementId: site.revenueCatEntitlementId || "plus",
  };
}

export function revenueCatKey(site, platform) {
  if (platform === "ios") return site.revenueCatAppleApiKey || "";
  if (platform === "android") return site.revenueCatGoogleApiKey || "";
  return site.revenueCatWebApiKey || "";
}

// ready: the app may call Purchases.configure({ apiKey }) then purchase the current offering.
// flag-off and missing-api-key must not touch the network.
export function purchaseAvailability(site, platform) {
  if (!site.plusEnabled) return { ready: false, reason: "flag-off" };
  if (!revenueCatKey(site, platform)) return { ready: false, reason: "missing-api-key" };
  return { ready: true, reason: "configured", entitlementId: site.revenueCatEntitlementId };
}

export function readEntitlement(store) {
  return store.getItem("bibleverse-plus") === "1"
    ? { active: true, source: "device" }
    : { active: false, source: "free" };
}
