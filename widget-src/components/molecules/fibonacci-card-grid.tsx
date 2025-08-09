const { widget } = figma;
const { AutoLayout } = widget;

import { EstimationCard } from "../atoms/estimation-card";
import { CardData } from "../../utils/types";

export interface FibonacciCardGridProps {
  cards: CardData[];
  selectedValue?: number;
  onCardClick: (value: number) => void;
  disabled?: boolean;
}

export function FibonacciCardGrid(props: FibonacciCardGridProps) {
  // Split cards into two rows: first 4 cards, then remaining 4 cards
  const firstRowCards = props.cards.slice(0, 4);
  const secondRowCards = props.cards.slice(4);

  // Find the selected card index across ALL cards (not just per row)
  const globalSelectedIndex =
    props.selectedValue !== undefined
      ? props.cards.findIndex((card) => card.value === props.selectedValue)
      : -1;

  // Function to render a row of cards with global scaling
  const renderCardRow = (rowCards: CardData[], rowStartIndex: number) => {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={8}
        horizontalAlignItems="center"
        padding={{ horizontal: 6, vertical: 4 }}
      >
        {rowCards.map((card, index) => {
          const isSelected = props.selectedValue === card.value;
          const globalIndex = rowStartIndex + index;

          // Calculate card scale based on distance from selected card across all cards
          let cardScale;
          if (globalSelectedIndex === -1) {
            // No selection - all cards same size
            cardScale = 1.0;
          } else {
            // Selection exists - scale based on distance from selected card
            const distanceFromSelected = Math.abs(globalIndex - globalSelectedIndex);
            // Selected card = 1.15 scale, others decrease by 0.08 per step
            cardScale = isSelected
              ? 1.15
              : Math.max(0.75, 1.0 - distanceFromSelected * 0.08);
          }

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

  return (
    <AutoLayout direction="vertical" spacing={8} horizontalAlignItems="center">
      {/* First row: 4 cards */}
      {renderCardRow(firstRowCards, 0)}

      {/* Second row: 4 cards */}
      {renderCardRow(secondRowCards, 4)}
    </AutoLayout>
  );
}
