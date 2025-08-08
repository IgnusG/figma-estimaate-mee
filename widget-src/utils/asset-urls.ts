// Asset URL configuration for GitHub raw files
const ASSET_BASE_URL =
  "https://raw.githubusercontent.com/IgnusG/figma-estimaate-mee/main/assets";

// Mapping of card values to their asset URLs
export const CARD_ASSET_URLS: Record<string | number, string> = {
  // Story point cards
  0: `${ASSET_BASE_URL}/story-points-0.jpg`,
  0.5: `${ASSET_BASE_URL}/story-points-0.5.jpg`,
  1: `${ASSET_BASE_URL}/story-points-1.jpg`,
  2: `${ASSET_BASE_URL}/story-points-2.jpg`,
  3: `${ASSET_BASE_URL}/story-points-3.jpg`,
  5: `${ASSET_BASE_URL}/story-points-5.jpg`,
  8: `${ASSET_BASE_URL}/story-points-8.jpg`,
  13: `${ASSET_BASE_URL}/story-points-13.jpg`,

  // Special joker cards
  "∞": `${ASSET_BASE_URL}/special-infinity.jpg`,
  "?": `${ASSET_BASE_URL}/special-coffee.jpg`, // Using coffee for unknown
  "🍕": `${ASSET_BASE_URL}/special-pizza.jpg`,
  "☕": `${ASSET_BASE_URL}/special-coffee.jpg`,
};

// Helper function to get asset URL for a card value
export function getCardAssetURL(value: string | number): string {
  return CARD_ASSET_URLS[value] || "";
}
