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
  // Split cards into two rows: first 5 cards, then remaining 3 cards
  const firstRowCards = props.cards.slice(0, 5);
  const secondRowCards = props.cards.slice(5);

  // Function to render a row of cards with independent scaling
  const renderCardRow = (rowCards: CardData[]) => {
    // Find the selected card index within this row
    const selectedIndex =
      props.selectedValue !== undefined
        ? rowCards.findIndex((card) => card.value === props.selectedValue)
        : -1;

    return (
      <AutoLayout
        direction="horizontal"
        spacing={10}
        horizontalAlignItems="center"
        padding={{ horizontal: 12, vertical: 8 }}
      >
        {rowCards.map((card, index) => {
          const isSelected = props.selectedValue === card.value;

          // Calculate card scale based on distance from selected card within this row
          let cardScale;
          if (selectedIndex === -1) {
            // No selection in this row - all cards same size
            cardScale = 1.0;
          } else {
            // Selection exists in this row - scale based on distance from selected card
            const distanceFromSelected = Math.abs(index - selectedIndex);
            // Selected card = 1.15 scale (slightly less dramatic), others decrease by 0.08 per step
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
    <AutoLayout direction="vertical" spacing={12} horizontalAlignItems="center">
      {/* First row: 5 cards */}
      {renderCardRow(firstRowCards)}

      {/* Second row: 3 cards */}
      {renderCardRow(secondRowCards)}
    </AutoLayout>
  );
}
