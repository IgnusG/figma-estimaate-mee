// 2D card scaling utilities

export interface CardPosition {
  row: number;
  col: number;
}

export interface CardWithPosition {
  value: number | string;
  position: CardPosition;
}

/**
 * Calculate Manhattan distance between two 2D positions
 * This treats horizontal and vertical moves equally
 */
export function calculateManhattanDistance(pos1: CardPosition, pos2: CardPosition): number {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}

/**
 * Calculate Euclidean distance between two 2D positions
 * This considers diagonal movement more naturally
 */
export function calculateEuclideanDistance(pos1: CardPosition, pos2: CardPosition): number {
  const rowDiff = pos1.row - pos2.row;
  const colDiff = pos1.col - pos2.col;
  return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
}

/**
 * Calculate card scale based on 2D distance from selected card
 * Uses Manhattan distance for more predictable ring-based scaling
 */
export function calculateCardScale2D(
  cardPosition: CardPosition,
  selectedPosition: CardPosition | null,
  selectedScale: number = 1.15,
  baseScale: number = 1.0,
  scaleDecrement: number = 0.08,
  minScale: number = 0.75
): number {
  if (!selectedPosition) {
    return baseScale;
  }

  const isSelected = cardPosition.row === selectedPosition.row && cardPosition.col === selectedPosition.col;
  if (isSelected) {
    return selectedScale;
  }

  const distance = calculateManhattanDistance(cardPosition, selectedPosition);
  const calculatedScale = baseScale - (distance * scaleDecrement);
  return Math.max(minScale, calculatedScale);
}

/**
 * Create position mapping for fibonacci cards (2 rows of 4)
 */
export function createFibonacciPositions(fibonacciCards: Array<{ value: number }>): CardWithPosition[] {
  return fibonacciCards.map((card, index) => ({
    value: card.value,
    position: {
      row: Math.floor(index / 4), // Row 0 for indices 0-3, Row 1 for indices 4-7
      col: index % 4              // Column 0-3 within each row
    }
  }));
}

/**
 * Create position mapping for joker cards (1 row of 4, positioned as row 2)
 */
export function createJokerPositions(jokerCards: Array<{ value: string }>): CardWithPosition[] {
  return jokerCards.map((card, index) => ({
    value: card.value,
    position: {
      row: 2,     // Joker cards are in row 2 (after fibonacci rows 0 and 1)
      col: index  // Column 0-3
    }
  }));
}

/**
 * Find the position of a selected card value in the combined card system
 */
export function findCardPosition(
  selectedValue: number | string | undefined,
  fibonacciCards: Array<{ value: number }>,
  jokerCards: Array<{ value: string }>
): CardPosition | null {
  if (selectedValue === undefined) {
    return null;
  }

  // Check fibonacci cards first
  const fibonacciIndex = fibonacciCards.findIndex(card => card.value === selectedValue);
  if (fibonacciIndex !== -1) {
    return {
      row: Math.floor(fibonacciIndex / 4),
      col: fibonacciIndex % 4
    };
  }

  // Check joker cards
  const jokerIndex = jokerCards.findIndex(card => card.value === selectedValue);
  if (jokerIndex !== -1) {
    return {
      row: 2,
      col: jokerIndex
    };
  }

  return null;
}