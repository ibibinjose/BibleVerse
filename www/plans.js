// Free starter plans ship with readings. Longer plans stay dormant until Plus is enabled.

export const PLANS = [
  {
    id: "psalms-comfort",
    title: "Psalms of comfort",
    length: "7 days",
    plus: false,
    readings: [
      { ref: "Psalm 23", prompt: "Where did you feel shepherded today?" },
      { ref: "Psalm 46", prompt: "What would it mean to be still?" },
      { ref: "Psalm 27", prompt: "Name one fear, then who is with you." },
      { ref: "Psalm 34", prompt: "Where do you need God to come close?" },
      { ref: "Psalm 91", prompt: "What are you trusting God to hold?" },
      { ref: "Psalm 121", prompt: "Where are you looking for help?" },
      { ref: "Psalm 30", prompt: "What joy has followed a hard night?" },
    ],
  },
  {
    id: "gospels-30",
    title: "The Gospels",
    length: "30 days",
    plus: false,
    readings: [
      ["Matthew 5", "The blessings that open the sermon."],
      ["Matthew 6", "Seek first the kingdom."],
      ["Matthew 7", "Ask, seek, knock."],
      ["Matthew 11", "Come and rest."],
      ["Matthew 13", "The sower and the soil."],
      ["Matthew 14", "Walking toward Jesus on the water."],
      ["Matthew 25", "What you did for the least."],
      ["Matthew 26", "The night he was handed over."],
      ["Matthew 28", "He is risen."],
      ["Mark 1", "The kingdom is at hand."],
      ["Mark 2", "Friends lower a man through the roof."],
      ["Mark 4", "Peace, be still."],
      ["Mark 5", "A daughter and a woman restored."],
      ["Mark 10", "Let the children come."],
      ["Luke 1", "Mary's yes."],
      ["Luke 2", "The night of the birth."],
      ["Luke 4", "The Spirit of the Lord is upon me."],
      ["Luke 10", "The neighbour on the road."],
      ["Luke 15", "Lost, and found."],
      ["Luke 19", "Today salvation has come."],
      ["Luke 23", "Father, forgive them."],
      ["Luke 24", "The road to Emmaus."],
      ["John 1", "The light shines in the darkness."],
      ["John 3", "God so loved the world."],
      ["John 6", "I am the bread of life."],
      ["John 10", "The good shepherd."],
      ["John 11", "Lazarus, come out."],
      ["John 14", "Peace I leave with you."],
      ["John 20", "Peace be with you."],
      ["John 21", "Do you love me? Feed my sheep."],
    ].map(([ref, prompt]) => ({ ref, prompt })),
  },
  {
    id: "scripture-90",
    title: "Ninety days through Scripture",
    length: "90 days",
    plus: true,
    readings: [],
  },
];

export function startablePlans(plusEnabled) {
  return PLANS.filter((plan) => !plan.plus || plusEnabled === true);
}

export function lockedPlans(plusEnabled) {
  if (plusEnabled === true) return [];
  return PLANS.filter((plan) => plan.plus);
}

export function readPlanProgress(store, id) {
  try {
    const all = JSON.parse(store.getItem("bibleverse-plans") || "{}");
    const days = all && Array.isArray(all[id]) ? all[id].filter((n) => Number.isInteger(n)) : [];
    return days;
  } catch {
    return [];
  }
}

export function togglePlanDay(store, id, dayIndex) {
  const all = (() => { try { return JSON.parse(store.getItem("bibleverse-plans") || "{}") || {}; } catch { return {}; } })();
  const cur = new Set(readPlanProgress(store, id));
  if (cur.has(dayIndex)) cur.delete(dayIndex); else cur.add(dayIndex);
  all[id] = [...cur].sort((a, b) => a - b);
  store.setItem("bibleverse-plans", JSON.stringify(all));
  return all[id];
}
