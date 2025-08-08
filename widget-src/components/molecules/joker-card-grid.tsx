const { widget } = figma;
const { AutoLayout } = widget;

import { JokerCard } from "../atoms/joker-card";
import { CardData } from "../../utils/types";

export interface JokerCardGridProps {
  cards: CardData[];
  selectedValue?: string;
  onCardClick: (value: string) => void;
  disabled?: boolean;
}

export function JokerCardGrid(props: JokerCardGridProps) {
  // Find the selected card index
  const selectedIndex =
    props.selectedValue !== undefined
      ? props.cards.findIndex((card) => card.value === props.selectedValue)
      : -1;

  return (
    <AutoLayout
      direction="horizontal"
      spacing={8}
      horizontalAlignItems="center"
      padding={{ horizontal: 12, vertical: 12 }}
      height={110}
    >
      {props.cards.map((card, index) => {
        const isSelected = props.selectedValue === card.value;

        // Calculate card scale based on distance from selected card
        let cardScale;
        if (selectedIndex === -1) {
          // No selection - all cards same size
          cardScale = 1.0;
        } else {
          // Selection exists - scale down based on distance from selected card
          const distanceFromSelected = Math.abs(index - selectedIndex);
          // Selected card = 1.2 scale, others decrease by 0.1 per step
          cardScale = isSelected
            ? 1.2
            : Math.max(0.7, 1.0 - distanceFromSelected * 0.1);
        }

        return (
          <JokerCard
            key={card.value}
            value={card.value as string}
            title={card.title}
            emoji={card.emoji}
            tooltip={card.tooltip}
            isSelected={isSelected}
            cardScale={cardScale}
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
}
