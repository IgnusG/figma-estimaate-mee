const { widget } = figma;
const { AutoLayout } = widget;

import { EstimationCard } from "../atoms/estimation-card";
import { JokerCard } from "../atoms/joker-card";
import { CardData } from "../../utils/types";
import { findCardPosition, calculateCardScale2D } from "../../utils/card-scaling";

export interface UnifiedCardGridProps {
  fibonacciCards: CardData[];
  jokerCards: CardData[];
  selectedValue?: number | string;
  onCardClick: (value: number | string) => void;
  disabled?: boolean;
}

export function UnifiedCardGrid(props: UnifiedCardGridProps) {
  // Find the position of the selected card in the global 2D grid system
  const selectedPosition = findCardPosition(
    props.selectedValue,
    props.fibonacciCards.map(c => ({ value: c.value as number })),
    props.jokerCards.map(c => ({ value: c.value as string }))
  );

  // Split fibonacci cards into two rows: first 4 cards, then remaining 4 cards
  const firstRowCards = props.fibonacciCards.slice(0, 4);
  const secondRowCards = props.fibonacciCards.slice(4);

  // Function to render a row of fibonacci cards
  const renderFibonacciRow = (rowCards: CardData[], rowIndex: number) => {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={-28}
        horizontalAlignItems="center"
        padding={{ horizontal: 0, vertical: 0 }}
      >
        {rowCards.map((card, colIndex) => {
          const isSelected = props.selectedValue === card.value;
          
          // Calculate 2D position for this card
          const cardPosition = { row: rowIndex, col: colIndex };
          
          // Calculate card scale using 2D distance
          const cardScale = calculateCardScale2D(cardPosition, selectedPosition);

          return (
            <EstimationCard
              key={card.value}
              value={card.value as number}
              title={card.title}
              emoji={card.emoji}
              tooltip={card.tooltip}
              isSelected={isSelected}
              cardScale={cardScale}
              assetPath={card.assetPath}
              onClick={() => {
                if (!props.disabled) {
                  props.onCardClick(card.value as number);
                }
              }}
            />
          );
        })}
      </AutoLayout>
    );
  };

  // Function to render joker cards row
  const renderJokerRow = () => {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={-28}
        horizontalAlignItems="center"
        padding={{ horizontal: 0, vertical: 0 }}
      >
        {props.jokerCards.map((card, colIndex) => {
          const isSelected = props.selectedValue === card.value;

          // Calculate 2D position for this joker card (row 2)
          const cardPosition = { row: 2, col: colIndex };
          
          // Calculate card scale using 2D distance
          const cardScale = calculateCardScale2D(cardPosition, selectedPosition);

          return (
            <JokerCard
              key={card.value}
              value={card.value as string}
              title={card.title}
              emoji={card.emoji}
              tooltip={card.tooltip}
              isSelected={isSelected}
              cardScale={cardScale}
              assetPath={card.assetPath}
              onClick={() => {
                if (!props.disabled) {
                  props.onCardClick(card.value as string);
                }
              }}
            />
          );
        })}
      </AutoLayout>
    );
  };

  return (
    <AutoLayout direction="vertical" spacing={-24} horizontalAlignItems="center">
      {/* First fibonacci row: 4 cards */}
      {renderFibonacciRow(firstRowCards, 0)}

      {/* Second fibonacci row: 4 cards */}
      {renderFibonacciRow(secondRowCards, 1)}

      {/* Joker cards row */}
      {renderJokerRow()}
    </AutoLayout>
  );
}