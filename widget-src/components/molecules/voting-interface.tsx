const { widget } = figma;
const { AutoLayout } = widget;

import { FibonacciCardGrid } from "./fibonacci-card-grid";
import { JokerCardGrid } from "./joker-card-grid";
import { CardData } from "../../utils/types";

export interface VotingInterfaceProps {
  fibonacciCards: CardData[];
  jokerCards: CardData[];
  selectedValue?: number | string;
  onCardClick: (value: number | string) => void;
  disabled?: boolean;
}

export function VotingInterface(props: VotingInterfaceProps) {
  const handleFibonacciClick = (value: number) => {
    props.onCardClick(value);
  };

  const handleJokerClick = (value: string) => {
    props.onCardClick(value);
  };

  const selectedFibonacci =
    typeof props.selectedValue === "number" ? props.selectedValue : undefined;
  const selectedJoker =
    typeof props.selectedValue === "string" ? props.selectedValue : undefined;

  return (
    <AutoLayout direction="vertical" spacing={24} horizontalAlignItems="center">
      <FibonacciCardGrid
        cards={props.fibonacciCards}
        selectedValue={selectedFibonacci}
        onCardClick={handleFibonacciClick}
        disabled={props.disabled}
      />

      <JokerCardGrid
        cards={props.jokerCards}
        selectedValue={selectedJoker}
        onCardClick={handleJokerClick}
        disabled={props.disabled}
      />
    </AutoLayout>
  );
}
