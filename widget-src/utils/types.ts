export interface Vote {
  userId: string;
  userName: string;
  value: number | string;
  timestamp: number;
}

export interface SessionState {
  status: "waiting" | "voting" | "revealed";
  participants: string[];
  participantsSnapshot?: Participant[]; // Snapshot of participants when results revealed
}

export interface Participant {
  userId: string;
  userName: string;
  joinedAt: number;
  cards?: PlayingCard[];
  cardReplacementsUsed?: number; // Track how many card replacements used this turn
}

export interface VoteResult {
  value: number | string;
  participants: Array<{
    name: string;
    userId: string;
  }>;
  count: number;
}

export type SessionStatus = "waiting" | "voting" | "revealed";

export interface CardData {
  value: number | string;
  title: string;
  tooltip: string;
  assetPath: string;
}

// Type for Figma SyncedMap which doesn't fully match Map interface
export type SyncedMapLike<T> = {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  keys(): string[];
  size: number;
};

// Playing card types for gamification
export type Suit = "clubs" | "diamonds" | "hearts" | "spades";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A";

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for the card
}

export type PokerHand =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

export interface HandEvaluation {
  hand: PokerHand;
  rank: number; // Higher number = better hand
  cards: PlayingCard[]; // The 5 cards that make up the hand
  kickers?: PlayingCard[]; // Additional cards for tiebreaking
}

export interface PokerWinner {
  userId: string;
  userName: string;
  hand: HandEvaluation;
  cards: PlayingCard[];
}
