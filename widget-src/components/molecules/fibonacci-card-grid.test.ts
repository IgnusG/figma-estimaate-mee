import { describe, it, expect } from "vitest";

describe("Card Scaling Logic", () => {
  describe("Global card scaling", () => {
    it("should calculate global card scaling correctly", () => {
      const cards = [
        { value: 1, title: "First" },
        { value: 2, title: "Second" },
        { value: 3, title: "Third" },
        { value: 5, title: "Fourth" },
        { value: 8, title: "Fifth" },
        { value: 13, title: "Sixth" }
      ];
      
      const selectedValue = 3; // Third card (globalIndex = 2)
      const globalSelectedIndex = cards.findIndex(card => card.value === selectedValue);
      expect(globalSelectedIndex).toBe(2);
      
      // Test scaling calculation for each card
      const calculateScale = (globalIndex: number, globalSelectedIndex: number) => {
        if (globalSelectedIndex === -1) return 1.0;
        const distanceFromSelected = Math.abs(globalIndex - globalSelectedIndex);
        const isSelected = globalIndex === globalSelectedIndex;
        return isSelected ? 1.15 : Math.max(0.75, 1.0 - distanceFromSelected * 0.08);
      };
      
      // Card 0 (distance 2): 1.0 - 2*0.08 = 0.84
      expect(calculateScale(0, globalSelectedIndex)).toBeCloseTo(0.84);
      // Card 1 (distance 1): 1.0 - 1*0.08 = 0.92  
      expect(calculateScale(1, globalSelectedIndex)).toBeCloseTo(0.92);
      // Card 2 (selected): 1.15
      expect(calculateScale(2, globalSelectedIndex)).toBe(1.15);
      // Card 3 (distance 1): 1.0 - 1*0.08 = 0.92
      expect(calculateScale(3, globalSelectedIndex)).toBeCloseTo(0.92);
      // Card 4 (distance 2): 1.0 - 2*0.08 = 0.84
      expect(calculateScale(4, globalSelectedIndex)).toBeCloseTo(0.84);
      // Card 5 (distance 3): max(0.75, 1.0 - 3*0.08) = max(0.75, 0.76) = 0.76
      expect(calculateScale(5, globalSelectedIndex)).toBeCloseTo(0.76);
    });

    it("should handle minimum scale limit", () => {
      const calculateScale = (distance: number) => {
        return Math.max(0.75, 1.0 - distance * 0.08);
      };
      
      // Large distance should hit minimum
      expect(calculateScale(10)).toBe(0.75); // 1.0 - 10*0.08 = 0.2, but min is 0.75
      expect(calculateScale(4)).toBe(0.75); // 1.0 - 4*0.08 = 0.68, clamped to 0.75 by Math.max
      
      // Test raw calculation without clamping
      const rawCalculation = (distance: number) => 1.0 - distance * 0.08;
      expect(rawCalculation(4)).toBeCloseTo(0.68);
      expect(Math.max(0.75, rawCalculation(4))).toBe(0.75); // Should be clamped to 0.75
    });

    it("should return 1.0 scale when no card is selected", () => {
      const calculateScale = (globalIndex: number, globalSelectedIndex: number) => {
        if (globalSelectedIndex === -1) return 1.0;
        const distanceFromSelected = Math.abs(globalIndex - globalSelectedIndex);
        const isSelected = globalIndex === globalSelectedIndex;
        return isSelected ? 1.15 : Math.max(0.75, 1.0 - distanceFromSelected * 0.08);
      };

      // When no card is selected (globalSelectedIndex = -1)
      expect(calculateScale(0, -1)).toBe(1.0);
      expect(calculateScale(5, -1)).toBe(1.0);
    });
  });

  describe("Row-based to global scaling migration", () => {
    it("should scale across rows, not just within rows", () => {
      // Test that cards in different rows affect each other's scaling
      const firstRowCards = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 5 }];
      const secondRowCards = [{ value: 8 }, { value: 13 }, { value: 21 }, { value: 34 }];
      const allCards = [...firstRowCards, ...secondRowCards];
      
      // Select a card in the second row (index 4 in global array)
      const selectedValue = 8;
      const globalSelectedIndex = allCards.findIndex(card => card.value === selectedValue);
      expect(globalSelectedIndex).toBe(4); // First card of second row
      
      const calculateScale = (globalIndex: number, globalSelectedIndex: number) => {
        if (globalSelectedIndex === -1) return 1.0;
        const distanceFromSelected = Math.abs(globalIndex - globalSelectedIndex);
        const isSelected = globalIndex === globalSelectedIndex;
        return isSelected ? 1.15 : Math.max(0.75, 1.0 - distanceFromSelected * 0.08);
      };
      
      // Test that first row cards (0-3) are affected by second row selection (4)
      // Distance 4: 1.0 - 4*0.08 = 0.68, but clamped to 0.75 by Math.max in the calculation
      expect(calculateScale(0, globalSelectedIndex)).toBe(0.75); // Should be clamped to minimum
      expect(calculateScale(3, globalSelectedIndex)).toBeCloseTo(0.92); // Distance 1
      expect(calculateScale(4, globalSelectedIndex)).toBe(1.15); // Selected card
      expect(calculateScale(5, globalSelectedIndex)).toBeCloseTo(0.92); // Distance 1 in second row
    });
  });
});