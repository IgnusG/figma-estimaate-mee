const { widget } = figma;
const { AutoLayout } = widget;

import { Card } from "../atoms/card";
import { CardData } from "../../utils/types";
import { findCardPosition, calculateCardScale2D } from "../../utils/card-scaling";

export interface CardGridProps {
  cards: CardData[];
  selectedValue?: number | string;
  onCardClick: (value: number | string | undefined) => void;
  disabled?: boolean;
}

export function CardGrid(props: CardGridProps) {
  // Find the position of the selected card in the global 2D grid system
  const selectedPosition = findCardPosition(
    props.selectedValue,
    props.cards
  );

  // Split cards into three rows
  const firstRowCards = props.cards.slice(0, 4);
  const secondRowCards = props.cards.slice(4, 8);
  const thirdRowCards = props.cards.slice(8, 12);

  // Function to render a row of fibonacci cards
  const renderCardRow = (rowCards: CardData[], rowIndex: number) => {
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
            <Card
              key={card.value}
              value={card.value as number}
              title={card.title}
              tooltip={card.tooltip}
              isSelected={isSelected}
              cardScale={cardScale}
              assetPath={card.assetPath}
              onClick={() => {
                if (!props.disabled) {
                  // Clear selection if clicking the same card, otherwise select it
                  if (props.selectedValue === card.value) {
                    props.onCardClick(undefined);
                  } else {
                    props.onCardClick(card.value as number);
                  }
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
      {renderCardRow(firstRowCards, 0)}
      {renderCardRow(secondRowCards, 1)}
      {renderCardRow(thirdRowCards, 2)}
    </AutoLayout>
  );
}