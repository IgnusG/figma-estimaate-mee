const { widget } = figma;
const { AutoLayout } = widget;

import { EstimationCard } from "../atoms/estimation-card";
import { CardData } from "../../utils/types";

export interface CardGridProps {
  cards: CardData[];
  selectedValue?: number;
  onCardClick: (value: number | undefined) => void;
  disabled?: boolean;
}

export function CardGrid(props: CardGridProps) {
  // Find the selected card index
  const selectedIndex =
    props.selectedValue !== undefined
      ? props.cards.findIndex((card) => card.value === props.selectedValue)
      : -1;

  // Fixed height to accommodate the largest scaled card (1.2 * 150 = 180)
  const maxCardHeight = Math.round(150 * 1.2);
  const containerHeight = maxCardHeight + 24; // Add padding

  return (
    <AutoLayout
      direction="horizontal"
      spacing={8}
      horizontalAlignItems="center"
      padding={{ horizontal: 12, vertical: 12 }}
      height={containerHeight}
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
}
