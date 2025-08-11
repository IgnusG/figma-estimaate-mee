const { widget } = figma;
const { AutoLayout } = widget;

import { Card } from "../atoms/card";
import { CardData } from "../../utils/types";

export interface CardGridProps {
  cards: CardData[];
  onCardClick: (value: number | string | undefined) => void;
  disabled?: boolean;
}

export function CardGrid(props: CardGridProps) {
  // Split cards into three rows
  const firstRowCards = props.cards.slice(0, 4);
  const secondRowCards = props.cards.slice(4, 8);
  const thirdRowCards = props.cards.slice(8, 12);

  // Function to render a row of cards
  const renderCardRow = (rowCards: CardData[]) => {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={8}
        horizontalAlignItems="center"
        padding={{ horizontal: 0, vertical: 0 }}
      >
        {rowCards.map((card) => {
          return (
            <Card
              key={card.value}
              value={card.value as number}
              title={card.title}
              tooltip={card.tooltip}
              isSelected={false}
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
      {renderCardRow(firstRowCards)}
      {renderCardRow(secondRowCards)}
      {renderCardRow(thirdRowCards)}
    </AutoLayout>
  );
}