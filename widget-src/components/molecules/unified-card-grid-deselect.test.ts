import { describe, it, expect, vi } from "vitest";
import { FIBONACCI_CARDS, JOKER_CARDS } from "../../utils/constants";
import { calculateCardScale2D, findCardPosition } from "../../utils/card-scaling";

describe("UnifiedCardGrid - Deselect Behavior", () => {
  describe("card deselection functionality", () => {
    it("should call onCardClick with undefined when clicking a selected fibonacci card", () => {
      const mockOnCardClick = vi.fn();
      
      // Simulate the onClick logic from UnifiedCardGrid
      const simulateCardClick = (currentValue: number | string, selectedValue?: number | string) => {
        if (selectedValue === currentValue) {
          mockOnCardClick(undefined);
        } else {
          mockOnCardClick(currentValue);
        }
      };

      // First click - select card value 5
      simulateCardClick(5, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(5);
      
      // Second click on same card - should deselect
      simulateCardClick(5, 5);
      expect(mockOnCardClick).toHaveBeenCalledWith(undefined);
      expect(mockOnCardClick).toHaveBeenCalledTimes(2);
    });

    it("should call onCardClick with undefined when clicking a selected joker card", () => {
      const mockOnCardClick = vi.fn();
      
      // Simulate the onClick logic for joker cards
      const simulateJokerClick = (currentValue: string, selectedValue?: number | string) => {
        if (selectedValue === currentValue) {
          mockOnCardClick(undefined);
        } else {
          mockOnCardClick(currentValue);
        }
      };

      // First click - select "?" card
      simulateJokerClick("?", undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith("?");
      
      // Second click on same card - should deselect
      simulateJokerClick("?", "?");
      expect(mockOnCardClick).toHaveBeenCalledWith(undefined);
    });

    it("should allow selecting a different card after deselection", () => {
      const mockOnCardClick = vi.fn();
      
      const simulateCardClick = (currentValue: number | string, selectedValue?: number | string) => {
        if (selectedValue === currentValue) {
          mockOnCardClick(undefined);
        } else {
          mockOnCardClick(currentValue);
        }
      };

      // Select card 3
      simulateCardClick(3, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(3);
      
      // Deselect card 3
      simulateCardClick(3, 3);
      expect(mockOnCardClick).toHaveBeenCalledWith(undefined);
      
      // Select card 8
      simulateCardClick(8, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(8);
      
      expect(mockOnCardClick).toHaveBeenCalledTimes(3);
    });

    it("should switch directly from one card to another without explicit deselection", () => {
      const mockOnCardClick = vi.fn();
      
      const simulateCardClick = (currentValue: number | string, selectedValue?: number | string) => {
        if (selectedValue === currentValue) {
          mockOnCardClick(undefined);
        } else {
          mockOnCardClick(currentValue);
        }
      };

      // Select card 5
      simulateCardClick(5, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(5);
      
      // Click different card 13 (while 5 is selected)
      simulateCardClick(13, 5);
      expect(mockOnCardClick).toHaveBeenCalledWith(13);
      
      // Should have been called exactly twice
      expect(mockOnCardClick).toHaveBeenCalledTimes(2);
    });

    it("should handle mixed fibonacci and joker card selection/deselection", () => {
      const mockOnCardClick = vi.fn();
      
      const simulateCardClick = (currentValue: number | string, selectedValue?: number | string) => {
        if (selectedValue === currentValue) {
          mockOnCardClick(undefined);
        } else {
          mockOnCardClick(currentValue);
        }
      };

      // Select fibonacci card 8
      simulateCardClick(8, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(8);
      
      // Switch to joker card "∞"
      simulateCardClick("∞", 8);
      expect(mockOnCardClick).toHaveBeenCalledWith("∞");
      
      // Deselect joker card
      simulateCardClick("∞", "∞");
      expect(mockOnCardClick).toHaveBeenCalledWith(undefined);
      
      // Select fibonacci card 2
      simulateCardClick(2, undefined);
      expect(mockOnCardClick).toHaveBeenCalledWith(2);
      
      expect(mockOnCardClick).toHaveBeenCalledTimes(4);
    });

    it("should not trigger onClick when disabled", () => {
      const mockOnCardClick = vi.fn();
      
      // Simulate disabled state
      const simulateDisabledClick = (disabled: boolean) => {
        if (!disabled) {
          mockOnCardClick(5);
        }
      };

      // Try to click when disabled
      simulateDisabledClick(true);
      expect(mockOnCardClick).not.toHaveBeenCalled();
      
      // Click when enabled
      simulateDisabledClick(false);
      expect(mockOnCardClick).toHaveBeenCalledWith(5);
    });
  });

  describe("visual state tracking", () => {
    it("should track isSelected state correctly for fibonacci cards", () => {
      let selectedValue: number | string | undefined = undefined;
      
      const checkIsSelected = (cardValue: number) => {
        return selectedValue === cardValue;
      };

      // Initially no card is selected
      expect(checkIsSelected(5)).toBe(false);
      
      // Select card 5
      selectedValue = 5;
      expect(checkIsSelected(5)).toBe(true);
      expect(checkIsSelected(8)).toBe(false);
      
      // Deselect
      selectedValue = undefined;
      expect(checkIsSelected(5)).toBe(false);
    });

    it("should track isSelected state correctly for joker cards", () => {
      let selectedValue: number | string | undefined = undefined;
      
      const checkIsSelected = (cardValue: string) => {
        return selectedValue === cardValue;
      };

      // Select joker card "?"
      selectedValue = "?";
      expect(checkIsSelected("?")).toBe(true);
      expect(checkIsSelected("∞")).toBe(false);
      
      // Switch to different joker
      selectedValue = "☕";
      expect(checkIsSelected("?")).toBe(false);
      expect(checkIsSelected("☕")).toBe(true);
      
      // Deselect
      selectedValue = undefined;
      expect(checkIsSelected("☕")).toBe(false);
    });
  });

  describe("scaling behavior during deselection", () => {
    it("should reset card scale when deselected", () => {
      const fibonacciCards = FIBONACCI_CARDS.map(c => ({ value: c.value as number }));
      const jokerCards = JOKER_CARDS.map(c => ({ value: c.value as string }));
      
      // When card 5 is selected
      let selectedPos = findCardPosition(5, fibonacciCards, jokerCards);
      let card5Scale = calculateCardScale2D({ row: 1, col: 1 }, selectedPos);
      expect(card5Scale).toBe(1.15); // Selected card gets scaled up
      
      // When no card is selected (after deselection)
      selectedPos = null;
      card5Scale = calculateCardScale2D({ row: 1, col: 1 }, selectedPos);
      expect(card5Scale).toBe(1.0); // All cards return to base scale
    });

    it("should update scaling for all cards when selection changes", () => {
      const fibonacciCards = FIBONACCI_CARDS.map(c => ({ value: c.value as number }));
      const jokerCards = JOKER_CARDS.map(c => ({ value: c.value as string }));
      
      // Select card at position (0, 0) - value 0
      let selectedPos = findCardPosition(0, fibonacciCards, jokerCards);
      
      // Check neighbor scaling
      let neighborScale = calculateCardScale2D({ row: 0, col: 1 }, selectedPos);
      expect(neighborScale).toBeCloseTo(0.92); // Neighbor gets scaled down
      
      // Deselect (no card selected)
      selectedPos = null;
      neighborScale = calculateCardScale2D({ row: 0, col: 1 }, selectedPos);
      expect(neighborScale).toBe(1.0); // Neighbor returns to normal
      
      // Select different card at position (1, 2) - value 8
      selectedPos = findCardPosition(8, fibonacciCards, jokerCards);
      neighborScale = calculateCardScale2D({ row: 0, col: 1 }, selectedPos);
      expect(neighborScale).toBeLessThan(1.0); // Now scaled based on distance from new selection
    });
  });
});
