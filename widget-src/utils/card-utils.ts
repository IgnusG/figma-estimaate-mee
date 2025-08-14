import {
  PlayingCard,
  Suit,
  Rank,
  HandEvaluation,
  PokerHand,
  PokerWinner,
} from "./types";

// Create a standard 52-card deck
export function createDeck(): PlayingCard[] {
  const suits: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
  const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

  const deck: PlayingCard[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        id: `${rank}-${suit}`,
      });
    }
  }

  return deck;
}

// Shuffle an array using Fisher-Yates algorithm
export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Draw a random card from the deck
export function drawRandomCard(): PlayingCard {
  const deck = createDeck();
  const randomIndex = Math.floor(Math.random() * deck.length);
  return deck[randomIndex];
}

// Add a card to participant's collection (max 5 cards)
export function addCardToParticipant(
  existingCards: PlayingCard[] = [],
): PlayingCard[] {
  const newCard = drawRandomCard();
  const updatedCards = [...existingCards];

  // If already at max capacity, remove a random card
  if (updatedCards.length >= 5) {
    const randomIndex = Math.floor(Math.random() * updatedCards.length);
    updatedCards.splice(randomIndex, 1);
  }

  updatedCards.push(newCard);
  return updatedCards;
}

// Sort cards for display (ascending order by rank, then by suit)
export function sortCards(cards: PlayingCard[]): PlayingCard[] {
  const rankOrder: Record<Rank, number> = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  const suitOrder: Record<Suit, number> = {
    clubs: 1,
    diamonds: 2,
    hearts: 3,
    spades: 4,
  };

  return [...cards].sort((a, b) => {
    const rankDiff = rankOrder[a.rank] - rankOrder[b.rank];
    if (rankDiff !== 0) return rankDiff;
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

// Get card display symbol
export function getCardSymbol(card: PlayingCard): string {
  const suitSymbols: Record<Suit, string> = {
    clubs: "♣",
    diamonds: "♦",
    hearts: "♥",
    spades: "♠",
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

// Get card display symbol with consistent formatting for poker results
export function getCardSymbolFormatted(card: PlayingCard): string {
  const suitSymbols: Record<Suit, string> = {
    clubs: "♣",
    diamonds: "♦",
    hearts: "♥",
    spades: "♠",
  };

  // Use fixed-width formatting for more consistent appearance
  const rank = card.rank.toString().padStart(2, " ");
  return `${rank}${suitSymbols[card.suit]}`;
}

// Convert rank to numeric value for poker evaluation
function getRankValue(rank: Rank): number {
  if (typeof rank === "number") return rank;
  switch (rank) {
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    case "A":
      return 14;
    default:
      return 0;
  }
}

// Check if cards form a straight
function isStraight(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => a - b);

  // Check for regular straight
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      // Check for A-2-3-4-5 straight (wheel)
      if (sorted.join(",") === "2,3,4,5,14") return true;
      return false;
    }
  }
  return true;
}

// Check if cards form a flush
function isFlush(suits: string[]): boolean {
  return new Set(suits).size === 1;
}

// Count occurrences of each rank
function countRanks(ranks: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }
  return counts;
}

// Evaluate the best 5-card poker hand from a collection of cards
export function evaluatePokerHand(cards: PlayingCard[]): HandEvaluation {
  // For fewer than 5 cards, only evaluate what we actually have
  const hand = cards.length >= 5 ? cards.slice(0, 5) : [...cards];
  const ranks = hand.map((card) => getRankValue(card.rank));
  const suits = hand.map((card) => card.suit);

  const rankCounts = countRanks(ranks);
  const counts = Object.keys(rankCounts)
    .map((key) => rankCounts[parseInt(key)])
    .sort((a: number, b: number) => b - a);
  const uniqueRanks = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => b - a);

  const isFlushHand = hand.length >= 5 && isFlush(suits);
  const isStraightHand = hand.length >= 5 && isStraight(ranks);

  // Only check for 5-card hands (flush, straight, etc.) if we have 5 cards
  if (hand.length >= 5) {
    // Royal flush: A, K, Q, J, 10 of same suit
    if (
      isFlushHand &&
      isStraightHand &&
      uniqueRanks[0] === 14 &&
      uniqueRanks[1] === 13
    ) {
      return {
        hand: "royal-flush",
        rank: 10,
        cards: hand,
      };
    }

    // Straight flush
    if (isFlushHand && isStraightHand) {
      return {
        hand: "straight-flush",
        rank: 9,
        cards: hand,
      };
    }

    // Flush
    if (isFlushHand) {
      return {
        hand: "flush",
        rank: 6,
        cards: hand,
      };
    }

    // Straight
    if (isStraightHand) {
      return {
        hand: "straight",
        rank: 5,
        cards: hand,
      };
    }
  }

  // Four of a kind (needs at least 4 cards)
  if (hand.length >= 4 && counts[0] === 4) {
    return {
      hand: "four-of-a-kind",
      rank: 8,
      cards: hand,
    };
  }

  // Full house (needs exactly 5 cards)
  if (hand.length === 5 && counts[0] === 3 && counts[1] === 2) {
    return {
      hand: "full-house",
      rank: 7,
      cards: hand,
    };
  }

  // Three of a kind (needs at least 3 cards)
  if (hand.length >= 3 && counts[0] === 3) {
    return {
      hand: "three-of-a-kind",
      rank: 4,
      cards: hand,
    };
  }

  // Two pair (needs at least 4 cards)
  if (hand.length >= 4 && counts[0] === 2 && counts[1] === 2) {
    return {
      hand: "two-pair",
      rank: 3,
      cards: hand,
    };
  }

  // One pair (needs at least 2 cards)
  if (hand.length >= 2 && counts[0] === 2) {
    return {
      hand: "one-pair",
      rank: 2,
      cards: hand,
    };
  }

  // High card
  return {
    hand: "high-card",
    rank: 1,
    cards: hand,
  };
}

// Determine poker winner from participants with cards
export function determinePokerWinner(
  participants: Array<{
    userId: string;
    userName: string;
    cards: PlayingCard[];
  }>,
): PokerWinner | null {
  if (participants.length === 0) return null;

  const evaluations = participants.map((participant) => ({
    userId: participant.userId,
    userName: participant.userName,
    cards: participant.cards,
    evaluation: evaluatePokerHand(participant.cards),
  }));

  // Sort by hand rank (descending), then by high card values
  evaluations.sort((a, b) => {
    if (a.evaluation.rank !== b.evaluation.rank) {
      return b.evaluation.rank - a.evaluation.rank;
    }

    // For same hand types, compare high cards
    const aHighCard = Math.max(
      ...a.evaluation.cards.map((card) => getRankValue(card.rank)),
    );
    const bHighCard = Math.max(
      ...b.evaluation.cards.map((card) => getRankValue(card.rank)),
    );
    return bHighCard - aHighCard;
  });

  const winner = evaluations[0];
  return {
    userId: winner.userId,
    userName: winner.userName,
    hand: winner.evaluation,
    cards: winner.cards,
  };
}

// Get human-readable poker hand name
export function getPokerHandName(hand: PokerHand): string {
  const handNames: Record<PokerHand, string> = {
    "royal-flush": "Royal Flush",
    "straight-flush": "Straight Flush",
    "four-of-a-kind": "Four of a Kind",
    "full-house": "Full House",
    flush: "Flush",
    straight: "Straight",
    "three-of-a-kind": "Three of a Kind",
    "two-pair": "Two Pair",
    "one-pair": "One Pair",
    "high-card": "High Card",
  };

  return handNames[hand];
}
