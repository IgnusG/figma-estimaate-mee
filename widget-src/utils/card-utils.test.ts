import { describe, it, expect } from "vitest";
import {
  createDeck,
  shuffleDeck,
  drawRandomCard,
  addCardToParticipant,
  sortCards,
  getCardSymbol,
  evaluatePokerHand,
  determinePokerWinner,
  getPokerHandName,
} from "./card-utils";
import { PlayingCard, Suit, Rank } from "./types";

describe("Card Utils", () => {
  describe("createDeck", () => {
    it("should create a standard 52-card deck", () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it("should contain all suits and ranks", () => {
      const deck = createDeck();
      const suits: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
      const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

      // Check all combinations exist
      suits.forEach((suit) => {
        ranks.forEach((rank) => {
          const cardExists = deck.some(
            (card) => card.suit === suit && card.rank === rank,
          );
          expect(cardExists).toBe(true);
        });
      });
    });

    it("should have unique card IDs", () => {
      const deck = createDeck();
      const ids = deck.map((card) => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(52);
    });
  });

  describe("shuffleDeck", () => {
    it("should return same number of cards", () => {
      const originalDeck = createDeck();
      const shuffled = shuffleDeck(originalDeck);
      expect(shuffled).toHaveLength(52);
    });

    it("should contain all original cards", () => {
      const originalDeck = createDeck();
      const shuffled = shuffleDeck(originalDeck);

      originalDeck.forEach((originalCard) => {
        const cardExists = shuffled.some(
          (card) =>
            card.id === originalCard.id &&
            card.suit === originalCard.suit &&
            card.rank === originalCard.rank,
        );
        expect(cardExists).toBe(true);
      });
    });

    it("should not modify original deck", () => {
      const originalDeck = createDeck();
      const originalFirst = originalDeck[0];
      shuffleDeck(originalDeck);
      expect(originalDeck[0]).toEqual(originalFirst);
    });
  });

  describe("drawRandomCard", () => {
    it("should return a valid playing card", () => {
      const card = drawRandomCard();
      expect(card).toHaveProperty("suit");
      expect(card).toHaveProperty("rank");
      expect(card).toHaveProperty("id");
    });

    it("should return different cards on multiple calls", () => {
      const cards = Array.from({ length: 10 }, () => drawRandomCard());
      const uniqueCards = new Set(cards.map((c) => c.id));
      // Should have some variety (not all identical)
      expect(uniqueCards.size).toBeGreaterThan(1);
    });
  });

  describe("addCardToParticipant", () => {
    it("should add card to empty collection", () => {
      const result = addCardToParticipant([]);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("suit");
      expect(result[0]).toHaveProperty("rank");
    });

    it("should add card to existing collection under 5", () => {
      const existingCards: PlayingCard[] = [
        { suit: "hearts", rank: 2, id: "2-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
      ];
      const result = addCardToParticipant(existingCards);
      expect(result).toHaveLength(3);
      expect(result).toContain(existingCards[0]);
      expect(result).toContain(existingCards[1]);
    });

    it("should maintain max 5 cards", () => {
      const existingCards: PlayingCard[] = [
        { suit: "hearts", rank: 2, id: "2-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
        { suit: "diamonds", rank: "K", id: "K-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: "Q", id: "Q-hearts" },
      ];
      const result = addCardToParticipant(existingCards);
      expect(result).toHaveLength(5);
    });

    it("should remove random card when at capacity", () => {
      const existingCards: PlayingCard[] = [
        { suit: "hearts", rank: 2, id: "2-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
        { suit: "diamonds", rank: "K", id: "K-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: "Q", id: "Q-hearts" },
      ];
      const result = addCardToParticipant(existingCards);

      // Should have exactly 5 cards
      expect(result).toHaveLength(5);

      // Should contain a new card (not all original cards)
      const originalIds = existingCards.map((c) => c.id);
      const resultIds = result.map((c) => c.id);
      const hasNewCard = resultIds.some((id) => !originalIds.includes(id));
      expect(hasNewCard).toBe(true);
    });
  });

  describe("sortCards", () => {
    it("should sort cards by rank ascending", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: 2, id: "2-clubs" },
        { suit: "diamonds", rank: "K", id: "K-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
      ];

      const sorted = sortCards(cards);
      expect(sorted[0].rank).toBe(2);
      expect(sorted[1].rank).toBe(7);
      expect(sorted[2].rank).toBe("K");
      expect(sorted[3].rank).toBe("A");
    });

    it("should sort by suit when ranks are equal", () => {
      const cards: PlayingCard[] = [
        { suit: "spades", rank: 5, id: "5-spades" },
        { suit: "clubs", rank: 5, id: "5-clubs" },
        { suit: "hearts", rank: 5, id: "5-hearts" },
        { suit: "diamonds", rank: 5, id: "5-diamonds" },
      ];

      const sorted = sortCards(cards);
      expect(sorted[0].suit).toBe("clubs");
      expect(sorted[1].suit).toBe("diamonds");
      expect(sorted[2].suit).toBe("hearts");
      expect(sorted[3].suit).toBe("spades");
    });

    it("should not modify original array", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: 2, id: "2-clubs" },
      ];
      const originalFirst = cards[0];

      sortCards(cards);
      expect(cards[0]).toEqual(originalFirst);
    });
  });

  describe("getCardSymbol", () => {
    it("should return correct symbols for number cards", () => {
      const card: PlayingCard = { suit: "hearts", rank: 7, id: "7-hearts" };
      expect(getCardSymbol(card)).toBe("7♥");
    });

    it("should return correct symbols for face cards", () => {
      expect(getCardSymbol({ suit: "clubs", rank: "J", id: "J-clubs" })).toBe(
        "J♣",
      );
      expect(
        getCardSymbol({ suit: "diamonds", rank: "Q", id: "Q-diamonds" }),
      ).toBe("Q♦");
      expect(getCardSymbol({ suit: "spades", rank: "K", id: "K-spades" })).toBe(
        "K♠",
      );
      expect(getCardSymbol({ suit: "hearts", rank: "A", id: "A-hearts" })).toBe(
        "A♥",
      );
    });

    it("should return correct suit symbols", () => {
      expect(getCardSymbol({ suit: "clubs", rank: 2, id: "2-clubs" })).toBe(
        "2♣",
      );
      expect(
        getCardSymbol({ suit: "diamonds", rank: 2, id: "2-diamonds" }),
      ).toBe("2♦");
      expect(getCardSymbol({ suit: "hearts", rank: 2, id: "2-hearts" })).toBe(
        "2♥",
      );
      expect(getCardSymbol({ suit: "spades", rank: 2, id: "2-spades" })).toBe(
        "2♠",
      );
    });
  });

  describe("evaluatePokerHand", () => {
    it("should identify royal flush", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "hearts", rank: "K", id: "K-hearts" },
        { suit: "hearts", rank: "Q", id: "Q-hearts" },
        { suit: "hearts", rank: "J", id: "J-hearts" },
        { suit: "hearts", rank: 10, id: "10-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("royal-flush");
      expect(result.rank).toBe(10);
    });

    it("should identify straight flush", () => {
      const cards: PlayingCard[] = [
        { suit: "clubs", rank: 9, id: "9-clubs" },
        { suit: "clubs", rank: 8, id: "8-clubs" },
        { suit: "clubs", rank: 7, id: "7-clubs" },
        { suit: "clubs", rank: 6, id: "6-clubs" },
        { suit: "clubs", rank: 5, id: "5-clubs" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("straight-flush");
      expect(result.rank).toBe(9);
    });

    it("should identify four of a kind", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
        { suit: "diamonds", rank: "A", id: "A-diamonds" },
        { suit: "spades", rank: "A", id: "A-spades" },
        { suit: "hearts", rank: 2, id: "2-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("four-of-a-kind");
      expect(result.rank).toBe(8);
    });

    it("should identify full house", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "K", id: "K-hearts" },
        { suit: "clubs", rank: "K", id: "K-clubs" },
        { suit: "diamonds", rank: "K", id: "K-diamonds" },
        { suit: "spades", rank: 2, id: "2-spades" },
        { suit: "hearts", rank: 2, id: "2-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("full-house");
      expect(result.rank).toBe(7);
    });

    it("should identify flush", () => {
      const cards: PlayingCard[] = [
        { suit: "diamonds", rank: "A", id: "A-diamonds" },
        { suit: "diamonds", rank: 10, id: "10-diamonds" },
        { suit: "diamonds", rank: 8, id: "8-diamonds" },
        { suit: "diamonds", rank: 5, id: "5-diamonds" },
        { suit: "diamonds", rank: 3, id: "3-diamonds" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("flush");
      expect(result.rank).toBe(6);
    });

    it("should identify straight", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: 10, id: "10-hearts" },
        { suit: "clubs", rank: 9, id: "9-clubs" },
        { suit: "diamonds", rank: 8, id: "8-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: 6, id: "6-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("straight");
      expect(result.rank).toBe(5);
    });

    it("should identify wheel straight (A-2-3-4-5)", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: 5, id: "5-clubs" },
        { suit: "diamonds", rank: 4, id: "4-diamonds" },
        { suit: "spades", rank: 3, id: "3-spades" },
        { suit: "hearts", rank: 2, id: "2-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("straight");
      expect(result.rank).toBe(5);
    });

    it("should identify three of a kind", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "Q", id: "Q-hearts" },
        { suit: "clubs", rank: "Q", id: "Q-clubs" },
        { suit: "diamonds", rank: "Q", id: "Q-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: 3, id: "3-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("three-of-a-kind");
      expect(result.rank).toBe(4);
    });

    it("should identify two pair", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "K", id: "K-hearts" },
        { suit: "clubs", rank: "K", id: "K-clubs" },
        { suit: "diamonds", rank: 7, id: "7-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: 3, id: "3-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("two-pair");
      expect(result.rank).toBe(3);
    });

    it("should identify one pair", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
        { suit: "diamonds", rank: "K", id: "K-diamonds" },
        { suit: "spades", rank: 7, id: "7-spades" },
        { suit: "hearts", rank: 3, id: "3-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("one-pair");
      expect(result.rank).toBe(2);
    });

    it("should identify high card", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: "K", id: "K-clubs" },
        { suit: "diamonds", rank: "Q", id: "Q-diamonds" },
        { suit: "spades", rank: 9, id: "9-spades" },
        { suit: "hearts", rank: 7, id: "7-hearts" },
      ];

      const result = evaluatePokerHand(cards);
      expect(result.hand).toBe("high-card");
      expect(result.rank).toBe(1);
    });

    it("should handle less than 5 cards by padding", () => {
      const cards: PlayingCard[] = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: "A", id: "A-clubs" },
      ];

      const result = evaluatePokerHand(cards);
      // With padding logic adding 3 cards of rank 2, this becomes a full house (2 Aces + 3 twos)
      expect(result.hand).toBe("full-house");
      expect(result.cards).toHaveLength(5);
    });
  });

  describe("determinePokerWinner", () => {
    it("should determine winner with different hand ranks", () => {
      const participants = [
        {
          userId: "user1",
          userName: "Alice",
          cards: [
            { suit: "hearts" as Suit, rank: "A" as Rank, id: "A-hearts" },
            { suit: "clubs" as Suit, rank: "A" as Rank, id: "A-clubs" },
            { suit: "diamonds" as Suit, rank: "K" as Rank, id: "K-diamonds" },
            { suit: "spades" as Suit, rank: 7 as Rank, id: "7-spades" },
            { suit: "hearts" as Suit, rank: 3 as Rank, id: "3-hearts" },
          ],
        },
        {
          userId: "user2",
          userName: "Bob",
          cards: [
            { suit: "hearts" as Suit, rank: "K" as Rank, id: "K-hearts" },
            { suit: "clubs" as Suit, rank: "K" as Rank, id: "K-clubs" },
            { suit: "diamonds" as Suit, rank: "K" as Rank, id: "K-diamonds" },
            { suit: "spades" as Suit, rank: 2 as Rank, id: "2-spades" },
            { suit: "hearts" as Suit, rank: 2 as Rank, id: "2-hearts" },
          ],
        },
      ];

      const winner = determinePokerWinner(participants);
      expect(winner).not.toBeNull();
      expect(winner!.userName).toBe("Bob"); // Full house beats pair
      expect(winner!.hand.hand).toBe("full-house");
    });

    it("should handle tie by high card", () => {
      const participants = [
        {
          userId: "user1",
          userName: "Alice",
          cards: [
            { suit: "hearts" as Suit, rank: "A" as Rank, id: "A-hearts" },
            { suit: "clubs" as Suit, rank: "A" as Rank, id: "A-clubs" },
            { suit: "diamonds" as Suit, rank: "K" as Rank, id: "K-diamonds" },
            { suit: "spades" as Suit, rank: 7 as Rank, id: "7-spades" },
            { suit: "hearts" as Suit, rank: 3 as Rank, id: "3-hearts" },
          ],
        },
        {
          userId: "user2",
          userName: "Bob",
          cards: [
            { suit: "clubs" as Suit, rank: "K" as Rank, id: "K-clubs2" },
            { suit: "diamonds" as Suit, rank: "K" as Rank, id: "K-diamonds2" },
            { suit: "spades" as Suit, rank: "Q" as Rank, id: "Q-spades" },
            { suit: "hearts" as Suit, rank: 8 as Rank, id: "8-hearts" },
            { suit: "clubs" as Suit, rank: 4 as Rank, id: "4-clubs" },
          ],
        },
      ];

      const winner = determinePokerWinner(participants);
      expect(winner).not.toBeNull();
      expect(winner!.userName).toBe("Alice"); // Pair of Aces beats pair of Kings
    });

    it("should return null for empty participants", () => {
      const winner = determinePokerWinner([]);
      expect(winner).toBeNull();
    });

    it("should handle single participant", () => {
      const participants = [
        {
          userId: "user1",
          userName: "Alice",
          cards: [
            { suit: "hearts" as Suit, rank: "A" as Rank, id: "A-hearts" },
            { suit: "clubs" as Suit, rank: 2 as Rank, id: "2-clubs" },
          ],
        },
      ];

      const winner = determinePokerWinner(participants);
      expect(winner).not.toBeNull();
      expect(winner!.userName).toBe("Alice");
    });
  });

  describe("getPokerHandName", () => {
    it("should return correct hand names", () => {
      expect(getPokerHandName("royal-flush")).toBe("Royal Flush");
      expect(getPokerHandName("straight-flush")).toBe("Straight Flush");
      expect(getPokerHandName("four-of-a-kind")).toBe("Four of a Kind");
      expect(getPokerHandName("full-house")).toBe("Full House");
      expect(getPokerHandName("flush")).toBe("Flush");
      expect(getPokerHandName("straight")).toBe("Straight");
      expect(getPokerHandName("three-of-a-kind")).toBe("Three of a Kind");
      expect(getPokerHandName("two-pair")).toBe("Two Pair");
      expect(getPokerHandName("one-pair")).toBe("One Pair");
      expect(getPokerHandName("high-card")).toBe("High Card");
    });
  });
});
