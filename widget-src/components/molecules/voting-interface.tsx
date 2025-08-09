const { widget } = figma;
const { AutoLayout } = widget;

import { UnifiedCardGrid } from "./unified-card-grid";
import { CardData } from "../../utils/types";

export interface VotingInterfaceProps {
  fibonacciCards: CardData[];
  jokerCards: CardData[];
  selectedValue?: number | string;
  onCardClick: (value: number | string | undefined) => void;
  disabled?: boolean;
}

export function VotingInterface(props: VotingInterfaceProps) {
  return (
    <UnifiedCardGrid
      fibonacciCards={props.fibonacciCards}
      jokerCards={props.jokerCards}
      selectedValue={props.selectedValue}
      onCardClick={props.onCardClick}
      disabled={props.disabled}
    />
  );
}
