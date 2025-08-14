// Configuration for consensus-based card quality probabilities
export interface CardQualityProbabilities {
  high: number; // Percentage chance for high cards (J, Q, K, A)
  medium: number; // Percentage chance for medium cards (7, 8, 9, 10)
  low: number; // Percentage chance for low cards (2, 3, 4, 5, 6)
}

export const CARD_QUALITY_CONFIG = {
  // Perfect consensus - everyone voted the same
  perfectConsensus: { high: 35, medium: 50, low: 15 },

  // Majority voters - voted for the plurality choice
  majorityVoter: { high: 40, medium: 45, low: 15 },

  // Close to majority - within ±1 point of plurality
  closeToMajority: { high: 25, medium: 50, low: 25 },

  // Far from majority - ±2+ points from plurality
  farFromMajority: { high: 15, medium: 35, low: 50 },

  // Special card voters (when special cards are NOT majority)
  specialCardVoter: { high: 20, medium: 40, low: 40 },

  // Special card penalty (when special cards ARE majority)
  specialCardPenalty: { high: 0, medium: 40, low: 60 },

  // No clear majority - tied votes
  noMajority: { high: 25, medium: 45, low: 30 },
} as const;

export type CardQualityCategory = keyof typeof CARD_QUALITY_CONFIG;

// Card quality tier definitions
export const CARD_TIERS = {
  high: ["J", "Q", "K", "A"],
  medium: [7, 8, 9, 10],
  low: [2, 3, 4, 5, 6],
} as const;

// Special card values that are considered non-numeric
export const SPECIAL_CARD_VALUES = ["🤷‍♀️", "☕", "∞", "?"];
