import { describe, it, expect } from "vitest";
import { calculateCardScale2D, findCardPosition } from "../../utils/card-scaling";

describe("Unified Card Grid - 2D Scaling Integration", () => {
  describe("2D card scaling across unified grid", () => {
    const fibonacciCards = [
      { value: 0 }, { value: 0.5 }, { value: 1 }, { value: 2 },
      { value: 3 }, { value: 5 }, { value: 8 }, { value: 13 }
    ];
    const jokerCards = [
      { value: "∞" }, { value: "?" }, { value: "🍕" }, { value: "☕" }
    ];

    it("should calculate 2D scaling for fibonacci cards", () => {
      // Select card at position (0,2) - third card in first row (value: 1)
      const selectedPos = findCardPosition(1, fibonacciCards, jokerCards);
      expect(selectedPos).toEqual({ row: 0, col: 2 });

      // Test cards in same row
      expect(calculateCardScale2D({ row: 0, col: 1 }, selectedPos)).toBeCloseTo(0.92); // Distance 1
      expect(calculateCardScale2D({ row: 0, col: 2 }, selectedPos)).toBe(1.15); // Selected card
      expect(calculateCardScale2D({ row: 0, col: 3 }, selectedPos)).toBeCloseTo(0.92); // Distance 1

      // Test cards in second fibonacci row
      expect(calculateCardScale2D({ row: 1, col: 2 }, selectedPos)).toBeCloseTo(0.92); // Distance 1 (vertically)
      expect(calculateCardScale2D({ row: 1, col: 1 }, selectedPos)).toBeCloseTo(0.84); // Distance 2 (diagonal)
      expect(calculateCardScale2D({ row: 1, col: 3 }, selectedPos)).toBeCloseTo(0.84); // Distance 2 (diagonal)
    });

    it("should scale across fibonacci and joker cards", () => {
      // Select first joker card (row 2, col 0)
      const selectedPos = findCardPosition("∞", fibonacciCards, jokerCards);
      expect(selectedPos).toEqual({ row: 2, col: 0 });

      // Test fibonacci cards scaling when joker is selected
      expect(calculateCardScale2D({ row: 0, col: 0 }, selectedPos)).toBeCloseTo(0.84); // Distance 2 (vertically)
      expect(calculateCardScale2D({ row: 1, col: 0 }, selectedPos)).toBeCloseTo(0.92); // Distance 1 (vertically)
      expect(calculateCardScale2D({ row: 0, col: 1 }, selectedPos)).toBeCloseTo(0.76); // Distance 3 (2 up, 1 right)
      
      // Test other joker cards
      expect(calculateCardScale2D({ row: 2, col: 0 }, selectedPos)).toBe(1.15); // Selected card
      expect(calculateCardScale2D({ row: 2, col: 1 }, selectedPos)).toBeCloseTo(0.92); // Distance 1
      expect(calculateCardScale2D({ row: 2, col: 2 }, selectedPos)).toBeCloseTo(0.84); // Distance 2
      expect(calculateCardScale2D({ row: 2, col: 3 }, selectedPos)).toBeCloseTo(0.76); // Distance 3
    });

    it("should create proper ring effects around selected card", () => {
      // Select center fibonacci card (row 1, col 1) - value: 5
      const selectedPos = findCardPosition(5, fibonacciCards, jokerCards);
      expect(selectedPos).toEqual({ row: 1, col: 1 });

      // Ring 1 (distance 1) - direct neighbors
      const ring1Positions = [
        { row: 1, col: 0 }, // Left
        { row: 1, col: 2 }, // Right  
        { row: 0, col: 1 }, // Up
        { row: 2, col: 1 }  // Down (joker card)
      ];
      ring1Positions.forEach(pos => {
        expect(calculateCardScale2D(pos, selectedPos)).toBeCloseTo(0.92);
      });

      // Ring 2 (distance 2) - diagonal and 2-step neighbors  
      const ring2Positions = [
        { row: 0, col: 0 }, // Up-left diagonal
        { row: 0, col: 2 }, // Up-right diagonal
        { row: 2, col: 0 }, // Down-left diagonal (joker)
        { row: 2, col: 2 }, // Down-right diagonal (joker)
        { row: 1, col: 3 }  // 2 steps right
      ];
      ring2Positions.forEach(pos => {
        expect(calculateCardScale2D(pos, selectedPos)).toBeCloseTo(0.84);
      });
    });

    it("should handle minimum scale clamping", () => {
      // Select corner card (0,0)
      const selectedPos = { row: 0, col: 0 };

      // Far corner should be clamped to minimum
      const farPos = { row: 2, col: 3 }; // Distance 5
      expect(calculateCardScale2D(farPos, selectedPos)).toBe(0.75);
      
      // Verify the calculation would be below minimum without clamping
      const distance = Math.abs(2 - 0) + Math.abs(3 - 0); // Manhattan distance
      expect(distance).toBe(5);
      const unclampedScale = 1.0 - distance * 0.08;
      expect(unclampedScale).toBe(0.6);
      expect(unclampedScale < 0.75).toBe(true);
    });

    it("should return base scale when no card is selected", () => {
      const cardPos = { row: 1, col: 1 };
      expect(calculateCardScale2D(cardPos, null)).toBe(1.0);
    });
  });
});