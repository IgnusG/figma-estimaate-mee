const ASSET_BASE_URL =
  "https://raw.githubusercontent.com/IgnusG/figma-estimaate-mee/main/assets";

export const STORY_POINT_CARDS = [
  {
    value: 0,
    title: "Already Done!",
    tooltip: "We are already done, and we haven't even started yet",
    assetPath: `${ASSET_BASE_URL}/story-points-0.jpg`,
  },
  {
    value: 0.5,
    title: "Tiny Change",
    tooltip: "I'll be finished before you have time to grab coffee",
    assetPath: `${ASSET_BASE_URL}/story-points-0.5.jpg`,
  },
  {
    value: 1,
    title: "Quick Win",
    tooltip: "Tell PM it's going to take a day and then scroll Instagram for 6 hours",
    assetPath: `${ASSET_BASE_URL}/story-points-1.jpg`,
  },
  {
    value: 2,
    title: "Easy Peasy",
    tooltip: "Half a day should do it",
    assetPath: `${ASSET_BASE_URL}/story-points-2.jpg`,
  },
  {
    value: 3,
    title: "Doable",
    tooltip: "A task a day keeps the manager at bay",
    assetPath: `${ASSET_BASE_URL}/story-points-3.jpg`,
  },
  {
    value: 5,
    title: "Medium Sized",
    tooltip: "2-3 days later and it will be just about done - maybe",
    assetPath: `${ASSET_BASE_URL}/story-points-5.jpg`,
  },
  {
    value: 8,
    title: "Big One",
    tooltip: "We might be ready by next week?",
    assetPath: `${ASSET_BASE_URL}/story-points-8.jpg`,
  },
  {
    value: 13,
    title: "Heavy Lift",
    tooltip: "Ladies and gentlement, it's a sprint worth of effort",
    assetPath: `${ASSET_BASE_URL}/story-points-13.jpg`,
  },
];

export const JOKER_CARDS = [
  {
    value: "∞",
    title: "Forever",
    tooltip: "This is way too big to estimate buddy",
    assetPath: `${ASSET_BASE_URL}/special-infinity.jpg`,
  },
  {
    value: "?",
    title: "I don't know",
    tooltip: "No idea what's this about?",
    assetPath: `${ASSET_BASE_URL}/special-idk.jpg`,
  },
  {
    value: "🍦",
    title: "Ice Cream!",
    tooltip: "Emad is inviting you to an ice cream party",
    assetPath: `${ASSET_BASE_URL}/special-ice-cream.jpg`,
  },
  {
    value: "☕",
    title: "I need coffee",
    tooltip: "Need a break to think - let's get some coffee",
    assetPath: `${ASSET_BASE_URL}/special-coffee.jpg`,
  },
];
