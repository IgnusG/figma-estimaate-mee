import { getCardAssetURL } from "./asset-urls";

export const FIBONACCI_CARDS = [
  {
    value: 0,
    title: "No Work",
    emoji: "🚫",
    tooltip: "No effort required",
    assetPath: getCardAssetURL(0),
  },
  {
    value: 0.5,
    title: "Tiny Task",
    emoji: "🤏",
    tooltip: "Minimal effort, quick fix",
    assetPath: getCardAssetURL(0.5),
  },
  {
    value: 1,
    title: "Quick Win",
    emoji: "⚡",
    tooltip: "Very simple, 1-2 hours",
    assetPath: getCardAssetURL(1),
  },
  {
    value: 2,
    title: "Easy Peasy",
    emoji: "😊",
    tooltip: "Simple task, half day",
    assetPath: getCardAssetURL(2),
  },
  {
    value: 3,
    title: "Simple Task",
    emoji: "👍",
    tooltip: "Straightforward, 1 day",
    assetPath: getCardAssetURL(3),
  },
  {
    value: 5,
    title: "Medium Work",
    emoji: "🔨",
    tooltip: "Some complexity, 2-3 days",
    assetPath: getCardAssetURL(5),
  },
  {
    value: 8,
    title: "Big Task",
    emoji: "💪",
    tooltip: "Complex work, 1 week",
    assetPath: getCardAssetURL(8),
  },
  {
    value: 13,
    title: "Heavy Lift",
    emoji: "🏋️",
    tooltip: "Very complex, 2 weeks",
    assetPath: getCardAssetURL(13),
  },
];

export const JOKER_CARDS = [
  {
    value: "∞",
    title: "Infinite",
    emoji: "♾️",
    tooltip: "Too big to estimate",
    assetPath: getCardAssetURL("∞"),
  },
  {
    value: "?",
    title: "Unknown",
    emoji: "🤷",
    tooltip: "Need more information",
    assetPath: getCardAssetURL("?"),
  },
  {
    value: "🍕",
    title: "Pizza Break",
    emoji: "🍕",
    tooltip: "Let's discuss over food",
    assetPath: getCardAssetURL("🍕"),
  },
  {
    value: "☕",
    title: "Coffee Time",
    emoji: "☕",
    tooltip: "Need a break to think",
    assetPath: getCardAssetURL("☕"),
  },
];
