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
    title: "One liner",
    tooltip: "I'll be finished before you have time to grab coffee",
    assetPath: `${ASSET_BASE_URL}/story-points-0.5.jpg`,
  },
  {
    value: 1,
    title: "Quick Win",
    tooltip:
      "Tell PM it's going to take a day and then scroll Instagram for 4 hours",
    assetPath: `${ASSET_BASE_URL}/story-points-1.jpg`,
  },
  {
    value: 2,
    title: "A few unknowns",
    tooltip: "A day should do it - we know almost everything after all",
    assetPath: `${ASSET_BASE_URL}/story-points-2.jpg`,
  },
  {
    value: 3,
    title: "Dependencies are piling up",
    tooltip: "A task every few days keeps the manager at bay",
    assetPath: `${ASSET_BASE_URL}/story-points-3.jpg`,
  },
  {
    value: 5,
    title: "The everything estimate",
    tooltip:
      "You start on Monday and on Friday finish off by bringing production down",
    assetPath: `${ASSET_BASE_URL}/story-points-5.jpg`,
  },
  {
    value: 8,
    title: "It's getting difficult",
    tooltip: "It better be finished before the sprint ends",
    assetPath: `${ASSET_BASE_URL}/story-points-8.jpg`,
  },
  {
    value: 13,
    title: "Heavy Lift",
    tooltip:
      "Ladies and gentlemen, we won't finish this before the sprint ends",
    assetPath: `${ASSET_BASE_URL}/story-points-13.jpg`,
  },
];

export const JOKER_CARDS = [
  {
    value: "∞",
    title: "Will take Forever",
    tooltip: "This is way too big to estimate buddy",
    assetPath: `${ASSET_BASE_URL}/special-infinity.jpg`,
  },
  {
    value: "?",
    title: "What is this about?",
    tooltip: "Still no idea what we are talking about - can't help you",
    assetPath: `${ASSET_BASE_URL}/special-idk.jpg`,
  },
  {
    value: "🍦",
    title: "Time for Ice Cream!",
    tooltip: "Emad is inviting you to an ice cream party",
    assetPath: `${ASSET_BASE_URL}/special-ice-cream.jpg`,
  },
  {
    value: "☕",
    title: "Coffee please",
    tooltip: "Need a break to think - let's get some coffee",
    assetPath: `${ASSET_BASE_URL}/special-coffee.jpg`,
  },
];
