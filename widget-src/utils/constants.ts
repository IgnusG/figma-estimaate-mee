import { getCardAssetURL } from "./asset-urls";

export const STORY_POINT_CARDS = [
  {
    value: 0,
    title: "No Work",
    tooltip: "No effort required",
    assetPath: getCardAssetURL(0),
  },
  {
    value: 0.5,
    title: "Tiny Task",
    tooltip: "Minimal effort, quick fix",
    assetPath: getCardAssetURL(0.5),
  },
  {
    value: 1,
    title: "Quick Win",
    tooltip: "Very simple, 1-2 hours",
    assetPath: getCardAssetURL(1),
  },
  {
    value: 2,
    title: "Easy Peasy",
    tooltip: "Simple task, half day",
    assetPath: getCardAssetURL(2),
  },
  {
    value: 3,
    title: "Simple Task",
    tooltip: "Straightforward, 1 day",
    assetPath: getCardAssetURL(3),
  },
  {
    value: 5,
    title: "Medium Work",
    tooltip: "Some complexity, 2-3 days",
    assetPath: getCardAssetURL(5),
  },
  {
    value: 8,
    title: "Big Task",
    tooltip: "Complex work, 1 week",
    assetPath: getCardAssetURL(8),
  },
  {
    value: 13,
    title: "Heavy Lift",
    tooltip: "Very complex, 2 weeks",
    assetPath: getCardAssetURL(13),
  },
];

export const JOKER_CARDS = [
  {
    value: "∞",
    title: "Infinite",
    tooltip: "Too big to estimate",
    assetPath: getCardAssetURL("∞"),
  },
  {
    value: "?",
    title: "Unknown",
    tooltip: "Need more information",
    assetPath: getCardAssetURL("?"),
  },
  {
    value: "🍕",
    title: "Pizza Break",
    tooltip: "Let's discuss over food",
    assetPath: getCardAssetURL("🍕"),
  },
  {
    value: "☕",
    title: "Coffee Time",
    tooltip: "Need a break to think",
    assetPath: getCardAssetURL("☕"),
  },
];
