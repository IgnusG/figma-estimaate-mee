import { describe, it, expect } from "vitest";
import { 
  calculateManhattanDistance, 
  calculateEuclideanDistance,
  calculateCardScale2D,
  findCardPosition,
  createPositions,
} from "./card-scaling";

describe("Card Scaling 2D System", () => {
  describe("Distance calculations", () => {
    it("should calculate Manhattan distance correctly", () => {
      // Same position
      expect(calculateManhattanDistance({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(0);
      
      // Horizontal distance
      expect(calculateManhattanDistance({ row: 0, col: 0 }, { row: 0, col: 2 })).toBe(2);
      
      // Vertical distance
      expect(calculateManhattanDistance({ row: 0, col: 0 }, { row: 2, col: 0 })).toBe(2);
      
      // Diagonal distance (L-shaped)
      expect(calculateManhattanDistance({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(2);
      expect(calculateManhattanDistance({ row: 0, col: 0 }, { row: 2, col: 3 })).toBe(5);
    });

    it("should calculate Euclidean distance correctly", () => {
      // Same position
      expect(calculateEuclideanDistance({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(0);
      
      // Horizontal/vertical distance
      expect(calculateEuclideanDistance({ row: 0, col: 0 }, { row: 0, col: 3 })).toBe(3);
      expect(calculateEuclideanDistance({ row: 0, col: 0 }, { row: 4, col: 0 })).toBe(4);
      
      // Diagonal distance (Pythagorean)
      expect(calculateEuclideanDistance({ row: 0, col: 0 }, { row: 3, col: 4 })).toBe(5);
      expect(calculateEuclideanDistance({ row: 0, col: 0 }, { row: 1, col: 1 })).toBeCloseTo(Math.sqrt(2));
    });
  });

  describe("2D Card scaling", () => {
    it("should return base scale when no card is selected", () => {
      const cardPos = { row: 0, col: 0 };
      const scale = calculateCardScale2D(cardPos, null);
      expect(scale).toBe(1.0);
    });

    it("should return selected scale for the selected card", () => {
      const cardPos = { row: 1, col: 2 };
      const selectedPos = { row: 1, col: 2 };
      const scale = calculateCardScale2D(cardPos, selectedPos);
      expect(scale).toBe(1.15);
    });

    it("should scale based on Manhattan distance", () => {
      const selectedPos = { row: 1, col: 1 };
      
      // Distance 1 cards (adjacent horizontally/vertically)
      expect(calculateCardScale2D({ row: 1, col: 0 }, selectedPos)).toBeCloseTo(0.92); // 1.0 - 1*0.08
      expect(calculateCardScale2D({ row: 1, col: 2 }, selectedPos)).toBeCloseTo(0.92);
      expect(calculateCardScale2D({ row: 0, col: 1 }, selectedPos)).toBeCloseTo(0.92);
      expect(calculateCardScale2D({ row: 2, col: 1 }, selectedPos)).toBeCloseTo(0.92);
      
      // Distance 2 cards (diagonal neighbors and 2-step horizontal/vertical)
      expect(calculateCardScale2D({ row: 0, col: 0 }, selectedPos)).toBeCloseTo(0.84); // 1.0 - 2*0.08
      expect(calculateCardScale2D({ row: 0, col: 2 }, selectedPos)).toBeCloseTo(0.84);
      expect(calculateCardScale2D({ row: 2, col: 0 }, selectedPos)).toBeCloseTo(0.84);
      expect(calculateCardScale2D({ row: 2, col: 2 }, selectedPos)).toBeCloseTo(0.84);
      expect(calculateCardScale2D({ row: 1, col: 3 }, selectedPos)).toBeCloseTo(0.84); // 2 steps horizontal
    });

    it("should enforce minimum scale", () => {
      const selectedPos = { row: 0, col: 0 };
      
      // Very far card should hit minimum
      const farCard = { row: 2, col: 3 }; // Distance 5
      const scale = calculateCardScale2D(farCard, selectedPos);
      expect(scale).toBe(0.75); // Should be clamped to minimum
      
      // Calculate what it would be without clamping: 1.0 - 5*0.08 = 0.6
      const unclampedScale = 1.0 - 5 * 0.08;
      expect(unclampedScale).toBe(0.6);
      expect(Math.max(0.75, unclampedScale)).toBe(0.75);
    });
  });

  describe("Position mapping", () => {
    it("should create fibonacci positions correctly", () => {
      const cards = [
        { value: 0 }, { value: 0.5 }, { value: 1 }, { value: 2 },
        { value: 3 }, { value: 5 }, { value: 8 }, { value: 13 }
      ];
      
      const positions = createPositions(cards);
      
      // First row (indices 0-3)
      expect(positions[0].position).toEqual({ row: 0, col: 0 });
      expect(positions[1].position).toEqual({ row: 0, col: 1 });
      expect(positions[2].position).toEqual({ row: 0, col: 2 });
      expect(positions[3].position).toEqual({ row: 0, col: 3 });
      
      // Second row (indices 4-7)
      expect(positions[4].position).toEqual({ row: 1, col: 0 });
      expect(positions[5].position).toEqual({ row: 1, col: 1 });
      expect(positions[6].position).toEqual({ row: 1, col: 2 });
      expect(positions[7].position).toEqual({ row: 1, col: 3 });
    });
  });

  describe("Card position finding", () => {
    const storyPointCards = [
      { value: 0 }, { value: 0.5 }, { value: 1 }, { value: 2 },
      { value: 3 }, { value: 5 }, { value: 8 }, { value: 13 }
    ];
    const jokerCards = [
      { value: "∞" }, { value: "?" }, { value: "🍕" }, { value: "☕" }
    ];
    const cards = [...storyPointCards, ...jokerCards];

    it("should find fibonacci card positions", () => {
      expect(findCardPosition(0, cards)).toEqual({ row: 0, col: 0 });
      expect(findCardPosition(2, cards)).toEqual({ row: 0, col: 3 });
      expect(findCardPosition(3, cards)).toEqual({ row: 1, col: 0 });
      expect(findCardPosition(13, cards)).toEqual({ row: 1, col: 3 });
    });

    it("should find joker card positions", () => {
      expect(findCardPosition("∞", cards)).toEqual({ row: 2, col: 0 });
      expect(findCardPosition("?", cards)).toEqual({ row: 2, col: 1 });
      expect(findCardPosition("🍕", cards)).toEqual({ row: 2, col: 2 });
      expect(findCardPosition("☕", cards)).toEqual({ row: 2, col: 3 });
    });

    it("should return null for unknown values", () => {
      expect(findCardPosition(999, cards)).toBeNull();
      expect(findCardPosition("unknown", cards)).toBeNull();
      expect(findCardPosition(undefined, cards)).toBeNull();
    });
  });

  describe("Cross-grid scaling scenarios", () => {
    const storyPointCards = [
      { value: 0 }, { value: 0.5 }, { value: 1 }, { value: 2 },
      { value: 3 }, { value: 5 }, { value: 8 }, { value: 13 }
    ];
    const jokerCards = [
      { value: "∞" }, { value: "?" }, { value: "🍕" }, { value: "☕" }
    ];
    const cards = [...storyPointCards, ...jokerCards];

    it("should scale joker cards when fibonacci card is selected", () => {
      // Select first fibonacci card (0,0)
      const selectedPos = findCardPosition(0, cards);
      expect(selectedPos).toEqual({ row: 0, col: 0 });

      // Test joker card scaling
      const jokerPos = { row: 2, col: 0 }; // First joker card
      const distance = calculateManhattanDistance(jokerPos, selectedPos!);
      expect(distance).toBe(2); // 2 rows down, same column

      const scale = calculateCardScale2D(jokerPos, selectedPos);
      expect(scale).toBeCloseTo(0.84); // 1.0 - 2*0.08
    });

    it("should scale fibonacci cards when joker card is selected", () => {
      // Select first joker card (2,0)  
      const selectedPos = findCardPosition("∞", cards);
      expect(selectedPos).toEqual({ row: 2, col: 0 });

      // Test fibonacci card scaling
      const fibonacciPos = { row: 0, col: 0 }; // First fibonacci card
      const distance = calculateManhattanDistance(fibonacciPos, selectedPos!);
      expect(distance).toBe(2); // 2 rows up, same column

      const scale = calculateCardScale2D(fibonacciPos, selectedPos);
      expect(scale).toBeCloseTo(0.84); // 1.0 - 2*0.08
    });

    it("should create proper ring effects", () => {
      // Select center-ish card in second fibonacci row (1,1)
      const selectedPos = { row: 1, col: 1 };

      // Test ring 1 (distance 1) - adjacent cards
      expect(calculateCardScale2D({ row: 1, col: 0 }, selectedPos)).toBeCloseTo(0.92);
      expect(calculateCardScale2D({ row: 1, col: 2 }, selectedPos)).toBeCloseTo(0.92);
      expect(calculateCardScale2D({ row: 0, col: 1 }, selectedPos)).toBeCloseTo(0.92);
      expect(calculateCardScale2D({ row: 2, col: 1 }, selectedPos)).toBeCloseTo(0.92); // Joker card

      // Test ring 2 (distance 2) - diagonal and 2-step cards
      expect(calculateCardScale2D({ row: 0, col: 0 }, selectedPos)).toBeCloseTo(0.84);
      expect(calculateCardScale2D({ row: 0, col: 2 }, selectedPos)).toBeCloseTo(0.84);
      expect(calculateCardScale2D({ row: 2, col: 0 }, selectedPos)).toBeCloseTo(0.84); // Joker card
      expect(calculateCardScale2D({ row: 2, col: 2 }, selectedPos)).toBeCloseTo(0.84); // Joker card
    });
  });
});