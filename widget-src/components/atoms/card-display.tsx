const { widget } = figma;
const { AutoLayout, Text } = widget;

import { PlayingCard } from "../../utils/types";
import { Suit } from "./suit";

export interface CardDisplayProps {
  card: PlayingCard;
}

export function CardDisplay(props: CardDisplayProps) {
  return (
    <AutoLayout
      direction="horizontal"
      spacing={0}
      horizontalAlignItems="center"
    >
      <Text fontSize={12}>{props.card.rank}</Text>
      <Suit value={props.card.suit} />
    </AutoLayout>
  );
}
